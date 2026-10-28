import { useCallback, useRef } from "react";

export interface OAuthResult {
  status: "success" | "error";
  reason?: string;
  user?: "new" | "existing";
}

export function useOAuthPopup() {
  const popupRef = useRef<Window | null>(null);

  const openPopup = useCallback(
    (url: string, title = "OAuth Login"): Promise<OAuthResult> => {
      return new Promise((resolve) => {
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          url,
          title,
          `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`,
        );

        popupRef.current = popup;

        // If popup was blocked by browser
        if (!popup || popup.closed || typeof popup.closed === "undefined") {
          // Fall back to full-page navigation
          window.location.href = url;
          return;
        }

        let cleanupCalled = false;

        const cleanup = () => {
          if (cleanupCalled) return;
          cleanupCalled = true;
          window.removeEventListener("message", messageListener);
          clearInterval(pollTimer);
        };

        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data?.type === "OAUTH_RESPONSE") {
            cleanup();
            resolve({
              status: event.data.status === "success" ? "success" : "error",
              reason: event.data.reason,
              user: event.data.user,
            });
          }
        };

        window.addEventListener("message", messageListener);

        // Poll for user closing popup without finishing
        const pollTimer = setInterval(() => {
          if (!popup || popup.closed) {
            cleanup();
            resolve({
              status: "error",
              reason: "cancelled",
            });
          }
        }, 500);
      });
    },
    [],
  );

  return { openPopup };
}
