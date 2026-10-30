import { useEffect, useRef, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  MoreHorizontalIcon,
  Settings01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

import { Tooltip } from "#components/Tooltips/ToolTip";

import type { AppNotification } from "@/types/api/dashboard/notification";

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/** Two-letter monogram, so a row has an anchor without an image. */
function initials(title: string): string {
  return title
    .replace(/[^\p{L}\p{N} ]/gu, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

interface NotificationRowProps {
  notification: AppNotification;
  onOpen: (notification: AppNotification) => void;
  onMarkRead: (id: string) => void;
  onClear: (id: string) => void;
  onMute: (type: AppNotification["type"]) => void;
}

export function NotificationRow({
  notification,
  onOpen,
  onMarkRead,
  onClear,
  onMute,
}: NotificationRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const onDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const item = (
    label: string,
    icon: typeof Delete02Icon,
    onClick: () => void,
    danger = false,
    disabled = false,
  ) => (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        setMenuOpen(false);
        onClick();
      }}
      className={[
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11.5px] transition-colors duration-150",
        disabled
          ? "cursor-not-allowed text-(--text-subtle)"
          : danger
            ? "text-(--danger) hover:bg-(--tint-4)"
            : "text-(--text-soft) hover:bg-(--bg-hover) hover:text-(--text-primary)",
      ].join(" ")}
    >
      <HugeiconsIcon icon={icon} size={13} strokeWidth={1.6} />
      {label}
    </button>
  );

  return (
    <div className="group/row relative">
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className={[
          "flex w-full items-start gap-3 px-4 py-3 pr-10 text-left transition-colors duration-200 hover:bg-(--tint-4)",
          notification.isRead ? "opacity-60" : "",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className={[
            "mt-2 size-1.5 shrink-0 rounded-full",
            notification.isRead ? "bg-(--tint-15)" : "bg-(--accent)",
          ].join(" ")}
        />

        <span
          aria-hidden="true"
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-(--hairline) bg-(--tint-5) text-[10px] font-semibold tracking-tight text-(--text-soft)"
        >
          {initials(notification.title)}
        </span>

        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 block text-[12.5px] font-medium leading-4 tracking-tight text-(--text-primary)">
            {notification.title}
          </span>
          <span className="mt-1 line-clamp-2 block text-[11.5px] leading-4 text-(--text-secondary)">
            {notification.message}
          </span>
          <span className="mt-1.5 block font-mono text-[9px] uppercase tracking-wider text-(--text-subtle)">
            {formatRelative(notification.createdAt)}
          </span>
        </span>
      </button>

      <div ref={menuRef} className="absolute right-2 top-2">
        <Tooltip label="More" side="left" shape="solid" size="sm">
          <button
            type="button"
            aria-label="Notification actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((previous) => !previous);
            }}
            className={[
              "rounded-md p-1 transition-colors duration-200",
              menuOpen
                ? "bg-(--tint-8) text-(--text-primary)"
                : "text-(--text-muted) hover:bg-(--bg-hover) hover:text-(--text-primary)",
            ].join(" ")}
          >
            <HugeiconsIcon
              icon={MoreHorizontalIcon}
              size={14}
              strokeWidth={1.8}
            />
          </button>
        </Tooltip>

        {menuOpen && (
          <div
            role="menu"
            aria-label="Notification actions"
            className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-(--hairline) bg-(--bg-root) p-1 shadow-none"
          >
            {item(
              "Mark as read",
              Tick02Icon,
              () => onMarkRead(notification.id),
              false,
              notification.isRead,
            )}
            {item("Mute this type", Settings01Icon, () =>
              onMute(notification.type),
            )}
            {item("Clear", Delete02Icon, () => onClear(notification.id), true)}
          </div>
        )}
      </div>
    </div>
  );
}
