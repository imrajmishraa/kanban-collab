import crypto from "node:crypto";

import {
  PasswordResetModel,
  SessionModel,
  UserModel,
} from "../../infrastructure/db/mongoose/schemas";
import { emailTransport } from "../../infrastructure/email/emailTransport";
import { authLogger } from "../../infrastructure/logging/childLogger";
import { hashPassword } from "../../infrastructure/security/password";
import {
  invalidPasswordResetCodeError,
  passwordResetTooManyAttemptsError,
} from "../../shared/errors/auth/passwordReset";

/**
 * Password recovery, as a six-digit code.
 *
 * There was no recovery at all: the client showed a fake success and the server
 * had no `/forgot-password` or `/reset-password` route, so a user who forgot
 * their password had no way back into their account. The client's own UI already
 * collects six digits, so the server meets it there rather than inventing a link
 * flow the UI would have to be rebuilt for.
 *
 * Rules, all of them because a six-digit code is only a million guesses:
 *
 *   - the code is stored hashed, never in the clear;
 *   - it expires in 15 minutes;
 *   - five wrong guesses kill it, and the next request starts over;
 *   - requesting a new code replaces the old one, so an earlier code cannot be
 *     used after a resend;
 *   - a wrong code and an expired code answer identically, so the endpoint
 *     cannot be used to test whether an account exists;
 *   - a successful reset deletes every session, because the reason to reset a
 *     password is usually that someone else has it.
 */

const CODE_TTL_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/** The code the user reads out of their inbox. */
function generateCode(): string {
  /* `randomInt` is the CSPRNG; `Math.random` here would make the code guessable
     from a few samples. Pad so "000123" is still six digits. */
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * SHA-256, not bcrypt.
 *
 * The value is a six-digit number with a 15-minute life, so a slow hash buys
 * nothing an attacker cannot already brute-force offline — and this is not a
 * password. The hash exists so a database dump is not a list of live codes.
 */
function hashCode(code: string): string {
  return crypto
    .createHash("sha256")
    .update(`password-reset:${code}`)
    .digest("hex");
}

function codesMatch(submitted: string, storedHash: string): boolean {
  const submittedHash = Buffer.from(hashCode(submitted), "hex");
  const stored = Buffer.from(storedHash, "hex");

  if (submittedHash.length !== stored.length) {
    return false;
  }

  return crypto.timingSafeEqual(submittedHash, stored);
}

/**
 * Send a reset code, if the address belongs to an account.
 *
 * Always resolves, whatever the answer: the caller must not be able to tell
 * "no such account" from "code sent", or the endpoint becomes an account
 * enumerator. The distinction lives in the log, not the response.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await UserModel.findOne({ email })
    .select("_id email fullName")
    .lean();

  if (!user) {
    authLogger.info("Password reset requested for an unknown address.");
    return;
  }

  const code = generateCode();

  /* Replace rather than add: one live code per account, so a resend invalidates
     the previous one. */
  await PasswordResetModel.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        codeHash: hashCode(code),
        attempts: 0,
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      },
    },
    { upsert: true, setDefaultsOnInsert: true },
  );

  const minutes = Math.round(CODE_TTL_MS / 60_000);

  try {
    await emailTransport.send({
      to: user.email,
      subject: "Your Kanban Collab password reset code",
      text: [
        `Hi ${user.fullName ?? "there"},`,
        "",
        `Your password reset code is ${code}. It expires in ${minutes} minutes.`,
        "",
        "If you did not ask for this, you can ignore this message — your password has not changed.",
      ].join("\n"),
    });
  } catch (error) {
    /* The code is stored and the response is unchanged; only the delivery
       failed. Logged, because a user who receives nothing will ask. */
    authLogger.error({ err: error }, "Password reset code could not be sent.");
  }

  authLogger.info(
    { userId: user._id.toString() },
    "Password reset code issued.",
  );
}

/**
 * Set a new password from a code.
 *
 * Throws for a wrong, expired or missing code (all the same answer), and for a
 * code that has used up its attempts.
 */
export async function resetPasswordWithCode(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  const user = await UserModel.findOne({ email }).select("_id email").lean();

  if (!user) {
    throw invalidPasswordResetCodeError();
  }

  const reset = await PasswordResetModel.findOne({
    userId: user._id,
    expiresAt: { $gt: new Date() },
  }).lean();

  if (!reset) {
    throw invalidPasswordResetCodeError();
  }

  if (reset.attempts >= MAX_ATTEMPTS) {
    /* Not a wrong guess: the budget is spent. Deleting forces a new request
       rather than letting a sixth guess through. */
    await PasswordResetModel.deleteOne({ _id: reset._id });

    throw passwordResetTooManyAttemptsError();
  }

  if (!codesMatch(code, reset.codeHash)) {
    const updated = await PasswordResetModel.findOneAndUpdate(
      { _id: reset._id },
      { $inc: { attempts: 1 } },
      { new: true, projection: { attempts: 1 } },
    ).lean();

    authLogger.warn(
      { userId: user._id.toString(), attempts: updated?.attempts ?? null },
      "Wrong password reset code.",
    );

    throw invalidPasswordResetCodeError();
  }

  const passwordHash = await hashPassword(newPassword);

  await UserModel.updateOne({ _id: user._id }, { $set: { passwordHash } });

  /* Single use, and every session dies with the old password: the usual reason
     to reset is that somebody else has it. */
  await Promise.all([
    PasswordResetModel.deleteOne({ _id: reset._id }),
    SessionModel.deleteMany({ userId: user._id }),
  ]);

  authLogger.info(
    { userId: user._id.toString() },
    "Password reset — password changed and sessions revoked.",
  );
}
