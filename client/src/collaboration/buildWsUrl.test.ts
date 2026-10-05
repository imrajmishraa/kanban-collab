import { describe, expect, it } from "vitest";

import { buildCollaborationWsUrl } from "./buildWsUrl";

describe("buildCollaborationWsUrl", () => {
  it("returns null when the boardId is missing", () => {
    expect(buildCollaborationWsUrl(null, "token")).toBeNull();
    expect(buildCollaborationWsUrl(undefined, "token")).toBeNull();
  });

  it("returns null when the token is missing", () => {
    expect(buildCollaborationWsUrl("board-1", null)).toBeNull();
    expect(buildCollaborationWsUrl("board-1", undefined)).toBeNull();
  });

  it("returns null when both are missing", () => {
    expect(buildCollaborationWsUrl(undefined, undefined)).toBeNull();
  });
});
