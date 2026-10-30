import { useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { hasChildren, type NavNode } from "./navConfig";

interface SidebarDrillPanelProps {
  /** The node whose children are on screen. */
  node: NavNode;
  /** Ancestors of that node, nearest last, for the crumb and the back label. */
  parents: NavNode[];
  /** pathname + search, so a child carrying a query string can be active. */
  routeKey: string;
  onBack: () => void;
  onDrill: (node: NavNode) => void;
}

const ROW = [
  "group/row flex h-9 w-full cursor-pointer items-center gap-3 rounded-lg px-3",
  "text-[13px] tracking-tight transition-colors duration-200",
  "motion-reduce:transition-none",
].join(" ");

const ROW_IDLE = "text-neutral-400 hover:bg-white/4 hover:text-neutral-100";
const ROW_ACTIVE = "bg-white/6 text-neutral-100";

const SidebarDrillPanel = ({
  node,
  parents,
  routeKey,
  onBack,
  onDrill,
}: SidebarDrillPanelProps) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLElement>(null);
  const children = node.children ?? [];
  const parent = parents[parents.length - 1];

  /* Focus moves into the panel when it opens or changes level, so the arrow
     keys work without reaching for the mouse. */
  useEffect(() => {
    containerRef.current?.focus({ preventScroll: true });
  }, [node.key]);

  /* A deep link can land on a row that is scrolled out of view. */
  useEffect(() => {
    const active = containerRef.current?.querySelector<HTMLElement>(
      '[aria-current="page"]',
    );
    if (!active) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    active.scrollIntoView({
      block: "nearest",
      behavior: reduce ? "auto" : "smooth",
    });
  }, [routeKey, node.key]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const rows = Array.from(
      containerRef.current?.querySelectorAll<HTMLElement>(
        "[data-rows] a, [data-rows] button",
      ) ?? [],
    );
    const index = rows.indexOf(document.activeElement as HTMLElement);

    if (event.key === "ArrowLeft" || event.key === "Escape") {
      event.preventDefault();
      onBack();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!rows.length) return;
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      const next =
        index === -1 ? 0 : (index + step + rows.length) % rows.length;
      rows[next]?.focus();
      return;
    }

    if (event.key === "ArrowRight" && index > -1) {
      const drillKey = rows[index]?.getAttribute("data-drill-key");
      if (!drillKey) return;
      const child = children.find((entry) => entry.key === drillKey);
      if (!child) return;
      event.preventDefault();
      onDrill(child);
      navigate(child.href);
    }
  };

  /* Grouped by their optional heading, order preserved. */
  const groups: Array<{ title?: string; items: NavNode[] }> = [];

  for (const child of children) {
    const last = groups[groups.length - 1];

    if (last && last.title === child.section) {
      last.items.push(child);
    } else {
      groups.push({ title: child.section, items: [child] });
    }
  }

  return (
    <nav
      ref={containerRef}
      tabIndex={-1}
      aria-label={`${node.label} navigation`}
      onKeyDown={onKeyDown}
      className="border-b border-orange-50/10 px-3 py-3 outline-hidden"
    >
      <div className="mb-1 flex h-9 items-center gap-1">
        <button
          type="button"
          onClick={onBack}
          aria-label={parent ? `Back to ${parent.label}` : "Back to navigation"}
          className="group relative mb-1 flex h-9 w-full cursor-pointer items-center justify-center rounded-md transition-colors duration-200 hover:bg-white/6 motion-reduce:transition-none"
        >
          {/* Left-aligned back icon */}
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={14}
            strokeWidth={1.8}
            className="absolute left-2 shrink-0 text-neutral-500 transition-colors duration-200 group-hover:text-neutral-200"
          />

          {/* Perfectly centered title */}
          <span className="w-full truncate px-8 text-center text-[13px] font-medium tracking-tight text-neutral-100">
            {node.label}
          </span>
        </button>
      </div>

      {parents.length > 0 && (
        <p className="truncate px-3 pb-1 text-[9px] font-medium uppercase tracking-[0.14em] text-neutral-600">
          {parents.map((entry) => entry.label).join(" / ")}
        </p>
      )}

      <div data-rows>
        {groups.map((group, index) => (
          <div key={group.title ?? `group-${index}`} className="mt-1">
            {group.title && (
              <p className="px-3 pb-1 pt-2 text-[9.5px] font-medium uppercase tracking-[0.14em] text-neutral-600">
                {group.title}
              </p>
            )}

            <div className="flex flex-col gap-0.5">
              {group.items.map((child) => {
                const isActive = child.href === routeKey;
                const openable = hasChildren(child);

                const icon = (
                  <span
                    className={[
                      "flex size-5 shrink-0 items-center justify-center",
                      isActive ? "text-orange-100" : "text-neutral-500",
                    ].join(" ")}
                  >
                    <HugeiconsIcon
                      icon={child.icon}
                      size={16}
                      strokeWidth={1.5}
                    />
                  </span>
                );

                const label = (
                  <span className="min-w-0 flex-1 truncate text-left">
                    {child.label}
                  </span>
                );

                const badge =
                  child.badge !== undefined && child.badge !== "" ? (
                    <span className="shrink-0 rounded-full bg-orange-100/10 px-1.5 py-0.5 font-mono text-[9px] font-medium tabular-nums text-orange-100">
                      {child.badge}
                    </span>
                  ) : null;

                /* The chevron only appears when there is somewhere to go. */
                const chevron = openable ? (
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={12}
                    strokeWidth={1.8}
                    className="shrink-0 text-neutral-600 transition-transform duration-200 group-hover/row:translate-x-0.5 motion-reduce:transition-none"
                  />
                ) : null;

                if (openable) {
                  return (
                    <button
                      key={child.key}
                      type="button"
                      data-drill-key={child.key}
                      onClick={() => {
                        onDrill(child);
                        navigate(child.href);
                      }}
                      className={[ROW, isActive ? ROW_ACTIVE : ROW_IDLE].join(
                        " ",
                      )}
                    >
                      {icon}
                      {label}
                      {badge}
                      {chevron}
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={child.key}
                    to={child.href}
                    aria-current={isActive ? "page" : undefined}
                    className={[ROW, isActive ? ROW_ACTIVE : ROW_IDLE].join(
                      " ",
                    )}
                  >
                    {icon}
                    {label}
                    {badge}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default SidebarDrillPanel;
