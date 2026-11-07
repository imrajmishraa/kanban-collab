import { useEffect, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";

import NotificationsFeed from "./NotificationsFeed";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  /**
   * The trigger's container. Clicks inside it must not count as "outside",
   * or the button cannot close the panel it opened: the document
   * `pointerdown` fires before the button's `click`, so the panel would close
   * and immediately reopen.
   */
  ignoreRef?: RefObject<HTMLElement | null>;
}

/**
 * The bell's feed, as a floating sheet under the navbar.
 *
 * This file is only the shell: where the sheet sits, how it animates in, and how
 * it closes. Everything inside is `NotificationsFeed` — the same component the
 * phone sheet renders — so the desktop panel and the phone panel are the same
 * UI, not two that happen to look alike.
 *
 * Portalled to `document.body`: the panel is rendered inside the navbar, which
 * is `fixed z-50` and therefore establishes a stacking context. A descendant
 * can never paint above its own stacking context's level, so raising its
 * z-index in place did nothing. Escaping the header puts it in the root
 * context, where `z-90` sits above the navbar (50) and the sidebar (40) and
 * below the modals and search palette (100).
 */
export default function NotificationsPanel({
  open,
  onClose,
  ignoreRef,
}: NotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (panelRef.current?.contains(target)) return;
      if (ignoreRef?.current?.contains(target)) return;

      onClose();
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, ignoreRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      className="
        fixed right-0 top-14 mr-5 mb-1 bottom-0 z-90 flex w-90
        max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-2xl
        border border-(--hairline) bg-(--bg-root)
        motion-safe:animate-in motion-safe:slide-in-from-right-2
        motion-safe:fade-in-0 motion-safe:duration-200
      "
    >
      <NotificationsFeed />
    </div>,
    document.body,
  );
}
