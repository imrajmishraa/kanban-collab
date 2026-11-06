import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown,
  ComputerIcon,
  Moon02Icon,
  PanelLeftOpenIcon,
  PanelLeftCloseIcon,
  Sun03Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

import { useThemeStore } from "@/stores/theme";
import { cn } from "@/utils/cn";

import {
  DOCS_NAV,
  isSection,
  type DocsNavChild,
  type DocsNavGroup,
} from "./docsConfig";

/**
 * The left column: the documentation tree, and the two controls under it.
 *
 * `DocsNavList` is exported because the phone drawer renders the same tree. One
 * component, two placements — the alternative was two copies of the same
 * active-state logic, which is exactly the kind of thing that drifts.
 *
 * The column can be collapsed. When it is, the tree goes and the two controls
 * stay, floating in the corner: the theme switch and the button that brings the
 * column back. A collapsed sidebar with no way to expand it is a dead end, and
 * losing the theme switch with it would be a second one.
 *
 * Colour: every row rests in `--text-muted`. The active page is the only thing
 * that carries the blue — the tint behind it and the ink on top — so the eye
 * finds the current page without the rest of the tree competing for attention.
 */

/* ── Leaves and sections ────────────────────────────────────────────────── */

function NavLeaf({
  title,
  href,
  nested = false,
  onNavigate,
}: {
  title: string;
  href: string;
  nested?: boolean;
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();
  const active = pathname === href;

  return (
    <Link
      to={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center text-[13px] text-(--text-muted)",
        nested ? "ml-3 border-l border-(--hairline) py-1.5 pl-4" : "px-3 py-2",
        active
          ? "bg-blue-400/30 font-semibold text-blue-500"
          : "hover:bg-(--tint-8) hover:text-(--text-primary)",
      )}
    >
      {title}
    </Link>
  );
}

function NavSection({
  title,
  children,
  onNavigate,
}: {
  title: string;
  children: DocsNavChild[];
  onNavigate?: () => void;
}) {
  return (
    <div className="mt-2">
      {/* A section heading is a label, never the current page, so it stays in
          the resting colour like every other row. */}
      <p className="ml-3 border-l border-(--hairline) py-1.5 pl-4 text-[13px] font-semibold text-(--text-muted)">
        {title}
      </p>
      <div className="flex flex-col">
        {children.map((child) =>
          isSection(child) ? null : (
            <NavLeaf
              key={child.href}
              title={child.title}
              href={child.href}
              nested
              onNavigate={onNavigate}
            />
          ),
        )}
      </div>
    </div>
  );
}

