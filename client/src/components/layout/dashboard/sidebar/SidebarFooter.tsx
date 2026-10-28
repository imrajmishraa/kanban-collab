import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Logout01Icon,
  Menu01Icon,
  Settings01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import type { AuthUser } from "@/types/api/auth/auth";

interface SidebarMoreProps {
  collapsed: boolean;
  user: AuthUser | null;
  onLogout: () => Promise<void>;
  /** Kept for call-site compatibility; positioning follows `collapsed`. */
  mobile?: boolean;
}

export default function SidebarFooter({
  collapsed,
  user,
  onLogout,
}: SidebarMoreProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [suppressHover, setSuppressHover] = useState(false);
  const [lastPathname, setLastPathname] = useState(location.pathname);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (location.pathname !== lastPathname) {
    setLastPathname(location.pathname);
    setPinned(false);
    setHovered(false);
    setSuppressHover(false);
  }

  /** Pinned by click, or hovered and not suppressed by a close-click. */
  const isOpen = pinned || (hovered && !suppressHover);

  useEffect(() => {
    if (!isOpen) return;

    const close = () => {
      setPinned(false);
      setHovered(false);
      setSuppressHover(false);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (containerRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;

      close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      close();
      buttonRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleMenu = (event: MouseEvent<HTMLButtonElement>) => {
    // The collapsed `<aside>` expands on any click; this one belongs to us.
    event.stopPropagation();

    if (isOpen) {
      setPinned(false);
      // Keep it shut while the pointer is still resting on the trigger.
      setSuppressHover(true);
      return;
    }

    setPinned(true);
    setSuppressHover(false);
  };

  const handlePointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    // Touch fires `pointerenter` right before the tap's click; ignoring
    // non-mouse pointers keeps the tap from opening and then re-closing it.
    if (event.pointerType !== "mouse") return;

    setHovered(true);
  };

  const handlePointerLeave = () => {
    setHovered(false);
    setSuppressHover(false);
  };

  const closeMenu = () => {
    setPinned(false);
    setHovered(false);
    setSuppressHover(false);
  };

  const handleProfile = () => {
    closeMenu();
    navigate("/user/profile");
  };

  const handleSettings = () => {
    closeMenu();
    navigate("/settings");
  };

  const handleLogout = async () => {
    closeMenu();
    await onLogout();
  };

  const menu = (
    <div
      role="menu"
      className={[
        "absolute z-50 overflow-hidden",
        collapsed
          ? "bottom-0 left-full w-48 pl-2"
          : "bottom-full left-3 right-3 pb-2",
        isOpen ? "block" : "hidden",
      ].join(" ")}
    >
      <div className="relative overflow-hidden rounded-lg border border-white/12 bg-(--bg-elevated) shadow-[0_12px_32px_-8px_rgba(0,0,0,0.7),0_2px_8px_-2px_rgba(0,0,0,0.4)]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent"
        />

        <div className="relative border-b border-white/6 px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/4 text-(--text-secondary)">
              <HugeiconsIcon icon={UserIcon} size={13} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-mono text-[11px] text-(--text-primary)">
                {user?.fullName ?? "User"}
              </p>
              <p className="truncate font-mono text-[9px] text-(--text-muted)">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
        </div>

        <div className="relative p-1">
          <FlyoutItem icon={UserIcon} label="Profile" onClick={handleProfile} />
          <FlyoutItem
            icon={Settings01Icon}
            label="Settings"
            onClick={handleSettings}
          />
        </div>

        <div className="relative border-t border-white/6 p-1">
          <FlyoutItem
            icon={Logout01Icon}
            label="Logout"
            onClick={handleLogout}
            danger
          />
        </div>
      </div>
    </div>
  );

  if (collapsed) {
    return (
      <div
        ref={containerRef}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className="relative shrink-0 border-t border-white/8 py-3"
      >
        {menu}

        <button
          ref={buttonRef}
          type="button"
          title="More"
          aria-label="More"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onClick={toggleMenu}
          className={[
            "mx-auto flex size-9 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200",
            isOpen
              ? "bg-white/6 text-(--text-primary)"
              : "text-(--text-secondary) hover:bg-white/4 hover:text-(--text-primary)",
          ].join(" ")}
        >
          <HugeiconsIcon icon={Menu01Icon} size={16} strokeWidth={1.5} />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className="relative shrink-0 border-t border-white/8 px-3 py-3"
    >
      {menu}

      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={toggleMenu}
        className={[
          "flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors duration-200",
          isOpen ? "bg-white/6" : "hover:bg-white/4",
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <HugeiconsIcon
            icon={Menu01Icon}
            size={16}
            strokeWidth={1.5}
            className="shrink-0 text-(--text-secondary)"
          />
          <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-(--text-secondary)">
            MORE
          </span>
        </div>
      </button>
    </div>
  );
}

function FlyoutItem({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: typeof UserIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={[
        "flex w-full cursor-pointer items-center gap-2.5 rounded-md",
        "px-2 py-1.5 text-left font-mono text-[11px]",
        "transition-colors duration-150",
        danger
          ? "text-(--text-secondary) hover:bg-rose-500/8 hover:text-rose-300"
          : "text-(--text-secondary) hover:bg-white/5 hover:text-(--text-primary)",
      ].join(" ")}
    >
      <HugeiconsIcon
        icon={icon}
        size={13}
        strokeWidth={1.5}
        className="shrink-0"
      />
      <span>{label}</span>
    </button>
  );
}
