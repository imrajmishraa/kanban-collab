// @vitest-environment jsdom
import { useState } from "react";

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/* The hook asks the server which providers it has credentials for. Nothing here
   is about that request, so it answers immediately. */
vi.mock("@/services/client", () => ({
  apiClient: {
    get: () =>
      Promise.resolve({
        data: {
          data: {
            googleClientId: "test-client-id.apps.googleusercontent.com",
            githubClientId: "test-github-client-id",
          },
        },
      }),
    post: () => Promise.resolve({ data: {} }),
  },
  ApiClientError: class extends Error {},
}));

const { providerAuthUrl, useUnifiedOAuth } = await import("./useUnifiedOAuth");

/**
 * Sign-in, through the server, as a top-level navigation.
 *
 * There is no popup and no third-party script: the tab leaves for
 * `/api/v1/auth/oauth/:provider`, and `/auth/callback` finishes the job when it
 * comes back. These tests pin the URL that leaves and the fact that nothing
 * else is loaded into the page.
 *
 * The popup this replaced could not work through Google — the account chooser
 * severs `window.opener`, so the callback page signed itself in and the window
 * that opened it stayed on the form.
 */

/**
 * jsdom's `location` is unforgeable, so the hook takes the "leave the page"
 * function as a parameter and the test hands it a recorder.
 */
function recorder() {
  const calls: string[] = [];
  return { calls, leave: (url: string) => calls.push(url) };
}

/** A consumer that behaves like the forms: fresh props on every render. */
function Harness({ leave }: { leave: (url: string) => void }) {
  const [, force] = useState(0);
  const { signInWithGoogle, loadingProvider, isGoogleAvailable } =
    useUnifiedOAuth({ rememberMe: true, leave });

  return (
    <div>
      <button type="button" onClick={() => signInWithGoogle()}>
        Google
      </button>
      <button type="button" onClick={() => force((n) => n + 1)}>
        rerender
      </button>
      <span data-testid="state">
        {isGoogleAvailable ? "available" : "not yet"}/
        {loadingProvider ?? "idle"}
      </span>
    </div>
  );
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("providerAuthUrl", () => {
  it("points at the server's own route", () => {
    expect(providerAuthUrl("google", true)).toBe(
      "/api/v1/auth/oauth/google?rememberMe=true",
    );
    expect(providerAuthUrl("github", false)).toBe(
      "/api/v1/auth/oauth/github?rememberMe=false",
    );
  });
});

describe("useUnifiedOAuth", () => {
  it("leaves the page for the provider, with the remember-me choice", async () => {
    const { calls, leave } = recorder();

    const { getByRole, findByTestId } = render(<Harness leave={leave} />);
    await findByTestId("state").then((node) =>
      expect(node.textContent).toContain("available"),
    );

    act(() => {
      getByRole("button", { name: "Google" }).click();
    });

    expect(calls).toEqual(["/api/v1/auth/oauth/google?rememberMe=true"]);
  });

  it("loads no third-party script and opens no popup", async () => {
    const open = vi.spyOn(window, "open");
    const { leave } = recorder();

    const { getByRole, findByTestId } = render(<Harness leave={leave} />);
    await findByTestId("state");

    act(() => {
      getByRole("button", { name: "Google" }).click();
    });

    expect(open).not.toHaveBeenCalled();
    expect(
      document.querySelector('script[src*="accounts.google.com"]'),
    ).toBeNull();
  });

  it("marks the provider busy so the button cannot be pressed twice", async () => {
    const { leave } = recorder();

    const { getByRole, findByTestId } = render(<Harness leave={leave} />);
    await findByTestId("state");

    act(() => {
      getByRole("button", { name: "Google" }).click();
    });

    expect(
      document.querySelector('[data-testid="state"]')?.textContent,
    ).toContain("google");
  });

  it("drops the busy flag when the page is shown again", async () => {
    /* Back from the provider's screen restores this page from the bfcache with
       its React state intact, `loadingProvider` included. Without this the
       button spins forever — and the email submit is disabled with it. */
    const { leave } = recorder();

    const { getByRole, findByTestId } = render(<Harness leave={leave} />);
    await findByTestId("state");

    act(() => {
      getByRole("button", { name: "Google" }).click();
    });
    expect(
      document.querySelector('[data-testid="state"]')?.textContent,
    ).toContain("google");

    act(() => {
      window.dispatchEvent(
        new PageTransitionEvent("pageshow", { persisted: true }),
      );
    });

    expect(
      document.querySelector('[data-testid="state"]')?.textContent,
    ).toContain("idle");
  });

  it("drops the busy flag if the navigation never happens", async () => {
    /* A stopped load, or a navigation the browser refused: no `pageshow` ever
       arrives, so a timer ends the wait instead. */
    vi.useFakeTimers();

    const { leave } = recorder();
    const { getByRole } = render(<Harness leave={leave} />);

    /* The provider list arrives on a microtask, which fake timers do not hold. */
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      getByRole("button", { name: "Google" }).click();
    });
    expect(
      document.querySelector('[data-testid="state"]')?.textContent,
    ).toContain("google");

    act(() => {
      vi.advanceTimersByTime(15_000);
    });
    expect(
      document.querySelector('[data-testid="state"]')?.textContent,
    ).toContain("idle");

    vi.useRealTimers();
  });

  it("keeps the latest remember-me value after a re-render", async () => {
    const { calls, leave } = recorder();

    const { getByRole, findByTestId } = render(<Harness leave={leave} />);
    await findByTestId("state");

    /* A re-render must not be able to send a stale choice: the ref is updated
       by an effect, so the click below reads the current one. */
    act(() => {
      getByRole("button", { name: "rerender" }).click();
    });
    act(() => {
      getByRole("button", { name: "Google" }).click();
    });

    expect(calls[0]).toBe("/api/v1/auth/oauth/google?rememberMe=true");
  });
});
