import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The two recovery calls the form makes.
 *
 * Pinned because the endpoints did not exist: the form used to wait 800ms and
 * pretend. A typo in either path is a 404 the user reads as "wrong code".
 */

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("@/services/client", () => ({
  apiClient: { post },
}));

import { forgotPasswordRequest, resetPasswordRequest } from "./authApi";

beforeEach(() => {
  post.mockReset();
  post.mockResolvedValue({ data: { success: true, data: null } });
});

describe("forgotPasswordRequest", () => {
  it("posts the address to the endpoint the server serves", async () => {
    await forgotPasswordRequest("raj@example.com");

    expect(post).toHaveBeenCalledWith("/auth/forgot-password", {
      email: "raj@example.com",
    });
  });
});

describe("resetPasswordRequest", () => {
  it("sends the address, the six-digit code and the new password together", async () => {
    await resetPasswordRequest({
      email: "raj@example.com",
      code: "123456",
      password: "new-password",
    });

    expect(post).toHaveBeenCalledWith("/auth/reset-password", {
      email: "raj@example.com",
      code: "123456",
      password: "new-password",
    });
  });
});
