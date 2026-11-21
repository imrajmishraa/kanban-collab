import { describe, expect, it, vi } from "vitest";

import {
  buildErrorReport,
  createErrorReporter,
  createRateLimiter,
} from "../../../src/infrastructure/observability/errorReporter";

/**
 * The reporter is a side effect of failing, so the two things worth testing are
 * the document it produces and the promises it makes: never throw, stay quiet
 * when unconfigured, and never flood.
 */

const NOW = new Date("2026-11-21T10:00:00.000Z");

describe("buildErrorReport", () => {
  it("captures the fields a reader needs", () => {
    const error = new TypeError("cannot read properties of undefined");

    const report = buildErrorReport(
      error,
      {
        source: "http",
        method: "POST",
        url: "/api/v1/boards",
        requestId: "req-1",
        statusCode: 500,
        code: "INTERNAL",
      },
      { now: NOW, release: "abc123", environment: "production" },
    );

    expect(report).toMatchObject({
      at: NOW.toISOString(),
      source: "http",
      name: "TypeError",
      message: "cannot read properties of undefined",
      method: "POST",
      url: "/api/v1/boards",
      requestId: "req-1",
      statusCode: 500,
      code: "INTERNAL",
      release: "abc123",
      environment: "production",
    });
  });

  it("trims the stack to the useful top", () => {
    const error = new Error("boom");
    error.stack = Array.from(
      { length: 60 },
      (_, i) => `    at frame ${i}`,
    ).join("\n");

    const report = buildErrorReport(error, { source: "http" }, { now: NOW });

    expect(report.stack?.split("\n")).toHaveLength(20);
    expect(report.stack).toContain("frame 0");
    expect(report.stack).not.toContain("frame 59");
  });

  it("handles a rejection that is not an Error", () => {
    expect(
      buildErrorReport("just a string", { source: "unhandledRejection" }),
    ).toMatchObject({ name: "Error", message: "just a string" });

    expect(
      buildErrorReport({ weird: true }, { source: "unhandledRejection" }),
    ).toMatchObject({ message: '{"weird":true}' });
  });

  it("survives a value that cannot be serialised", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(() => buildErrorReport(circular, { source: "http" })).not.toThrow();
  });

  it("omits absent fields rather than sending nulls", () => {
    const report = buildErrorReport(new Error("x"), { source: "http" });

    expect("code" in report).toBe(false);
    expect("requestId" in report).toBe(false);
    expect("release" in report).toBe(false);
  });

  it("keeps extra context when there is any", () => {
    const report = buildErrorReport(new Error("x"), {
      source: "http",
      extra: { userId: "u1", boardId: "b1" },
    });

    expect(report.extra).toEqual({ userId: "u1", boardId: "b1" });
  });
});

describe("createRateLimiter", () => {
  it("allows the budget and then refuses", () => {
    const allow = createRateLimiter(3, 60_000);

    expect(allow(NOW)).toBe(true);
    expect(allow(NOW)).toBe(true);
    expect(allow(NOW)).toBe(true);
    expect(allow(NOW)).toBe(false);
  });

  it("refills when the window turns over", () => {
    const allow = createRateLimiter(1, 60_000);

    expect(allow(NOW)).toBe(true);
    expect(allow(NOW)).toBe(false);
    expect(allow(new Date(NOW.getTime() + 60_001))).toBe(true);
  });
});

describe("createErrorReporter", () => {
  it("does nothing at all without a URL", async () => {
    const fetchImpl = vi.fn();
    const reporter = createErrorReporter({ fetchImpl });

    expect(reporter.enabled).toBe(false);

    await reporter.report(new Error("boom"), { source: "http" });

    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts one JSON document when configured", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    const reporter = createErrorReporter({
      url: "https://hooks.example.com/x",
      release: "abc123",
      fetchImpl,
    });

    await reporter.report(new Error("boom"), { source: "http", url: "/x" });

    expect(fetchImpl).toHaveBeenCalledTimes(1);

    const [url, init] = fetchImpl.mock.calls[0];
    const body = JSON.parse((init as { body: string }).body);

    expect(url).toBe("https://hooks.example.com/x");
    expect(body).toMatchObject({ source: "http", message: "boom", url: "/x" });
    expect(body.release).toBe("abc123");
  });

  it("never throws when the receiver is down", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    const reporter = createErrorReporter({
      url: "https://hooks.example.com/x",
      fetchImpl,
    });

    await expect(
      reporter.report(new Error("boom"), { source: "http" }),
    ).resolves.toBeUndefined();
  });

  it("stops after the rate limit instead of flooding", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    const reporter = createErrorReporter({
      url: "https://hooks.example.com/x",
      fetchImpl,
      allow: createRateLimiter(2, 60_000),
    });

    for (let i = 0; i < 5; i += 1) {
      await reporter.report(new Error(`boom ${i}`), { source: "http" });
    }

    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
