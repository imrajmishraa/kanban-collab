import { useEffect, useRef, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Cancel01Icon,
  FilterIcon,
  KanbanIcon,
  Layout01Icon,
  Search01Icon,
  SlidersHorizontalIcon,
} from "@hugeicons/core-free-icons";

import { labelColor, ui } from "@/features/boards/board.helpers";

import type { SortKey, ViewMode } from "@/features/boards/board.helpers";

interface BoardToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  labels: string[];
  labelFilter: string | null;
  onToggleLabel: (label: string) => void;
  sortBy: SortKey;
  onSortChange: (sort: SortKey) => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onAddCard: () => void;
  dragPaused: boolean;
}

const SORT_LABELS: Record<SortKey, string> = {
  manual: "Manual",
  dueDate: "Due date",
  title: "Title",
};

export default function BoardToolbar({
  search,
  onSearch,
  labels,
  labelFilter,
  onToggleLabel,
  sortBy,
  onSortChange,
  view,
  onViewChange,
  onAddCard,
  dragPaused,
}: BoardToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sortOpen) return;
    const onDown = (event: PointerEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) setSortOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [sortOpen]);

  return (
    <section aria-label="Board toolbar" className="mt-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search + label filter */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div className="flex h-9 w-full max-w-xs items-center rounded-full border border-white/8 bg-white/6 transition-colors duration-200 focus-within:border-white/16">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              strokeWidth={1.6}
              className="ml-3.5 shrink-0 text-(--text-muted)"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search cards…"
              aria-label="Search cards"
              className="min-w-0 flex-1 bg-transparent px-2 font-mono text-[12px] text-(--text-primary) outline-none placeholder:text-(--text-muted)"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearch("")}
                aria-label="Clear search"
                className="mr-1.5 flex size-7 items-center justify-center rounded-full text-(--text-muted) transition-colors hover:text-(--text-primary)"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={13}
                  strokeWidth={1.6}
                />
              </button>
            )}
          </div>

          <div className="flex min-w-0 items-center gap-1.5">
            <HugeiconsIcon
              icon={FilterIcon}
              size={13}
              strokeWidth={1.6}
              className="shrink-0 text-(--text-muted)"
            />
            <div className="flex max-w-[42vw] items-center gap-1.5 overflow-x-auto">
              {labels.map((label) => {
                const active = labelFilter === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onToggleLabel(label)}
                    className="shrink-0 rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest transition-colors duration-200"
                    style={{
                      color: labelColor(label),
                      background: active
                        ? `${labelColor(label)}33`
                        : "transparent",
                      border: `1px solid ${labelColor(label)}${active ? "80" : "33"}`,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sort + view + add */}
        <div className="flex items-center gap-2">
          <div ref={sortRef} className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((value) => !value)}
              aria-haspopup="menu"
              aria-expanded={sortOpen}
              className={ui.pill}
            >
              <HugeiconsIcon
                icon={SlidersHorizontalIcon}
                size={14}
                strokeWidth={1.6}
                className="shrink-0 text-(--text-muted)"
              />
              <span>{SORT_LABELS[sortBy]}</span>
            </button>

            {sortOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-30 mt-2 w-40 overflow-hidden rounded-xl border border-white/10 bg-(--bg-elevated) shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)]"
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onSortChange(key);
                      setSortOpen(false);
                    }}
                    className={[
                      "flex h-9 w-full items-center px-3 font-mono text-[12px] transition-colors hover:bg-white/6",
                      sortBy === key
                        ? "text-(--brand)"
                        : "text-(--text-secondary)",
                    ].join(" ")}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggle */}
          <div className="flex h-9 items-center rounded-full border border-white/8 bg-white/6 p-0.5">
            {(
              [
                ["board", KanbanIcon, "Board view"],
                ["list", Layout01Icon, "List view"],
              ] as Array<[ViewMode, typeof KanbanIcon, string]>
            ).map(([mode, icon, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewChange(mode)}
                aria-pressed={view === mode}
                aria-label={label}
                className={[
                  "flex size-8 items-center justify-center rounded-full transition-colors duration-200",
                  view === mode
                    ? "bg-white/10 text-(--text-primary)"
                    : "text-(--text-muted) hover:text-(--text-primary)",
                ].join(" ")}
              >
                <HugeiconsIcon icon={icon} size={15} strokeWidth={1.6} />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onAddCard}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-(--brand-border) bg-(--brand-muted) px-4 font-mono text-[12px] text-(--brand-hover) transition-colors duration-200 hover:bg-[rgba(255,107,53,0.18)] hover:text-(--text-primary)"
          >
            <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={1.6} />
            Add card
          </button>
        </div>
      </div>

      {dragPaused && view === "board" && (
        <p className="mt-2.5 font-mono text-[10px] uppercase tracking-wider text-(--text-muted)">
          Drag is paused while a filter or non-manual sort is active.
        </p>
      )}
    </section>
  );
}