function NavGroupItem({
  group,
  onNavigate,
}: {
  group: DocsNavGroup;
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();
  const containsActive = group.children?.some(
    (child) =>
      (!isSection(child) && child.href === pathname) ||
      (isSection(child) &&
        child.children.some((leaf) => leaf.href === pathname)),
  );
  const [open, setOpen] = useState(Boolean(containsActive));

  if (!group.children) {
    return (
      <NavLeaf title={group.title} href={group.href} onNavigate={onNavigate} />
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="
          flex w-full cursor-pointer items-center justify-between rounded-lg
          px-3 py-2 text-left text-[14px] text-(--text-muted)
          transition-colors duration-150
          hover:bg-(--tint-8) hover:text-(--text-primary)
        "
      >
        {group.title}
        <HugeiconsIcon
          icon={ArrowDown}
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className={cn(
            "shrink-0 transition-transform duration-200 motion-reduce:transition-none",
            !open && "-rotate-90",
          )}
        />
      </button>

      {open ? (
        <div className="mt-1 flex flex-col">
          {group.children.map((child) =>
            isSection(child) ? (
              <NavSection
                key={child.title}
                title={child.title}
                children={child.children}
                onNavigate={onNavigate}
              />
            ) : (
              <NavLeaf
                key={child.href}
                title={child.title}
                href={child.href}
                nested
                onNavigate={onNavigate}
              />
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}

/** The tree on its own, for the drawer. */
export function DocsNavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Documentation" className="flex flex-col gap-0.5">
      {DOCS_NAV.map((group) => (
        <NavGroupItem key={group.href} group={group} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

/* ── The two controls ───────────────────────────────────────────────────── */

const THEMES = [
  { mode: "light", label: "Light", icon: Sun03Icon },
  { mode: "dark", label: "Dark", icon: Moon02Icon },
  { mode: "system", label: "System", icon: ComputerIcon },
] as const;

/**
 * The theme control, as a menu.
 *
 * It used to cycle: light, then dark, then system. Cycling hides two of the
 * three choices behind a guess — you cannot ask for "system" without going
 * through the other two first — so the row now opens a small popover with all
 * three and a tick on the current one, the way the reference does it.
 */
export function ThemeSwitch({ compact = false }: { compact?: boolean }) {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const current = THEMES.find((item) => item.mode === mode) ?? THEMES[2];

  useEffect(() => {
    if (!open) return;

    const onDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
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

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Theme: ${current.label}`}
        className={cn(
          "flex cursor-pointer items-center gap-2.5 rounded-lg text-[14px]",
          "text-(--text-secondary) transition-colors duration-150",
          "hover:bg-(--tint-8) hover:text-(--text-primary)",
          compact ? "size-9 justify-center" : "w-full px-3 py-2",
        )}
      >
        <HugeiconsIcon
          icon={current.icon}
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
        />
        {compact ? null : current.label}
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute z-50 w-44 overflow-hidden rounded-xl border",
            "border-(--hairline) bg-(--bg-surface) p-1",
            "shadow-[0_18px_50px_-12px_rgba(0,0,0,0.28)]",
            /* Where it opens depends on where the control is. In the column it
               sits at the bottom, so the menu goes upward or it falls off the
               viewport. In the rail the button is only 56px wide and the menu
               is 176, so it opens to the side instead of hanging over the
               article. */
            compact ? "bottom-0 left-full ml-2" : "bottom-full left-0 mb-2",
          )}
        >
          {THEMES.map((item) => (
            <button
              key={item.mode}
              type="button"
              role="menuitemradio"
              aria-checked={item.mode === mode}
              onClick={(event) => {
                setMode(item.mode, event.currentTarget);
                setOpen(false);
              }}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between gap-3",
                "rounded-lg px-3 py-2 text-left text-[14px]",
                "transition-colors duration-150 hover:bg-(--tint-4)",
                item.mode === mode
                  ? "font-medium text-(--brand)"
                  : "text-(--text-secondary)",
              )}
            >
              {item.label}
              {item.mode === mode ? (
                <HugeiconsIcon icon={Tick02Icon} size={15} strokeWidth={2} />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ── The column ─────────────────────────────────────────────────────────── */

interface DocsSidebarLeftProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function DocsSidebarLeft({
  collapsed,
  onToggle,
}: DocsSidebarLeftProps) {
  if (collapsed) {
    return (
      <aside className="hidden shrink-0 lg:block lg:w-14">
        <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col items-center justify-end gap-1 py-8 sm:top-17 sm:h-[calc(100vh-4.25rem)]">
          <div className="mb-2 w-6 border-t border-(--hairline)" />

          <ThemeSwitch compact />

          <button
            type="button"
            onClick={onToggle}
            aria-label="Expand the sidebar"
            aria-controls="docs-sidebar"
            aria-expanded={false}
            className="grid size-9 cursor-pointer place-items-center rounded-lg text-(--text-secondary) transition-colors duration-150 hover:bg-(--tint-8) hover:text-(--text-primary)"
          >
            <HugeiconsIcon
              icon={PanelLeftCloseIcon}
              size={16}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden shrink-0 lg:block lg:w-64">
      {/* `h-` rather than `max-h`: with a max, a short nav lets the column
          shrink and the footer rides up with it, so the row sits under the last
          link instead of at the bottom of the viewport.

          The height is the viewport minus the header, and the header is two
          different heights — 64px below `sm`, 68px from it — so the subtraction
          changes with the same breakpoint. One fixed 4rem left the footer 4px
          past the bottom edge on every desktop width. */}
      <div
        id="docs-sidebar"
        className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col py-4 sm:top-17 sm:h-[calc(100vh-4.25rem)]"
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          <DocsNavList />
        </div>

        {/* Pinned to the bottom of the column by the flex layout above: the nav
            is the only child that grows and scrolls, so this row cannot move.
            It must stay in the flow — `fixed` took it out of the column and the
            `hidden` that came with it made it disappear entirely. */}
        <div className="mt-6 flex shrink-0 items-center gap-1 border-t border-(--hairline) pt-4">
          <div className="min-w-0 flex-1">
            <ThemeSwitch />
          </div>

          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse the sidebar"
            aria-controls="docs-sidebar"
            aria-expanded
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-(--text-secondary) transition-colors duration-150 hover:bg-(--tint-8) hover:text-(--text-primary)"
          >
            <HugeiconsIcon
              icon={PanelLeftOpenIcon}
              size={16}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
