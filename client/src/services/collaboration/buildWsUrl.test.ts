import { afterEach, describe, expect, it, vi } from "vitest";

import { buildCollaborationWsUrl } from "./buildWsUrl";

describe("buildCollaborationWsUrl", () => {
  afterEach(() => {
    // Restore the real env between tests so the suite is order-independent.
    vi.unstubAllEnvs();
  });

  it("returns null when the boardId is missing", () => {
    vi.stubEnv("VITE_WS_URL", "ws://localhost:3000/ws");
    expect(buildCollaborationWsUrl(null)).toBeNull();
    expect(buildCollaborationWsUrl(undefined)).toBeNull();
  });

  it("returns null when no WS base is configured", () => {
    vi.stubEnv("VITE_WS_URL", "");
    expect(buildCollaborationWsUrl("board-1")).toBeNull();
  });

  it("builds the URL with only the board id (the token is not in the URL)", () => {
    vi.stubEnv("VITE_WS_URL", "ws://localhost:3000/ws");
    expect(buildCollaborationWsUrl("board-1")).toBe(
      "ws://localhost:3000/ws?boardId=board-1",
    );
  });

  it("appends /ws when the configured base omits it", () => {
    vi.stubEnv("VITE_WS_URL", "ws://localhost:3000");
    expect(buildCollaborationWsUrl("board-1")).toBe(
      "ws://localhost:3000/ws?boardId=board-1",
    );
  });
});
