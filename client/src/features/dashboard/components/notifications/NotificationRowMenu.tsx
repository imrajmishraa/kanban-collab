import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  BellOffIcon,
  FilterMailRemoveIcon,
  MoreHorizontalIcon,
  BellRingIcon,
  CheckmarkBadge03Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/utils/cn";
import { estimateMenuHeight, placeMenu } from "@/lib/menuPlacement";

interface NotificationRowMenuProps {
  isRead: boolean;
  /** True when this notification's type has its in-app channel switched off. */
  isMuted: boolean;
  onClear: () => void;
  onMarkRead: () => void;
  onToggleMute: () => void;
}

const ITEM =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[11px] text-(--text-soft) transition-colors duration-150 hover:bg-(--tint-4) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-(--text-soft)";

const MENU_WIDTH = 135;
const ITEM_COUNT = 3;

/**
 * One notification's own actions: clear it, mute its type, mark it read.
 *
 * Its own component rather than another block of JSX in the feed, because it
 * carries its own open state, its own outside-click listener and its own
 * placement. The feed renders one per row.
 *
 * Two things are structural rather than cosmetic:
 *
 * **It renders into a portal.** The feed is an `overflow-y-auto` container, and
 * an absolutely positioned child is clipped by it — the old fix flipped the menu
 * upward using `window.innerHeight * 0.6`, which is the wrong box: a short phone
 * sheet clips a menu that the viewport would have room for. Portalled to `<body>`
 * with `position: fixed`, the only geometry that matters is the viewport, and
 * `placeMenu` does the arithmetic.
 *
 * **It behaves like a menu.** `role="menu"` promises arrow-key navigation and a
 * focus that moves inside, so both are implemented: focus lands on the first
 * item, ArrowDown/ArrowUp wrap, Home/End jump, Escape closes and returns focus
 * to the trigger, and Tab closes without trapping.
 */
export function NotificationRowMenu({
  isRead,
  isMuted,
  onClear,
  onMarkRead,
  onToggleMute,
}: NotificationRowMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    side: "top" | "bottom";
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const items = useCallback(
    () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLButtonElement>(
          '[role="menuitem"]:not([disabled])',
        ) ?? [],
      ),
    [],
  );

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    setPosition(null);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  /* Placement is measured, not guessed: the menu's real height is known once it
     is in the DOM, so the first paint uses an estimate and the second corrects
     it before the browser paints. */
  useLayoutEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current?.getBoundingClientRect();
    if (!trigger) return;

    const measured = menuRef.current?.getBoundingClientRect().height;
    const menu = {
      width: MENU_WIDTH,
      height: measured || estimateMenuHeight(ITEM_COUNT),
    };

    const next = placeMenu({
      trigger,
      menu,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    });

    setPosition({ top: next.top, left: next.left, side: next.side });
  }, [open]);

  /* Focus the first item as soon as the menu exists. */
  useEffect(() => {
    if (!open) return;
    items()[0]?.focus();
  }, [open, items]);

  useEffect(() => {
    if (!open) return;

    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;

      /* The menu is in a portal, so it is not inside the wrapper element — both
         refs have to be checked or the first click inside the menu closes it. */
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;

      close(false);
    };

    /*
     * Reposition on scroll, do not close.
     *
     * Closing on any scroll event — including the one the browser fires when the
     * first item is focused a frame after opening — made the menu appear and
     * vanish in the same breath, which reads as "the button does nothing". A
     * fixed menu has to be re-anchored as its row moves.
     */
    let frame = 0;

    const reposition = () => {
      if (frame) return;

      frame = requestAnimationFrame(() => {
        frame = 0;

        const trigger = triggerRef.current?.getBoundingClientRect();
        if (!trigger) return;

        const measured = menuRef.current?.getBoundingClientRect().height;
        const next = placeMenu({
          trigger,
          menu: {
            width: MENU_WIDTH,
            height: measured || estimateMenuHeight(ITEM_COUNT),
          },
          viewport: { width: window.innerWidth, height: window.innerHeight },
        });

        setPosition({ top: next.top, left: next.left, side: next.side });
      });
    };

    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);

    return () => {
      if (frame) cancelAnimationFrame(frame);

      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, close]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const focusable = items();
    const index = focusable.indexOf(
      document.activeElement as HTMLButtonElement,
    );

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "ArrowDown":
        event.preventDefault();
        focusable[(index + 1) % focusable.length]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        focusable[(index - 1 + focusable.length) % focusable.length]?.focus();
        break;
      case "Home":
        event.preventDefault();
        focusable[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        focusable[focusable.length - 1]?.focus();
        break;
      case "Tab":
        /* Tab leaves the menu; do not trap focus in a list of three actions. */
        close(false);
        break;
      default:
        break;
    }
  };

  const run = (action: () => void) => {
    close();
    action();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Notification options"
        className={cn(
          "flex size-6 cursor-pointer items-center justify-center rounded-md transition-colors duration-200",
          open
            ? "bg-(--tint-8) text-(--text-primary)"
            : "text-(--text-muted) hover:bg-(--bg-hover) hover:text-(--text-primary)",
        )}
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} size={15} strokeWidth={1.8} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Notification options"
            onKeyDown={onKeyDown}
            style={{
              top: position?.top ?? 0,
              left: position?.left ?? 0,
              width: MENU_WIDTH,
              /* Hidden until measured, so it cannot flash in the wrong place. */
              visibility: position ? "visible" : "hidden",
            }}
            className="fixed z-50 overflow-hidden rounded-xl border border-(--hairline) bg-(--bg-surface) p-1.5 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.28)]"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => run(onClear)}
              className={ITEM}
            >
              <HugeiconsIcon
                icon={FilterMailRemoveIcon}
                size={15}
                strokeWidth={1.6}
                className="shrink-0 text-(--text-secondary)"
              />
              Clear
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => run(onToggleMute)}
              className={ITEM}
            >
              <HugeiconsIcon
                icon={isMuted ? BellRingIcon : BellOffIcon}
                size={15}
                strokeWidth={1.6}
                className="shrink-0 text-(--text-secondary)"
              />
              {isMuted ? "Unmute" : "Mute"}
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => run(onMarkRead)}
              disabled={isRead}
              className={ITEM}
            >
              <HugeiconsIcon
                icon={CheckmarkBadge03Icon}
                size={15}
                strokeWidth={1.6}
                className="shrink-0 text-(--text-secondary)"
              />
              Mark as read
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
