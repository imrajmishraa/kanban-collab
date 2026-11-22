import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Password recovery, end to end at the module boundary.
 *
 * There was no recovery at all before this: the client showed a fake success and
 * the server had no routes. These cases pin the rules that make a six-digit code
 * safe to hand out — hashed at rest, single use, five guesses, no enumeration,
 * and every session revoked on success.
 */

const mocks = vi.hoisted(() => ({
  userFindOne: vi.fn(),
  userUpdateOne: vi.fn(),
  resetFindOneAndUpdate: vi.fn(),
  resetFindOne: vi.fn(),
  resetDeleteOne: vi.fn(),
  sessionDeleteMany: vi.fn(),
  send: vi.fn(),
  hashPassword: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("../../../src/infrastructure/db/mongoose/schemas", () => ({
  UserModel: {
    findOne: mocks.userFindOne,
    updateOne: mocks.userUpdateOne,
  },
  SessionModel: { deleteMany: mocks.sessionDeleteMany },
  PasswordResetModel: {
    findOneAndUpdate: mocks.resetFindOneAndUpdate,
    findOne: mocks.resetFindOne,
    deleteOne: mocks.resetDeleteOne,
  },
}));

vi.mock("../../../src/infrastructure/email/emailTransport", () => ({
  emailTransport: { send: mocks.send, provider: "test" },
}));

vi.mock("../../../src/infrastructure/security/password", () => ({
  hashPassword: mocks.hashPassword,
}));

vi.mock("../../../src/infrastructure/logging/childLogger", () => ({
  authLogger: {
    info: mocks.logInfo,
    warn: mocks.logWarn,
    error: mocks.logError,
  },
}));

import {
  requestPasswordReset,
  resetPasswordWithCode,
} from "../../../src/application/auth/passwordReset";

const USER_ID = "6517f1c2a4b8e9d0f1a2b3c4";
const EMAIL = "raj@example.com";

/** Any chain order ending in `.lean()`. */
function chain(result: unknown): unknown {
  const lean = async () => result;

  /* `.lean()` directly (the reset lookups) or after `.select()`/`.projection()`. */
  return { lean, select: () => ({ lean }), projection: () => ({ lean }) };
}

/** The code the module generated, read back out of the email it sent. */
function codeFromEmail(): string {
  const call = mocks.send.mock.calls.at(-1)?.[0] as { text: string };
  const match = /code is (\d{6})/.exec(call.text);

  if (!match?.[1]) throw new Error("no code in the email");

  return match[1];
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.userUpdateOne.mockResolvedValue({});
  mocks.resetDeleteOne.mockResolvedValue({});
  mocks.sessionDeleteMany.mockResolvedValue({ deletedCount: 2 });
  mocks.hashPassword.mockResolvedValue("new-hash");
});

describe("requestPasswordReset", () => {
  it("says nothing and writes nothing for an address with no account", async () => {
    mocks.userFindOne.mockReturnValue(chain(null));

    await expect(requestPasswordReset(EMAIL)).resolves.toBeUndefined();

    expect(mocks.resetFindOneAndUpdate).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("stores a hash of the code, never the code itself", async () => {
    mocks.userFindOne.mockReturnValue(
      chain({ _id: USER_ID, email: EMAIL, fullName: "Raj" }),
    );

    await requestPasswordReset(EMAIL);

    const code = codeFromEmail();
    const update = mocks.resetFindOneAndUpdate.mock.calls[0]![1] as {
      $set: { codeHash: string; expiresAt: Date };
    };

    expect(update.$set.codeHash).toMatch(/^[0-9a-f]{64}$/);
    expect(update.$set.codeHash).not.toContain(code);
    expect(update.$set.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("replaces any previous code rather than adding a second one", async () => {
    mocks.userFindOne.mockReturnValue(
      chain({ _id: USER_ID, email: EMAIL, fullName: "Raj" }),
    );

    await requestPasswordReset(EMAIL);

    expect(mocks.resetFindOneAndUpdate.mock.calls[0]![2]).toMatchObject({
      upsert: true,
    });
  });
});

describe("resetPasswordWithCode", () => {
  it("refuses an unknown address with the same answer as a wrong code", async () => {
    mocks.userFindOne.mockReturnValue(chain(null));

    await expect(
      resetPasswordWithCode(EMAIL, "123456", "new-password"),
    ).rejects.toMatchObject({ code: "INVALID_PASSWORD_RESET_CODE" });
  });

  it("refuses when no code is live", async () => {
    mocks.userFindOne.mockReturnValue(chain({ _id: USER_ID, email: EMAIL }));
    mocks.resetFindOne.mockReturnValue(chain(null));

    await expect(
      resetPasswordWithCode(EMAIL, "123456", "new-password"),
    ).rejects.toMatchObject({ code: "INVALID_PASSWORD_RESET_CODE" });
  });

  it("counts a wrong guess and does not touch the password", async () => {
    mocks.userFindOne.mockReturnValue(chain({ _id: USER_ID, email: EMAIL }));
    mocks.resetFindOne.mockReturnValue(
      chain({
        _id: "reset-1",
        codeHash: "00".repeat(32),
        attempts: 1,
        expiresAt: new Date(Date.now() + 60_000),
      }),
    );
    mocks.resetFindOneAndUpdate.mockReturnValue(chain({ attempts: 2 }));

    await expect(
      resetPasswordWithCode(EMAIL, "000000", "new-password"),
    ).rejects.toMatchObject({ code: "INVALID_PASSWORD_RESET_CODE" });

    expect(mocks.resetFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: "reset-1" },
      { $inc: { attempts: 1 } },
      expect.anything(),
    );
    expect(mocks.userUpdateOne).not.toHaveBeenCalled();
  });

  it("kills the code once the attempts are spent", async () => {
    mocks.userFindOne.mockReturnValue(chain({ _id: USER_ID, email: EMAIL }));
    mocks.resetFindOne.mockReturnValue(
      chain({
        _id: "reset-1",
        codeHash: "00".repeat(32),
        attempts: 5,
        expiresAt: new Date(Date.now() + 60_000),
      }),
    );

    await expect(
      resetPasswordWithCode(EMAIL, "000000", "new-password"),
    ).rejects.toMatchObject({ code: "PASSWORD_RESET_TOO_MANY_ATTEMPTS" });

    expect(mocks.resetDeleteOne).toHaveBeenCalledWith({ _id: "reset-1" });
  });

  it("sets the password, spends the code and revokes every session", async () => {
    mocks.userFindOne.mockReturnValue(chain({ _id: USER_ID, email: EMAIL }));

    /* Get a real code in place first, then present it back. */
    mocks.resetFindOneAndUpdate.mockResolvedValue({});
    mocks.userFindOne.mockReturnValue(
      chain({ _id: USER_ID, email: EMAIL, fullName: "Raj" }),
    );
    await requestPasswordReset(EMAIL);

    const code = codeFromEmail();
    const storedHash = (
      mocks.resetFindOneAndUpdate.mock.calls[0]![1] as {
        $set: { codeHash: string };
      }
    ).$set.codeHash;

    mocks.userFindOne.mockReturnValue(chain({ _id: USER_ID, email: EMAIL }));
    mocks.resetFindOne.mockReturnValue(
      chain({
        _id: "reset-1",
        codeHash: storedHash,
        attempts: 0,
        expiresAt: new Date(Date.now() + 60_000),
      }),
    );

    await resetPasswordWithCode(EMAIL, code, "new-password");

    expect(mocks.hashPassword).toHaveBeenCalledWith("new-password");
    expect(mocks.userUpdateOne).toHaveBeenCalledWith(
      { _id: USER_ID },
      { $set: { passwordHash: "new-hash" } },
    );
    expect(mocks.sessionDeleteMany).toHaveBeenCalledWith({ userId: USER_ID });
    expect(mocks.resetDeleteOne).toHaveBeenCalledWith({ _id: "reset-1" });
  });
});
