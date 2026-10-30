import { useEffect, useRef, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";

import { Avatar } from "@components/layout/board/BoardAvatar";
import { Tooltip } from "@components/Tooltips/ToolTip";

import SidebarAccountMenu from "./SidebarAccountMenu";
import FeedbackDialog from "./FeedbackDialog";

import { avatarColor } from "@/features/boards/board.helpers";

import type { AuthUser } from "@/types/api/auth/auth";

interface SidebarFooterProps {
  collapsed: boolean;
  user: AuthUser | null;
  onLogout: () => Promise<void>;
  /** Off where the rail cannot change, such as the mobile drawer. */
  showSidebarMode?: boolean;
  /**
   * Hover mode: the pointer arriving on the footer opens the menu, because the
   * rail itself already opened that way and a click would be a second gesture
   * for the same intent.
   */
  hoverMode?: boolean;
}

type Panel = "account" | "notifications" | null;

export default function SidebarFooter({
  collapsed,
  user,
  onLogout,
  showSidebarMode,
  hoverMode = false,
}: SidebarFooterProps) {
  const [panel, setPanel] = useState<Panel>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!panel) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setPanel(null);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [panel]);

  const toggle = (next: Exclude<Panel, null>) =>
    setPanel((current) => (current === next ? null : next));

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  useEffect(() => cancelClose, []);

  /* The container holds the menu as well, so moving the pointer from the row
     into the menu never counts as leaving. */
  const onEnter = () => {
    if (!hoverMode) return;
    cancelClose();
    setPanel("account");
  };

  const onLeave = () => {
    if (!hoverMode) return;
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setPanel(null);
    }, 150);
  };

  if (collapsed) {
    return (
      <div
        ref={containerRef}
        onClick={(event) => event.stopPropagation()}
        className="relative flex shrink-0 flex-col items-center gap-1 border-(--hairline) py-2"
      >
        {panel === "account" && (
          <SidebarAccountMenu
            user={user}
            onLogout={onLogout}
            onClose={() => setPanel(null)}
            showSidebarMode={showSidebarMode}
            onFeedback={() => setFeedbackOpen(true)}
          />
        )}

        {feedbackOpen && (
          <FeedbackDialog onClose={() => setFeedbackOpen(false)} user={user} />
        )}

        <Tooltip label="Account" side="right" shape="solid" size="sm">
          <button
            type="button"
            onClick={() => toggle("account")}
            aria-label="Account"
            aria-expanded={panel === "account"}
            className="flex size-10 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 motion-reduce:transition-none"
          >
            <Avatar
              member={{
                id: user?.id ?? "me",
                name: user?.fullName,
                avatarUrl: user?.avatarUrl ?? null,
                color: avatarColor(user?.id ?? "me"),
              }}
              size={28}
              ring={false}
            />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="relative shrink-0 border-(--hairline) px-3 py-2"
    >
      {panel === "account" && (
        <SidebarAccountMenu
          user={user}
          onLogout={onLogout}
          onClose={() => setPanel(null)}
          showSidebarMode={showSidebarMode}
          onFeedback={() => setFeedbackOpen(true)}
        />
      )}

      {feedbackOpen && (
        <FeedbackDialog onClose={() => setFeedbackOpen(false)} user={user} />
      )}

      {/* One target for the whole row. */}
      <button
        type="button"
        /* In hover mode a click opens rather than toggles: the pointer already
           opened it, and closing on click would fight the hover. */
        onClick={() => (hoverMode ? setPanel("account") : toggle("account"))}
        aria-haspopup="menu"
        aria-expanded={panel === "account"}
        className={[
          "group flex w-full cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-left",
          "transition-colors duration-200 motion-reduce:transition-none",
        ].join(" ")}
      >
        <Avatar
          member={{
            id: user?.id ?? "me",
            name: user?.fullName,
            avatarUrl: user?.avatarUrl ?? null,
            color: avatarColor(user?.id ?? "me"),
          }}
          size={28}
          ring={false}
        />

        <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium tracking-tight text-(--text-primary)">
          {user?.fullName ?? "Account"}
        </span>

        {/* The name alone would leave the menu unnamed, and an aria-label would
            override the name the row already shows. */}
        <span className="sr-only">, account menu</span>

        {/* The dots are the affordance, not a second control. */}
        <span
          aria-hidden="true"
          className={[
            "flex size-7 shrink-0 items-center justify-center rounded-full border",
            "transition-colors duration-200 motion-reduce:transition-none",
            panel === "account"
              ? "border-(--hairline-strong) bg-(--tint-8) text-(--text-primary)"
              : [
                  "border-(--hairline) text-(--text-secondary)",
                  "group-hover:border-(--hairline-strong) group-hover:bg-(--tint-9) group-hover:text-(--text-primary)",
                ].join(" "),
          ].join(" ")}
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} size={14} strokeWidth={2} />
        </span>
      </button>
    </div>
  );
}
