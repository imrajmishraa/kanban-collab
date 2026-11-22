import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Password recovery, at the module boundary.
 *
 * A six-digit code is a million guesses, so the value of every rule here is in
 * the details: the count has to survive a resend, the attempt has to be claimed
 * before the code is compared (or a parallel burst takes a free guess each), and
 * a spent budget has to keep the row — deleting it would hand the next request a
 * fresh five.
 */

const mocks = vi.hoisted(() => ({
  userFindOne: vi.fn(),
  userUpdateOne: vi.fn(),
  resetFindOneAndUpdate: vi.fn(),
  resetFindOne: vi.fn(),
  resetDeleteOne: vi.fn(),
  resetUpdateOne: vi.fn(),
  sessionDeleteMany: vi.fn(),
  send: vi.fn(),
  hashPassword: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("../../../src/config/env", () => ({
  ENV: { JWT_SECRET: "test-jwt-secret", IS_PROD: false },
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
    updateOne: mocks.resetUpdateOne,
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
const RESET_ID = "reset-1";

/** `.lean()` directly, or after `.select()`. */
function chain(result: unknown): unknown {
  const lean = async () => result;

  return { lean, select: () => ({ lean }) };
}

/** The code the module generated, read back out of the email it sent. */
function codeFromEmail(): string {
  const call = mocks.send.mock.calls.at(-1)?.[0] as { text: string };
  const match = /code is (\d{6})/.exec(call.text);

  if (!match?.[1]) throw new Error("no code in the email");

  return match[1];
}

/** The update object `requestPasswordReset` issued. */
function issuedUpdate(): {
  $set: { codeHash: string; expiresAt: Date };
  $setOnInsert: { attempts: number };
} {
  return mocks.resetFindOneAndUpdate.mock.calls[0]![1] as never;
}

function liveRow(attempts: number) {
  return {
    _id: RESET_ID,
    codeHash: "00".repeat(32),
    attempts,
    expiresAt: new Date(Date.now() + 60_000),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.userUpdateOne.mockResolvedValue({});
  mocks.resetDeleteOne.mockResolvedValue({ deletedCount: 1 });
  mocks.resetUpdateOne.mockResolvedValue({});
  mocks.sessionDeleteMany.mockResolvedValue({ deletedCount: 2 });
  mocks.hashPassword.mockResolvedValue("new-hash");
  mocks.resetFindOneAndUpdate.mockResolvedValue({});
});

describe("requestPasswordReset", () => {
  it("writes nothing and sends nothing for an address with no account", async () => {
    mocks.userFindOne.mockReturnValue(chain(null));

    await expect(requestPasswordReset(EMAIL)).resolves.toBeUndefined();

    expect(mocks.resetFindOneAndUpdate).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("clears a row whose window has passed before deciding anything", async () => {
    mocks.userFindOne.mockReturnValue(
      chain({ _id: USER_ID, email: EMAIL, fullName: "Raj" }),
    );
    mocks.resetFindOne.mockReturnValue(chain(null));

    await requestPasswordReset(EMAIL);

    expect(mocks.resetDeleteOne).toHaveBeenCalledWith({
      userId: USER_ID,
      expiresAt: { $lte: expect.any(Date) },
    });
  });

  it("stores an HMAC of the code, never the code itself", async () => {
    mocks.userFindOne.mockReturnValue(
      chain({ _id: USER_ID, email: EMAIL, fullName: "Raj" }),
    );
    mocks.resetFindOne.mockReturnValue(chain(null));

    await requestPasswordReset(EMAIL);

    const code = codeFromEmail();
    const update = issuedUpdate();

    expect(update.$set.codeHash).toMatch(/^[0-9a-f]{64}$/);
    expect(update.$set.codeHash).not.toContain(code);
    expect(update.$set.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("does not hand the attempts back on a resend", async () => {
    /* The loop that made the first version's limit decorative: five guesses,
       resend, five more. The count is written only when the row is created. */
    mocks.userFindOne.mockReturnValue(
      chain({ _id: USER_ID, email: EMAIL, fullName: "Raj" }),
    );
    mocks.resetFindOne.mockReturnValue(chain({ attempts: 3 }));

    await requestPasswordReset(EMAIL);

    expect(issuedUpdate().$setOnInsert).toEqual({ attempts: 0 });
    expect(issuedUpdate().$set).not.toHaveProperty("attempts");
  });

  it("issues nothing while the account's reset is locked", async () => {
    mocks.userFindOne.mockReturnValue(
      chain({ _id: USER_ID, email: EMAIL, fullName: "Raj" }),
    );
    mocks.resetFindOne.mockReturnValue(chain({ attempts: 5 }));

    await expect(requestPasswordReset(EMAIL)).resolves.toBeUndefined();

    expect(mocks.resetFindOneAndUpdate).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
    expect(mocks.logWarn).toHaveBeenCalled();
  });
});

describe("resetPasswordWithCode", () => {
  it("answers the same way for an unknown address, and spends the work", async () => {
    mocks.userFindOne.mockReturnValue(chain(null));

    await expect(
      resetPasswordWithCode(EMAIL, "123456", "new-password"),
    ).rejects.toMatchObject({ code: "INVALID_PASSWORD_RESET_CODE" });

    /* No password write, and no reset row touched. */
    expect(mocks.userUpdateOne).not.toHaveBeenCalled();
    expect(mocks.resetFindOneAndUpdate).not.toHaveBeenCalled();
  });

  it("claims the attempt before looking at the code", async () => {
    mocks.userFindOne.mockReturnValue(chain({ _id: USER_ID }));
    mocks.resetFindOneAndUpdate.mockReturnValue(chain(liveRow(2)));

    await resetPasswordWithCode(EMAIL, "000000", "new-password").catch(
      () => undefined,
    );

    const [filter, update] = mocks.resetFindOneAndUpdate.mock.calls[0]!;

    expect(filter).toMatchObject({
      userId: USER_ID,
      attempts: { $lt: 5 },
      expiresAt: { $gt: expect.any(Date) },
    });
    expect(update).toEqual({ $inc: { attempts: 1 } });
  });

  it("refuses a wrong code without touching the password", async () => {
    mocks.userFindOne.mockReturnValue(chain({ _id: USER_ID }));
    mocks.resetFindOneAndUpdate.mockReturnValue(chain(liveRow(2)));

    await expect(
      resetPasswordWithCode(EMAIL, "000000", "new-password"),
    ).rejects.toMatchObject({ code: "INVALID_PASSWORD_RESET_CODE" });

    expect(mocks.userUpdateOne).not.toHaveBeenCalled();
    expect(mocks.sessionDeleteMany).not.toHaveBeenCalled();
  });

  it("answers 429 once the budget is spent, and keeps the row", async () => {
    mocks.userFindOne.mockReturnValue(chain({ _id: USER_ID }));
    /* The conditional update matches nothing: `attempts < 5` is false. */
    mocks.resetFindOneAndUpdate.mockReturnValue(chain(null));
    mocks.resetFindOne.mockReturnValue(chain(liveRow(5)));

    await expect(
      resetPasswordWithCode(EMAIL, "123456", "new-password"),
    ).rejects.toMatchObject({ code: "PASSWORD_RESET_TOO_MANY_ATTEMPTS" });

    /* The lock is the row's lifetime, so it is extended, not deleted. */
    expect(mocks.resetUpdateOne).toHaveBeenCalledWith(
      { _id: RESET_ID },
      { $set: { expiresAt: expect.any(Date) } },
    );
    expect(mocks.resetDeleteOne).not.toHaveBeenCalledWith({ _id: RESET_ID });
  });

  it("refuses a correct code while the budget is spent", async () => {
    mocks.userFindOne.mockReturnValue(chain({ _id: USER_ID }));
    mocks.resetFindOneAndUpdate.mockReturnValue(chain(null));
    mocks.resetFindOne.mockReturnValue(chain(liveRow(5)));

    await expect(
      resetPasswordWithCode(EMAIL, "123456", "new-password"),
    ).rejects.toMatchObject({ code: "PASSWORD_RESET_TOO_MANY_ATTEMPTS" });

    expect(mocks.userUpdateOne).not.toHaveBeenCalled();
  });

  it("refuses when there is no live code at all", async () => {
    mocks.userFindOne.mockReturnValue(chain({ _id: USER_ID }));
    mocks.resetFindOneAndUpdate.mockReturnValue(chain(null));
    mocks.resetFindOne.mockReturnValue(chain(null));

    await expect(
      resetPasswordWithCode(EMAIL, "123456", "new-password"),
    ).rejects.toMatchObject({ code: "INVALID_PASSWORD_RESET_CODE" });
  });

  it("sets the password, spends the row and revokes every session", async () => {
    mocks.userFindOne.mockReturnValue(
      chain({ _id: USER_ID, email: EMAIL, fullName: "Raj" }),
    );
    mocks.resetFindOne.mockReturnValue(chain(null));

    await requestPasswordReset(EMAIL);

    const code = codeFromEmail();
    const storedHash = issuedUpdate().$set.codeHash;

    mocks.userFindOne.mockReturnValue(chain({ _id: USER_ID }));
    mocks.resetFindOneAndUpdate.mockReturnValue(
      chain({ _id: RESET_ID, codeHash: storedHash, attempts: 1 }),
    );

    await resetPasswordWithCode(EMAIL, code, "new-password");

    expect(mocks.resetDeleteOne).toHaveBeenCalledWith({ _id: RESET_ID });
    expect(mocks.hashPassword).toHaveBeenCalledWith("new-password");
    expect(mocks.userUpdateOne).toHaveBeenCalledWith(
      { _id: USER_ID },
      { $set: { passwordHash: "new-hash" } },
    );
    expect(mocks.sessionDeleteMany).toHaveBeenCalledWith({ userId: USER_ID });
  });

  it("refuses when another request has already spent the row", async () => {
    /* Two requests with the same correct code: whoever's deleteOne removes the
       row owns the reset, and the loser must not set a password. */
    mocks.userFindOne.mockReturnValue(
      chain({ _id: USER_ID, email: EMAIL, fullName: "Raj" }),
    );
    mocks.resetFindOne.mockReturnValue(chain(null));

    await requestPasswordReset(EMAIL);

    const code = codeFromEmail();
    const storedHash = issuedUpdate().$set.codeHash;

    mocks.userFindOne.mockReturnValue(chain({ _id: USER_ID }));
    mocks.resetFindOneAndUpdate.mockReturnValue(
      chain({ _id: RESET_ID, codeHash: storedHash, attempts: 1 }),
    );
    mocks.resetDeleteOne.mockResolvedValue({ deletedCount: 0 });

    await expect(
      resetPasswordWithCode(EMAIL, code, "new-password"),
    ).rejects.toMatchObject({ code: "INVALID_PASSWORD_RESET_CODE" });

    expect(mocks.userUpdateOne).not.toHaveBeenCalled();
  });
});
