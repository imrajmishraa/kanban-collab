import { describe, expect, it } from "vitest";

import {
  isAccessRevokedClose,
  WS_CLOSE_CODE_ACCESS_REVOKED,
} from "./closeCodes";

describe("isAccessRevokedClose", () => {
  it("treats 4003 as terminal — the server removed this socket's access", () => {
    expect(isAccessRevokedClose(WS_CLOSE_CODE_ACCESS_REVOKED)).toBe(true);
    expect(isAccessRevokedClose(4003)).toBe(true);
  });

  it("keeps reconnecting on an abnormal close (network blip, refused upgrade)", () => {
    // 1006 is what the browser reports when the upgrade itself was refused,
    // and what a dropped connection looks like.
    expect(isAccessRevokedClose(1006)).toBe(false);
    expect(isAccessRevokedClose(1000)).toBe(false);
    expect(isAccessRevokedClose(1001)).toBe(false);
  });

  it("keeps reconnecting on codes a token refresh can fix", () => {
    expect(isAccessRevokedClose(4001)).toBe(false);
    expect(isAccessRevokedClose(4004)).toBe(false);
  });
});
