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
          <div className="flex h-9 w-full max-w-xs items-center gap-1.5 rounded-lg border border-orange-50/15 bg-white/3 px-3 transition-colors duration-200 focus-within:border-orange-50/30">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              strokeWidth={1.6}
              className="shrink-0 text-neutral-600"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search cards…"
              aria-label="Search cards"
              className="min-w-0 flex-1 bg-transparent text-[12px] tracking-tight text-neutral-100 outline-none placeholder:text-neutral-600"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearch("")}
                aria-label="Clear search"
                className="flex size-6 shrink-0 items-center justify-center rounded text-neutral-600 transition-colors hover:text-neutral-300"
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
              className="shrink-0 text-neutral-500"
            />
            <div className="flex max-w-[42vw] items-center gap-1.5 overflow-x-auto">
              {labels.map((label) => {
                const active = labelFilter === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onToggleLabel(label)}
                    className="shrink-0 rounded-md px-2 py-1 text-[10px] uppercase tracking-wider transition-colors duration-200"
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
                className="shrink-0 text-neutral-500"
              />
              <span>{SORT_LABELS[sortBy]}</span>
            </button>

            {sortOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-30 mt-2 w-40 overflow-hidden rounded-xl border border-orange-50/15 bg-(--bg-elevated) shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)]"
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
                      "flex h-8 w-full items-center rounded-md px-2 text-[11.5px] transition-colors hover:bg-white/6",
                      sortBy === key ? "text-(--brand)" : "text-neutral-400",
                    ].join(" ")}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggle */}
          <div className="flex h-9 items-center gap-0.5 rounded-lg border border-orange-50/15 bg-white/3 p-0.5">
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
                  "flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors duration-200",
                  view === mode
                    ? "bg-white/10 text-orange-100"
                    : "text-neutral-500 hover:bg-white/5 hover:text-neutral-100",
                ].join(" ")}
              >
                <HugeiconsIcon icon={icon} size={15} strokeWidth={1.6} />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onAddCard}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-none rounded-tr-lg rounded-bl-lg bg-white px-4 text-[12px] font-semibold text-black transition-colors duration-200 hover:bg-neutral-200"
          >
            <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={1.6} />
            Add card
          </button>
        </div>
      </div>

      {dragPaused && view === "board" && (
        <p className="mt-2.5 text-[11px] text-neutral-600">
          Drag is paused while a filter or non-manual sort is active.
        </p>
      )}
    </section>
  );
}
