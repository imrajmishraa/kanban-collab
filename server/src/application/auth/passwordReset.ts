import crypto from "node:crypto";

import { ENV } from "../../config/env";
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
 * A six-digit code is only a million guesses, so every rule here exists to make
 * that number mean something:
 *
 *   - the code is stored as an HMAC, never in the clear, and the key lives in
 *     the environment — a database dump alone cannot be brute-forced offline;
 *   - it expires in 15 minutes;
 *   - five wrong guesses lock the account's reset for 15 minutes, and the count
 *     **survives a resend**: "five guesses, ask for a new code, five more" was
 *     the loop that made the first version's limit decorative;
 *   - an attempt is claimed *before* the code is compared, in one conditional
 *     update, so a burst of parallel requests cannot each take a free guess;
 *   - the row is deleted by whoever succeeds, and only that request proceeds, so
 *     a correct code works once;
 *   - a wrong code, an expired code and an unknown address answer identically,
 *     and cost about the same, so the endpoint is not an account enumerator;
 *   - a successful reset deletes every session, because the reason to reset a
 *     password is usually that someone else has it.
 *
 * "Locked" is not a field. It is a row whose `attempts` have reached the limit
 * and whose expiry has not passed — the lock is the row's own lifetime, pushed
 * out when the budget is spent.
 */

const CODE_TTL_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/**
 * HMAC key for the stored code.
 *
 * Derived from `JWT_SECRET` with a prefix, the way the OAuth state derives its
 * key, so the two never share key material. A plain SHA-256 would let anyone
 * holding a database dump test all one million codes in a second; with a key
 * they do not have, the dump is inert.
 */
function codeKey(): Buffer {
  return crypto
    .createHash("sha256")
    .update(`password-reset:${ENV.JWT_SECRET}`)
    .digest();
}

/** The code the user reads out of their inbox. */
function generateCode(): string {
  /* `randomInt` is the CSPRNG; `Math.random` here would make the code guessable
     from a few samples. Pad so "000123" is still six digits. */
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

function hashCode(code: string): string {
  return crypto.createHmac("sha256", codeKey()).update(code).digest("hex");
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
 * Spend the work an unknown address would have cost.
 *
 * Without this, "no such account" returns in microseconds and "wrong code" takes
 * a hash — a difference anyone can measure over a handful of requests, which is
 * the enumeration the identical error messages were meant to prevent.
 */
function burnComparableWork(code: string): void {
  codesMatch(code, hashCode("000000"));
}

/**
 * Drop a row whose window has passed.
 *
 * The TTL monitor runs about once a minute, so an exhausted row can outlive its
 * expiry for that long. Left in place it would either lock out a fresh code or
 * lend its attempt count to it.
 */
async function clearExpiredRow(userId: unknown): Promise<void> {
  await PasswordResetModel.deleteOne({
    userId,
    expiresAt: { $lte: new Date() },
  });
}

/**
 * Send a reset code, if the address belongs to an account that may still reset.
 *
 * Always resolves, whatever the answer: the caller must not be able to tell "no
 * such account" from "code sent" from "this account is locked", or the endpoint
 * becomes an account enumerator. The distinction lives in the log.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await UserModel.findOne({ email })
    .select("_id email fullName")
    .lean();

  if (!user) {
    authLogger.info("Password reset requested for an unknown address.");
    return;
  }

  await clearExpiredRow(user._id);

  const existing = await PasswordResetModel.findOne({ userId: user._id })
    .select("attempts")
    .lean();

  if (existing && existing.attempts >= MAX_ATTEMPTS) {
    /* Locked. Issuing a code here is the loop the limit exists to stop: five
       guesses, resend, five more. The response stays 202 — telling the caller
       would also tell an attacker which addresses are mid-reset. */
    authLogger.warn(
      { userId: user._id.toString() },
      "Password reset is locked; no code issued.",
    );
    return;
  }

  const code = generateCode();

  /* `$setOnInsert` for the count, never `$set`: a resend must not hand back the
     attempts already spent. Replacing the hash invalidates the previous code. */
  await PasswordResetModel.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        codeHash: hashCode(code),
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      },
      $setOnInsert: { attempts: 0 },
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
 * The attempt is claimed first, in one conditional update, and only then is the
 * code compared. Reading the count and incrementing afterwards let a burst of
 * parallel requests each observe "no attempts yet" and take a guess — five
 * became however many the attacker could fire at once.
 */
export async function resetPasswordWithCode(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  const user = await UserModel.findOne({ email }).select("_id").lean();

  if (!user) {
    burnComparableWork(code);
    throw invalidPasswordResetCodeError();
  }

  const now = new Date();

  const claimed = await PasswordResetModel.findOneAndUpdate(
    {
      userId: user._id,
      expiresAt: { $gt: now },
      attempts: { $lt: MAX_ATTEMPTS },
    },
    { $inc: { attempts: 1 } },
    { new: true, projection: { codeHash: 1, attempts: 1 } },
  ).lean();

  if (!claimed) {
    /* Either there is no live code, or the budget is spent. Only the second is
       worth telling apart — and only as "locked", never as "this account has a
       reset in flight". */
    const live = await PasswordResetModel.findOne({
      userId: user._id,
      expiresAt: { $gt: now },
    }).lean();

    if (live && live.attempts >= MAX_ATTEMPTS) {
      /* Keep the row and push its expiry out: the lock is the row's lifetime,
         and deleting it would hand the next request a fresh budget. */
      await PasswordResetModel.updateOne(
        { _id: live._id },
        { $set: { expiresAt: new Date(now.getTime() + CODE_TTL_MS) } },
      );

      authLogger.warn(
        { userId: user._id.toString() },
        "Password reset refused — the code's attempts are spent.",
      );

      throw passwordResetTooManyAttemptsError();
    }

    throw invalidPasswordResetCodeError();
  }

  if (!codesMatch(code, claimed.codeHash)) {
    /* The attempt is already spent, whichever way this goes. */
    authLogger.warn(
      { userId: user._id.toString(), attempts: claimed.attempts },
      "Wrong password reset code.",
    );

    throw invalidPasswordResetCodeError();
  }

  /* Single use, and race-proof: whoever deletes the row owns the reset. A second
     request presenting the same correct code deletes nothing and is refused. */
  const spent = await PasswordResetModel.deleteOne({ _id: claimed._id });

  if (spent.deletedCount !== 1) {
    throw invalidPasswordResetCodeError();
  }

  const passwordHash = await hashPassword(newPassword);

  await UserModel.updateOne({ _id: user._id }, { $set: { passwordHash } });

  /* Every session dies with the old password. */
  await SessionModel.deleteMany({ userId: user._id });

  authLogger.info(
    { userId: user._id.toString() },
    "Password reset — password changed and sessions revoked.",
  );
}
