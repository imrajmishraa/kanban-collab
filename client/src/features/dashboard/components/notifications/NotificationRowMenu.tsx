import { useEffect, useRef, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  BellDotIcon,
  FilterMailRemoveIcon,
  MoreHorizontalIcon,
  NotificationBlock01Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/utils/cn";

interface NotificationRowMenuProps {
  isRead: boolean;
  onClear: () => void;
  onMarkRead: () => void;
  onMute: () => void;
}

const ITEM =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-(--text-soft) transition-colors duration-150 hover:bg-(--tint-4) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-(--text-soft)";

/**
 * One notification's own actions: clear it, mute its type, mark it read.
 *
 * Its own component rather than another block of JSX in the feed, because it
 * carries its own open state, its own outside-click listener and its own
 * placement. The feed renders one per row.
 *
 * The trigger is a sibling of the row's button, not a child of it: a button
 * inside a button is invalid HTML and the browser would drop the inner one, so
 * the row button ends short of the right edge and this sits over that gap.
 */
export function NotificationRowMenu({
  isRead,
  onClear,
  onMarkRead,
  onMute,
}: NotificationRowMenuProps) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onDown = (event: MouseEvent) => {
      if (wrapRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    /* The feed scrolls and clips what overflows it, so a menu opened downwards
       from a row near the bottom is cut in half. Open above the row there. */
    const rect = triggerRef.current?.getBoundingClientRect();
    setDropUp(rect ? rect.bottom > window.innerHeight * 0.6 : false);
    setOpen((value) => !value);
  };

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
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

      {open && (
        <div
          role="menu"
          aria-label="Notification options"
          className={cn(
            "absolute right-0 z-50 w-42 overflow-hidden rounded-xl border border-(--hairline) bg-(--bg-surface) p-1.5 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.28)]",
            dropUp ? "bottom-full mb-1" : "top-full mt-1",
          )}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => run(onClear)}
            className={ITEM}
          >
            <HugeiconsIcon
              icon={FilterMailRemoveIcon}
              size={16}
              strokeWidth={1.6}
              className="shrink-0 text-(--text-secondary)"
            />
            Clear
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => run(onMute)}
            className={ITEM}
          >
            <HugeiconsIcon
              icon={NotificationBlock01Icon}
              size={16}
              strokeWidth={1.6}
              className="shrink-0 text-(--text-secondary)"
            />
            Mute
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => run(onMarkRead)}
            disabled={isRead}
            className={ITEM}
          >
            <HugeiconsIcon
              icon={BellDotIcon}
              size={16}
              strokeWidth={1.6}
              className="shrink-0 text-(--text-secondary)"
            />
            Mark as read
          </button>
        </div>
      )}
    </div>
  );
}
