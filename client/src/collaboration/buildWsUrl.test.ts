import { describe, expect, it } from "vitest";

import { buildCollaborationWsUrl } from "./buildWsUrl";

describe("buildCollaborationWsUrl", () => {
  it("returns null when the boardId is missing", () => {
    expect(buildCollaborationWsUrl(null)).toBeNull();
    expect(buildCollaborationWsUrl(undefined)).toBeNull();
  });

  it("returns null when no WS base is configured", () => {
    // VITE_WS_URL is not set in the test environment.
    expect(buildCollaborationWsUrl("board-1")).toBeNull();
  });
});
