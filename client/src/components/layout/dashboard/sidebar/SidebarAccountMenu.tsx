import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen02Icon,
  LayoutLeftIcon,
  ComputerIcon,
  Home03Icon,
  LogoutSquare01Icon,
  Moon02Icon,
  Settings01Icon,
  Sun01Icon,
  UserIcon,
  SmilePlusIcon,
  MessageQuestionIcon,
  KanbanIcon,
  BellRingIcon,
} from "@hugeicons/core-free-icons";

import { Tooltip } from "@components/Tooltips/ToolTip";

import { useSidebarState } from "@/stores/sidebarState";
import { useThemeStore, type ThemeMode } from "@/stores/theme";

import SidebarModeMenu from "./SidebarModeMenu";

import type { AuthUser } from "@/types/api/auth/auth";

interface SidebarAccountMenuProps {
  user: AuthUser | null;
  onLogout: () => Promise<void>;
  onClose: () => void;
  showSidebarMode?: boolean;
  /** Opens the feedback form. The menu closes first. */
  onFeedback?: () => void;
}

interface Row {
  label: string;
  icon: typeof UserIcon;
  onClick: () => void;
}

const THEMES: Array<{ mode: ThemeMode; label: string; icon: typeof UserIcon }> =
  [
    { mode: "system", label: "System", icon: ComputerIcon },
    { mode: "light", label: "Light", icon: Sun01Icon },
    { mode: "dark", label: "Dark", icon: Moon02Icon },
  ];

/* The child panel floats, so it needs its own size to place and flip. */
const PANEL_WIDTH = 208;
const PANEL_HEIGHT = 168;
const PANEL_GAP = 8;

/**
 * The three-dots menu above the footer: who you are, the account routes, the
 * theme, how the rail behaves, then log out. Anchored bottom-left so it opens
 * upward over the nav.
 */
