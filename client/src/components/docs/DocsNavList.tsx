import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/cn";
import {
  DOCS_NAV,
  isSection,
  type DocsNavChild,
  type DocsNavGroup,
} from "./docsConfig";

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
          ? "bg-(--link)/30 font-semibold text-(--link)"
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
