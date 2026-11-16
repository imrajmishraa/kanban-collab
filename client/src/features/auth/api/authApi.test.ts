import { beforeEach, describe, expect, it, vi } from "vitest";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("@/services/client", () => ({
  apiClient: { post },
}));

import { refreshRequest } from "./authApi";

const ok = {
  success: true,
  message: "ok",
  data: {
    accessToken: "token-1",
    expiresIn: 900,
    user: { id: "u1", email: "raj@example.com", fullName: "Raj" },
  },
};

describe("refreshRequest", () => {
  beforeEach(() => {
    post.mockReset();
  });

  it("shares one in-flight request between concurrent callers", async () => {
    let release: (value: unknown) => void = () => {};
    post.mockReturnValue(
      new Promise((resolve) => {
        release = resolve;
      }),
    );

    const first = refreshRequest();
    const second = refreshRequest();
    const third = refreshRequest();

    release({ data: ok });

    const results = await Promise.all([first, second, third]);

    expect(post).toHaveBeenCalledTimes(1);
    expect(
      results.every((result) => result.data?.accessToken === "token-1"),
    ).toBe(true);
  });

  it("issues a new request once the previous one settled", async () => {
    post.mockResolvedValue({ data: ok });

    await refreshRequest();
    await refreshRequest();

    expect(post).toHaveBeenCalledTimes(2);
  });

  it("lets a retry through after a failure", async () => {
    post.mockRejectedValueOnce(new Error("network"));

    await expect(refreshRequest()).rejects.toThrow("network");

    post.mockResolvedValueOnce({ data: ok });
    await expect(refreshRequest()).resolves.toEqual(ok);

    expect(post).toHaveBeenCalledTimes(2);
  });

  it("propagates one failure to every caller waiting on it", async () => {
    let fail: (reason: unknown) => void = () => {};
    post.mockReturnValue(
      new Promise((_resolve, reject) => {
        fail = reject;
      }),
    );

    const first = refreshRequest();
    const second = refreshRequest();

    fail(new Error("reuse detected"));

    await expect(first).rejects.toThrow("reuse detected");
    await expect(second).rejects.toThrow("reuse detected");
    expect(post).toHaveBeenCalledTimes(1);
  });
});