export function SidebarAccountMenu({
  user,
  onLogout,
  onClose,
  showSidebarMode = true,
  onFeedback,
}: SidebarAccountMenuProps) {
  const navigate = useNavigate();

  const themeMode = useThemeStore((state) => state.mode);
  const setThemeMode = useThemeStore((state) => state.setMode);

  const sidebarMode = useSidebarState((state) => state.mode);
  const setSidebarMode = useSidebarState((state) => state.setMode);

  /* Where the child panel sits, in viewport coordinates. Null means closed.
     Computed on click, never during render. */
  const [anchor, setAnchor] = useState<{ left: number; top: number } | null>(
    null,
  );
  const sidebarRowRef = useRef<HTMLButtonElement>(null);

  /* The anchor is a snapshot, so anything that moves the row closes it rather
     than leaving the panel stranded. */
  useEffect(() => {
    if (!anchor) return;

    const close = () => setAnchor(null);

    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);

    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [anchor]);

  const toggleSidebarPanel = () => {
    if (anchor) {
      setAnchor(null);
      return;
    }

    const rect = sidebarRowRef.current?.getBoundingClientRect();
    if (!rect) return;

    const left = Math.min(
      rect.right + PANEL_GAP,
      window.innerWidth - PANEL_WIDTH - PANEL_GAP,
    );

    /* Below the row unless that would run off the bottom, in which case the
       panel sits above it. */
    const top =
      rect.top + PANEL_HEIGHT > window.innerHeight - PANEL_GAP
        ? Math.max(PANEL_GAP, rect.bottom - PANEL_HEIGHT)
        : rect.top;

    setAnchor({ left, top });
  };

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  const rows: Row[] = [
    {
      label: "Feedback",
      icon: SmilePlusIcon,
      onClick: () => {
        onClose();
        onFeedback?.();
      },
    },
    {
      label: "Notifications",
      icon: BellRingIcon,
      onClick: () => go("/account/settings/profile"),
    },
    { label: "Home", icon: Home03Icon, onClick: () => go("/home") },
    { label: "Docs", icon: BookOpen02Icon, onClick: () => go("/docs") },
    {
      label: "Help",
      icon: MessageQuestionIcon,
      onClick: () => go("/help"),
    },
  ];

  return (
    <div
      role="menu"
      aria-label="Account"
      className={[
        "absolute bottom-full z-80 overflow-hidden rounded-xl border border-(--hairline-strong)  bg-(--bg-root)",
        "mb-0.5 left-0.5 w-68",
      ].join(" ")}
    >
      <div className="flex items-start gap-2 border-b border-(--hairline) px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-medium tracking-tight text-(--text-primary)">
            {user?.fullName ?? "Account"}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-(--text-muted)">
            {user?.email ?? ""}
          </p>
        </div>

        <Tooltip label="Settings" side="top" shape="solid" size="sm">
          <button
            type="button"
            onClick={() => go("/account/settings")}
            aria-label="Preferences"
            className="flex size-7 mt-2 shrink-0 cursor-pointer items-center justify-center rounded-md text-(--text-muted) transition-colors duration-200 hover:bg-(--bg-hover) hover:text-(--text-primary) motion-reduce:transition-none"
          >
            <HugeiconsIcon icon={Settings01Icon} size={14} strokeWidth={1.6} />
          </button>
        </Tooltip>
      </div>

      <div className="p-1.5">
        {rows.map((row) => (
          <button
            key={row.label}
            type="button"
            role="menuitem"
            onClick={row.onClick}
            className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[12.5px] tracking-tight text-(--text-soft) transition-colors duration-150 hover:bg-(--bg-hover) hover:text-(--text-primary) motion-reduce:transition-none"
          >
            <span className="min-w-0 flex-1 truncate">{row.label}</span>
            <HugeiconsIcon
              icon={row.icon}
              size={14}
              strokeWidth={1.6}
              className="shrink-0 text-(--text-muted) transition-colors duration-150 group-hover:text-(--text-primary) motion-reduce:transition-none"
            />
          </button>
        ))}
      </div>

      {/* Sidebar: a row that serves its own child panel on click. The icon is
          the left-right chevrons turned upright, to read as rail width. */}
      {showSidebarMode && (
        <div className="border-(--hairline) mr-2 ml-1.5 mb-1">
          <button
            ref={sidebarRowRef}
            type="button"
            role="menuitem"
            aria-haspopup="true"
            aria-expanded={Boolean(anchor)}
            onClick={toggleSidebarPanel}
            className={[
              "group flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left",
              "text-[12.5px] tracking-tight text-(--text-soft)",
              "transition-colors duration-150 motion-reduce:transition-none",
              anchor
                ? "bg-(--tint-5) text-(--text-primary)"
                : "hover:bg-(--bg-hover) hover:text-(--text-primary)",
            ].join(" ")}
          >
            <span className="min-w-0 flex-1 truncate">Sidebar</span>
            <HugeiconsIcon
              icon={LayoutLeftIcon}
              size={14}
              strokeWidth={1.6}
              className={[
                "shrink-0 transition-colors duration-150 motion-reduce:transition-none",
                anchor
                  ? "text-(--text-primary)"
                  : "text-(--text-muted) group-hover:text-(--text-primary)",
              ].join(" ")}
            />
          </button>

          {anchor &&
            createPortal(
              <div
                /* The account menu closes on any outside pointerdown, and a
                   portalled child counts as outside. Keeping the event inside
                   the panel is what lets the menu stay open. */
                onPointerDown={(event) => event.stopPropagation()}
                style={{
                  position: "fixed",
                  left: anchor.left,
                  top: anchor.top,
                }}
                className="z-90"
              >
                <SidebarModeMenu
                  mode={sidebarMode}
                  icon={KanbanIcon}
                  onSelect={(next) => {
                    setSidebarMode(next);
                    setAnchor(null);
                    onClose();
                  }}
                />
              </div>,
              document.body,
            )}
        </div>
      )}

      {/* Theme: a label with the control on the right, the way the reference
          lays it out. Icon-only segments, so each carries its own label. */}
      <div className="group border-(--hairline)">
        <div className="mb-1.5 ml-3 flex items-center gap-3 rounded-lg px-1">
          <span className="min-w-0 flex-1 truncate text-[12.5px] tracking-tight text-(--text-soft) transition-colors duration-150 group-hover:text-(--text-primary) motion-reduce:transition-none">
            Theme
          </span>

          <div
            role="group"
            aria-label="Theme"
            className="flex shrink-0 items-center gap-0.5 rounded-full border border-(--hairline) bg-(--tint-3) p-0.5 transition-colors duration-150 group-hover:border-(--hairline-strong) motion-reduce:transition-none"
          >
            {THEMES.map((theme) => {
              const active = themeMode === theme.mode;

              return (
                <button
                  key={theme.mode}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  aria-label={theme.label}
                  onClick={(event) => {
                    setThemeMode(theme.mode, event.currentTarget);
                    setAnchor(null);
                    onClose();
                  }}
                  className={[
                    "flex size-6 cursor-pointer items-center justify-center rounded-full",
                    "transition-colors duration-150 motion-reduce:transition-none",
                    active
                      ? "bg-(--tint-10) text-(--accent)"
                      : "text-(--text-muted) hover:text-(--text-primary)",
                  ].join(" ")}
                >
                  <HugeiconsIcon
                    icon={theme.icon}
                    size={12}
                    strokeWidth={1.7}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-(--hairline) p-1.5">
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onClose();
            void onLogout();
          }}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[12.5px] tracking-tight text-(--text-soft) transition-colors duration-150 hover:bg-(--tint-4) hover:text-(--danger) motion-reduce:transition-none"
        >
          <span className="min-w-0 flex-1 truncate">Log out</span>
          <HugeiconsIcon
            icon={LogoutSquare01Icon}
            size={14}
            strokeWidth={1.6}
            className="shrink-0"
          />
        </button>
      </div>
    </div>
  );
}

export default SidebarAccountMenu;
