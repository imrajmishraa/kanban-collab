import { useEffect, useRef, useState, type ComponentProps } from "react";
import { createPortal } from "react-dom";
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

interface MenuPosition {
  top: number;
  left: number;
  openUp: boolean;
}

const MENU_WIDTH = 128;
const MENU_HEIGHT = 168;
const MENU_GAP = 4;
const VIEWPORT_PADDING = 8;

export function BoardActionsMenu({
  onPin,
  onRename,
  onShare,
  onDelete,
  isPinned = false,
}: BoardActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const shouldOpenUp =
      spaceBelow < MENU_HEIGHT + VIEWPORT_PADDING && spaceAbove > spaceBelow;

    let top = shouldOpenUp
      ? rect.top - MENU_HEIGHT - MENU_GAP
      : rect.bottom + MENU_GAP;

    let left = rect.right - MENU_WIDTH;

    // Keep menu inside viewport horizontally.
    left = Math.max(
      VIEWPORT_PADDING,
      Math.min(left, window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING),
    );

    // Keep menu inside viewport vertically.
    top = Math.max(
      VIEWPORT_PADDING,
      Math.min(top, window.innerHeight - MENU_HEIGHT - VIEWPORT_PADDING),
    );

    setPosition({
      top,
      left,
      openUp: shouldOpenUp,
    });
  };

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!open) {
      setOpen(true);

      requestAnimationFrame(() => {
        updatePosition();
      });

      return;
    }

    setOpen(false);
    setPosition(null);
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
      setPosition(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setPosition(null);
        triggerRef.current?.focus();
      }
    };

    const handleViewportChange = () => {
      updatePosition();
    };

    document.addEventListener("pointerdown", handlePointerDown);

    document.addEventListener("keydown", handleKeyDown);

    window.addEventListener("resize", handleViewportChange);

    /*
     * Capture scroll from any ancestor.
     * This is important because SidebarBoards
     * can live inside a scroll container.
     */
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);

      document.removeEventListener("keydown", handleKeyDown);

      window.removeEventListener("resize", handleViewportChange);

      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open]);

  const handleAction = (callback: () => void) => (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setOpen(false);
    setPosition(null);

    callback();
  };

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-label="Board actions"
        aria-haspopup="menu"
        aria-expanded={open}
        data-open={open}
        className="
          flex
          size-6
          shrink-0
          cursor-pointer
          items-center
          justify-center
          rounded-full

          bg-(--bg-elevated)
          text-(--text-muted)

          opacity-0
          pointer-events-none

          transition-all
          duration-150

          hover:bg-white/8
          hover:text-(--text-primary)

          focus-visible:pointer-events-auto
          focus-visible:opacity-100
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-(--brand)/40

          group-hover/board:pointer-events-auto
          group-hover/board:opacity-100

          data-[open=true]:pointer-events-auto
          data-[open=true]:opacity-100
        "
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} size={14} strokeWidth={1.8} />
      </button>

      {/* Portal Menu */}
      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Board actions"
            className="
              fixed
              z-99999
              w-32
              overflow-hidden
              rounded-lg
              border
              border-white/12
              bg-(--bg-elevated)

              shadow-[0_12px_32px_-8px_rgba(0,0,0,0.7),0_2px_8px_-2px_rgba(0,0,0,0.4)]

              animate-in
              fade-in
              zoom-in-95
              duration-100
            "
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            {/* Top highlight */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-px
                bg-linear-to-r
                from-transparent
                via-white/15
                to-transparent
              "
            />

            <MenuItem
              icon={PinIcon}
              label={isPinned ? "Unpin" : "Pin"}
              onClick={handleAction(onPin)}
            />

            <MenuItem
              icon={Edit02Icon}
              label="Rename"
              onClick={handleAction(onRename)}
            />

            <MenuItem
              icon={Share08Icon}
              label="Share"
              onClick={handleAction(onShare)}
            />

            <div aria-hidden="true" className="my-1 h-px bg-white/6" />

            <MenuItem
              icon={Delete02Icon}
              label="Delete"
              onClick={handleAction(onDelete)}
              danger
            />
          </div>,
          document.body,
        )}
    </>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: ComponentProps<typeof HugeiconsIcon>["icon"];
  label: string;
  onClick: (event: React.MouseEvent) => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={[
        "flex h-8 w-full items-center gap-2",
        "px-2.5",
        "text-left font-mono text-[12px]",
        "transition-colors duration-100",
        "focus-visible:outline-none",
        "focus-visible:bg-white/8",

        danger
          ? ["text-(--danger)", "hover:bg-(--danger)/8"].join(" ")
          : [
              "text-(--text-secondary)",
              "hover:bg-white/6",
              "hover:text-orange-400",
            ].join(" "),
      ].join(" ")}
    >
      <HugeiconsIcon
        icon={icon}
        size={14}
        strokeWidth={1.6}
        className="shrink-0)"
      />

      <span className="truncate ">{label}</span>
    </button>
  );
}
