import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/services/client";

/**
 * Sign in with a provider, through the server.
 *
 * The tab navigates to `/api/v1/auth/oauth/:provider`, the server redirects to
 * the provider, the provider comes back to the server's callback, and the server
 * lands the tab on `/auth/callback?status=…`, which finishes the job: refresh
 * the session from the cookie, then navigate.
 *
 * No popup, and no third-party script. A popup was tried first and does not
 * work through Google: the account chooser sends `Cross-Origin-Opener-Policy`,
 * which severs `window.opener` for good. The popup then reached `/auth/callback`
 * with no opener, took the "not a popup" branch, and signed itself in while the
 * window that opened it stayed on the form. A top-level navigation has no opener
 * to lose.
 *
 * The session never travels through the URL. The server sets the httpOnly
 * `refreshToken` cookie on its own origin — cookies ignore the port, so
 * `localhost:3000` and `localhost:5173` share it — and `/auth/callback` trades
 * that cookie for an access token.
 */

/**
 * How the page leaves for the provider.
 *
 * A seam, not a feature: jsdom's `location` is unforgeable, so a test cannot
 * watch `window.location.assign` — it can only replace the function the hook
 * calls. Nothing in the app passes this.
 */
export type LeaveFor = (url: string) => void;

const leavePage: LeaveFor = (url) => window.location.assign(url);

/**
 * How long the busy flag may stand in for a navigation that is not happening.
 * Between the click and the unload there is normally less than a second, so this
 * only ever fires when the navigation was stopped or refused.
 */
const LEAVE_TIMEOUT_MS = 15_000;

interface UseUnifiedOAuthOptions {
  rememberMe?: boolean;
  leave?: LeaveFor;
}

type Provider = "google" | "github";

/** Where the server starts the handshake, with the choice it needs to keep. */
export function providerAuthUrl(
  provider: Provider,
  rememberMe: boolean,
): string {
  const params = new URLSearchParams({ rememberMe: String(rememberMe) });
  return `/api/v1/auth/oauth/${provider}?${params}`;
}

export function useUnifiedOAuth({
  rememberMe = true,
  leave = leavePage,
}: UseUnifiedOAuthOptions = {}) {
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [githubClientId, setGithubClientId] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const rememberMeRef = useRef(rememberMe);
  useEffect(() => {
    rememberMeRef.current = rememberMe;
  }, [rememberMe]);

  /* Which providers the server has credentials for. The buttons are rendered
     from this, so a provider that is not configured never appears — there is
     nothing to click and nothing to fail. */
  useEffect(() => {
    let unmounted = false;

    apiClient
      .get("/auth/oauth")
      .then((res) => {
        if (unmounted || !res.data?.data) return;
        if (res.data.data.googleClientId) {
          setGoogleClientId(res.data.data.googleClientId);
        }
        if (res.data.data.githubClientId) {
          setGithubClientId(res.data.data.githubClientId);
        }
      })
      .catch(() => {
        /* No provider list means no provider buttons. The email form still
           works, so this is not worth interrupting anyone over. */
      });

    return () => {
      unmounted = true;
    };
  }, []);

  /* How long the flag may stand in for a navigation that is not happening. */
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimer.current !== null) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }, []);

  /* The busy flag is meant to last as long as the page does — which is until
     the browser leaves. Two things bring this page back with the flag still
     set, and the button then spins forever and takes the email submit with it:

       the bfcache    Back from the provider's screen restores the whole page
                      from memory, React state included. `pageshow` fires on
                      that restore — and on an ordinary load, where the flag is
                      already null, so this is safe to run unconditionally.

       an aborted     a stopped load, or a navigation the browser refused.
       navigation     No `pageshow` ever comes, so the timer is what ends it.

     The timer is generous: between the click and the unload there is normally
     less than a second, so it never fires in the normal case. */
  useEffect(() => {
    const reset = () => {
      clearLeaveTimer();
      setLoadingProvider(null);
    };

    window.addEventListener("pageshow", reset);

    return () => {
      window.removeEventListener("pageshow", reset);
      clearLeaveTimer();
    };
  }, [clearLeaveTimer]);

  /**
   * Leaves the app for the provider. The `loading` state is set first so the
   * button cannot be pressed twice while the browser is still deciding to
   * navigate.
   */
  const goToProvider = useCallback(
    (provider: Provider) => {
      setLoadingProvider(provider);

      clearLeaveTimer();
      leaveTimer.current = setTimeout(() => {
        leaveTimer.current = null;
        setLoadingProvider(null);
      }, LEAVE_TIMEOUT_MS);

      leave(providerAuthUrl(provider, rememberMeRef.current));
    },
    [clearLeaveTimer, leave],
  );

  const signInWithGoogle = useCallback(
    () => goToProvider("google"),
    [goToProvider],
  );

  const signInWithGithub = useCallback(
    () => goToProvider("github"),
    [goToProvider],
  );

  return {
    signInWithGoogle,
    signInWithGithub,
    loadingProvider,
    /* A client id on the server is the only thing that makes a provider usable,
       so it is also what "available" means here. */
    isGoogleAvailable: Boolean(googleClientId),
    isGithubAvailable: Boolean(githubClientId),
  };
}
