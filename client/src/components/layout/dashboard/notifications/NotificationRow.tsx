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
          ? "cursor-not-allowed text-neutral-600"
          : danger
            ? "text-rose-300 hover:bg-rose-500/10"
            : "text-neutral-300 hover:bg-white/6 hover:text-neutral-100",
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
          "flex w-full items-start gap-3 px-4 py-3 pr-10 text-left transition-colors duration-200 hover:bg-white/4",
          notification.isRead ? "opacity-60" : "",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className={[
            "mt-2 size-1.5 shrink-0 rounded-full",
            notification.isRead ? "bg-white/15" : "bg-orange-100",
          ].join(" ")}
        />

        <span
          aria-hidden="true"
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-orange-50/15 bg-white/5 text-[10px] font-semibold tracking-tight text-neutral-300"
        >
          {initials(notification.title)}
        </span>

        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 block text-[12.5px] font-medium leading-4 tracking-tight text-neutral-100">
            {notification.title}
          </span>
          <span className="mt-1 line-clamp-2 block text-[11.5px] leading-4 text-neutral-400">
            {notification.message}
          </span>
          <span className="mt-1.5 block font-mono text-[9px] uppercase tracking-wider text-neutral-600">
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
                ? "bg-white/8 text-neutral-200"
                : "text-neutral-500 hover:bg-white/6 hover:text-neutral-200",
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
            className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-orange-50/15 bg-[#141416] p-1 shadow-none"
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
