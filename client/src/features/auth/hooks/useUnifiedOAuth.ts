import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/services/client";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (
            listener?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
            }) => void,
          ) => void;
        };
      };
    };
  }
}

interface UseUnifiedOAuthOptions {
  onSuccess: () => Promise<void> | void;
  onError: (errorMsg: string) => void;
  rememberMe?: boolean;
}

export function useUnifiedOAuth({
  onSuccess,
  onError,
  rememberMe = true,
}: UseUnifiedOAuthOptions) {
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [githubClientId, setGithubClientId] = useState<string | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(() =>
    Boolean(window.google?.accounts?.id),
  );
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "github" | null
  >(null);

  const rememberMeRef = useRef(rememberMe);
  useEffect(() => {
    rememberMeRef.current = rememberMe;
  }, [rememberMe]);

  // 1. Fetch available provider configurations from backend
  useEffect(() => {
    let unmounted = false;
    apiClient
      .get("/auth/oauth")
      .then((res) => {
        if (!unmounted && res.data?.data) {
          if (res.data.data.googleClientId)
            setGoogleClientId(res.data.data.googleClientId);
          if (res.data.data.githubClientId)
            setGithubClientId(res.data.data.githubClientId);
        }
      })
      .catch(() => {
        // Silently continue
      });
    return () => {
      unmounted = true;
    };
  }, []);

  // 2. Submit token to backend unified verify endpoint
  const verifyToken = useCallback(
    async (
      provider: "google" | "github",
      token: string,
      redirectUri?: string,
    ) => {
      setLoadingProvider(provider);
      try {
        await apiClient.post("/auth/oauth/verify", {
          provider,
          token,
          redirectUri,
          rememberMe: rememberMeRef.current,
        });

        await onSuccess();
      } catch (err: unknown) {
        let msg = `Sign-in with ${provider} failed. Please try again.`;
        if (typeof err === "object" && err !== null && "response" in err) {
          const res = (err as { response?: { data?: { message?: string } } })
            .response;
          if (res?.data?.message) {
            msg = res.data.message;
          }
        }
        onError(msg);
      } finally {
        setLoadingProvider(null);
      }
    },
    [onSuccess, onError],
  );

  // 3. Setup Google Identity Services
  useEffect(() => {
    if (!googleClientId) return;

    if (window.google?.accounts?.id) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleLoaded(true);
    document.head.appendChild(script);
  }, [googleClientId]);

  useEffect(() => {
    if (!isGoogleLoaded || !googleClientId || !window.google?.accounts?.id)
      return;

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response: { credential: string }) => {
        void verifyToken("google", response.credential);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }, [isGoogleLoaded, googleClientId, verifyToken]);

  // 4. Trigger Google Sign-In
  const signInWithGoogle = useCallback(async () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
      return;
    }

    // Fallback: popup redirect
    const params = new URLSearchParams({
      rememberMe: String(rememberMeRef.current),
    });
    window.location.href = `/api/v1/auth/oauth/google?${params}`;
  }, []);

  // 5. Trigger GitHub Sign-In
  const signInWithGithub = useCallback(async () => {
    // If client ID is known, we can open popup directly or via server redirect
    const params = new URLSearchParams({
      rememberMe: String(rememberMeRef.current),
    });
    const url = `/api/v1/auth/oauth/github?${params}`;

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      url,
      "GitHub Sign In",
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no`,
    );

    if (!popup || popup.closed) {
      // Popup blocked, fallback to normal redirect
      window.location.href = url;
      return;
    }

    setLoadingProvider("github");

    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "OAUTH_RESPONSE") {
        window.removeEventListener("message", messageListener);
        clearInterval(pollTimer);
        setLoadingProvider(null);

        if (event.data.status === "success") {
          void onSuccess();
        } else {
          onError(
            event.data.reason === "cancelled"
              ? "Sign-in cancelled."
              : "GitHub sign-in failed.",
          );
        }
      }
    };

    window.addEventListener("message", messageListener);

    // Give the popup 500 ms after it closes before treating it as a cancellation,
    // in case the postMessage from OAuthCallback arrives just before window.closed
    // flips to true (race condition on slow networks).
    const pollTimer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(pollTimer);
        // Small grace period so a final postMessage can still arrive
        setTimeout(() => {
          window.removeEventListener("message", messageListener);
          setLoadingProvider(null);
        }, 600);
      }
    }, 500);
  }, [onSuccess, onError]);

  return {
    signInWithGoogle,
    signInWithGithub,
    loadingProvider,
    isGoogleAvailable: Boolean(googleClientId),
    isGithubAvailable: Boolean(githubClientId),
  };
}
