import { useEffect, useRef, useState, type ReactNode } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  Edit02Icon,
  File02Icon,
  MoreHorizontalIcon,
  StarIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { alpha, getWorkspaceColor } from "@/utils/workspaceColor";

interface WorkspaceCardProps {
  id: string;
  name: string;
  /** Second line: "3 boards" on the overview, "4 members" in search results. */
  secondary?: string;
  /** Optional third line, e.g. the activity count. */
  meta?: ReactNode;
  /** Rendered instead of the monogram when the API supplies one. */
  imageUrl?: string | null;
  onClick: () => void;
  /** Menu actions. Each item is hidden when its handler is absent. */
  onRename?: () => void;
  onToggleStar?: () => void;
  isStarred?: boolean;
  onAddMember?: () => void;
  onCopyLink?: () => void;
}

function monogram(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "W";
}

/**
 * One workspace. The whole card opens it; the three-dot menu appears on hover
 * (and on keyboard focus) so it does not compete with the card's own click.
 */
export function WorkspaceCard({
  id,
  name,
  secondary,
  meta,
  imageUrl,
  onClick,
  onRename,
  onToggleStar,
  isStarred = false,
  onAddMember,
  onCopyLink,
}: WorkspaceCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const color = getWorkspaceColor(id || name);

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

  const avatarClass =
    "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border text-[13px] font-semibold";
  const avatarStyle = { borderColor: alpha(color, 0.32), color };

  const item = (label: string, icon: typeof File02Icon, run: () => void) => (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        setMenuOpen(false);
        run();
      }}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11.5px] text-neutral-300 transition-colors duration-150 hover:bg-white/6 hover:text-neutral-100"
    >
      <HugeiconsIcon icon={icon} size={13} strokeWidth={1.6} />
      {label}
    </button>
  );

  return (
    <div className="group/ws relative">
      <button
        type="button"
        onClick={onClick}
        style={{ borderColor: alpha(color, 0.22) }}
        className="
          flex w-full cursor-pointer flex-col rounded-xl border
          bg-[#0a0a0a]/60 px-4 py-3.5 pr-11 text-left
          transition-colors duration-300 ease-out
          hover:border-orange-50/20 hover:bg-white/3
        "
      >
        <div className="flex items-start gap-3">
          {imageUrl && !imageFailed ? (
            <span className={avatarClass} style={avatarStyle}>
              <img
                src={imageUrl}
                alt=""
                className="size-full object-cover"
                onError={() => setImageFailed(true)}
              />
            </span>
          ) : (
            <span
              className={avatarClass}
              style={avatarStyle}
              aria-hidden="true"
            >
              {monogram(name)}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="flex items-center gap-1.5 text-[13.5px] font-medium tracking-tight text-neutral-100">
              <span className="truncate">{name}</span>
              {isStarred && (
                <HugeiconsIcon
                  icon={StarIcon}
                  size={11}
                  strokeWidth={1.8}
                  className="shrink-0 text-orange-100"
                  aria-label="Starred"
                />
              )}
            </h3>

            {secondary && (
              <p className="mt-0.5 truncate text-[12px] text-neutral-500">
                {secondary}
              </p>
            )}
          </div>
        </div>

        {meta && <div className="mt-3.5">{meta}</div>}
      </button>

      {/* Top-right slot: the open arrow, replaced by the menu button on hover. */}
      <div
        ref={menuRef}
        className="absolute right-2.5 top-2.5 flex items-center"
      >
        <HugeiconsIcon
          icon={ArrowUpRight01Icon}
          size={14}
          strokeWidth={1.8}
          className="shrink-0 text-neutral-600 transition-opacity duration-200 group-hover/ws:opacity-0"
        />

        <button
          type="button"
          aria-label="Workspace actions"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((previous) => !previous);
          }}
          className={[
            "absolute right-0 top-0 flex size-6 cursor-pointer items-center justify-center rounded-md transition-all duration-200",
            "opacity-0 focus-visible:opacity-100 group-hover/ws:opacity-100",
            menuOpen
              ? "bg-white/10 text-neutral-100 opacity-100"
              : "text-neutral-500 hover:bg-white/8 hover:text-neutral-200",
          ].join(" ")}
        >
          <HugeiconsIcon
            icon={MoreHorizontalIcon}
            size={14}
            strokeWidth={1.8}
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            aria-label="Workspace actions"
            className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-orange-50/15 bg-[#141416] p-1"
          >
            {item("Open workspace", ArrowUpRight01Icon, onClick)}
            {onRename && item("Rename", Edit02Icon, onRename)}
            {onToggleStar &&
              item(
                isStarred ? "Remove star" : "Star workspace",
                StarIcon,
                onToggleStar,
              )}
            {onAddMember && item("Add member", UserGroupIcon, onAddMember)}
            {onCopyLink && item("Copy link", File02Icon, onCopyLink)}
          </div>
        )}
      </div>
    </div>
  );
}
