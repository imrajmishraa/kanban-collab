import { describe, expect, it } from "vitest";

import {
  isAccessChangedClose,
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

  it("reconnects on 4006 — access changed, the socket did not end", () => {
    /* A demotion or a board becoming private. Sending 4003 here used to kill
       live editing until the page was reloaded. */
    expect(isAccessRevokedClose(4006)).toBe(false);
    expect(isAccessChangedClose(4006)).toBe(true);
  });

  it("keeps 4003 terminal and does not confuse it with 4006", () => {
    expect(isAccessRevokedClose(4003)).toBe(true);
    expect(isAccessChangedClose(4003)).toBe(false);
  });
});
