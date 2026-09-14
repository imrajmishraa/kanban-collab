import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  Edit02Icon,
  MoreHorizontalIcon,
  PinIcon,
  Share08Icon,
} from "@hugeicons/core-free-icons";

interface BoardActionsMenuProps {
  onPin: () => void;
  onRename: () => void;
  onShare: () => void;
  onDelete: () => void;
  isPinned?: boolean;
}

export function BoardActionsMenu({
  onPin,
  onRename,
  onShare,
  onDelete,
  isPinned,
}: BoardActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handle = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    fn();
  };

  return (
    <div ref={ref} className="relative">
      <button
  type="button"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((v) => !v);
  }}
  aria-label="Board actions"
  aria-haspopup="menu"
  aria-expanded={open}
  data-open={open}
  className="
    flex size-6 items-center justify-center rounded-full
    bg-(--bg-elevated)
    text-(--text-muted)
    opacity-0 pointer-events-none
    transition-all duration-150
    hover:bg-white/8 hover:text-(--text-primary)
    focus-visible:pointer-events-auto focus-visible:opacity-100
    group-hover/board:pointer-events-auto group-hover/board:opacity-100
    data-[open=true]:pointer-events-auto data-[open=true]:opacity-100
  "
>
  <HugeiconsIcon icon={MoreHorizontalIcon} size={14} strokeWidth={1.8} />
</button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-32 overflow-hidden rounded-lg border border-white/12 bg-(--bg-elevated) shadow-[0_12px_32px_-8px_rgba(0,0,0,0.7),0_2px_8px_-2px_rgba(0,0,0,0.4)]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent"
          />

          <MenuItem
            icon={PinIcon}
            label={isPinned ? "Unpin" : "Pin"}
            onClick={handle(onPin)}
          />
          <MenuItem
            icon={Edit02Icon}
            label="Rename"
            onClick={handle(onRename)}
          />
          <MenuItem
            icon={Share08Icon}
            label="Share"
            onClick={handle(onShare)}
          />
          <div className="my-1 h-px bg-white/6" />
          <MenuItem
            icon={Delete02Icon}
            label="Delete"
            onClick={handle(onDelete)}
            danger
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  label: string;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={[
        "flex h-8 w-full items-center gap-2 px-2.5 text-left font-mono text-[12px]",
        "transition-colors hover:bg-white/6",
        danger
          ? "text-(--danger)"
          : "text-(--text-secondary) hover:text-(--text-primary)",
      ].join(" ")}
    >
      <HugeiconsIcon
        icon={icon}
        size={14}
        strokeWidth={1.6}
        className="shrink-0"
      />
      <span>{label}</span>
    </button>
  );
}
