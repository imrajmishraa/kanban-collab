import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { apiClient } from "@/api/client";

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
            momentListener?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
            }) => void,
          ) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: number | string;
            },
          ) => void;
        };
      };
    };
  }
}

interface UseGoogleIdentityProps {
  onSuccess: () => Promise<void> | void;
  onError: (errorMsg: string) => void;
  rememberMe?: boolean;
}

export function useGoogleIdentity({
  onSuccess,
  onError,
  rememberMe,
}: UseGoogleIdentityProps) {
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(() =>
    Boolean(window.google?.accounts?.id),
  );
  const [isLoading, setIsLoading] = useState(false);
  const rememberMeRef = useRef(rememberMe);

  useEffect(() => {
    rememberMeRef.current = rememberMe;
  }, [rememberMe]);

  // 1. Fetch available provider config to get client_id
  useEffect(() => {
    let unmounted = false;
    apiClient
      .get("/auth/oauth")
      .then((res) => {
        if (!unmounted && res.data?.data?.googleClientId) {
          setGoogleClientId(res.data.data.googleClientId);
        }
      })
      .catch(() => {
        // Silently continue; fallback redirect remains available
      });
    return () => {
      unmounted = true;
    };
  }, []);

  // 2. Load Google Identity Services script
  useEffect(() => {
    if (!googleClientId) return;

    if (window.google?.accounts?.id) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => setIsScriptLoaded(false);
    document.head.appendChild(script);

    return () => {
      // Don't remove script to allow reusing across page transitions
    };
  }, [googleClientId]);

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      setIsLoading(true);
      try {
        await apiClient.post("/auth/oauth/google/token", {
          credential: response.credential,
          rememberMe: rememberMeRef.current,
        });

        await onSuccess();
      } catch (err: unknown) {
        let msg = "Google sign-in failed. Please try again.";
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          msg = err.response.data.message;
        }
        onError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError],
  );

  // 3. Initialize Google Identity
  useEffect(() => {
    if (!isScriptLoaded || !googleClientId || !window.google?.accounts?.id)
      return;

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }, [isScriptLoaded, googleClientId, handleCredentialResponse]);

  const promptGoogle = useCallback(() => {
    if (!window.google?.accounts?.id) return false;
    window.google.accounts.id.prompt();
    return true;
  }, []);

  return {
    isReady: Boolean(isScriptLoaded && googleClientId),
    isLoading,
    promptGoogle,
  };
}
