import {
  Add01Icon,
  FilterIcon,
  Search01Icon,
  SlidersHorizontalIcon,
  UserGroupIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

interface BoardToolbarProps {
  boardId: string;
  onSearch?: (value: string) => void;
  onFilter?: () => void;
  onMembers?: () => void;
  onSort?: () => void;
  onAddCard?: () => void;
}

export default function BoardToolbar({
  onSearch,
  onFilter,
  onMembers,
  onSort,
  onAddCard,
}: BoardToolbarProps) {
  const [search, setSearch] = useState("");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  const clearSearch = () => {
    setSearch("");
    onSearch?.("");
  };

  return (
    <div className="border-b border-(--border) bg-(--bg-surface) px-4 py-3 md:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-9 w-full max-w-md items-center border border-(--border) bg-(--surface-elevated) transition focus-within:border-(--brand)">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              strokeWidth={1.5}
              className="ml-3 shrink-0 text-(--text-muted)"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                handleSearchChange(event.target.value)
              }
              placeholder="Search cards..."
              aria-label="Search cards"
              className="min-w-0 flex-1 bg-transparent px-2 font-mono text-xs text-(--text-primary) outline-none placeholder:text-(--text-muted)"
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="mr-1 flex h-7 w-7 items-center justify-center text-(--text-muted) transition hover:text-(--text-primary)"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={13}
                  strokeWidth={1.5}
                />
              </button>
            )}
          </div>

          {/* Filter */}
          <button
            type="button"
            onClick={onFilter}
            className="flex h-9 shrink-0 items-center gap-2 border border-(--border) px-3 font-mono text-xs text-(--text-secondary) transition hover:border-(--brand) hover:bg-(--brand-muted) hover:text-(--text-primary)"
          >
            <HugeiconsIcon
              icon={FilterIcon}
              size={14}
              strokeWidth={1.5}
            />
            <span className="hidden sm:inline">Filter</span>
          </button>

          {/* Members */}
          <button
            type="button"
            onClick={onMembers}
            className="flex h-9 shrink-0 items-center gap-2 border border-(--border) px-3 font-mono text-xs text-(--text-secondary) transition hover:border-(--brand) hover:bg-(--brand-muted) hover:text-(--text-primary)"
          >
            <HugeiconsIcon
              icon={UserGroupIcon}
              size={14}
              strokeWidth={1.5}
            />
            <span className="hidden sm:inline">Members</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          <button
            type="button"
            onClick={onSort}
            className="flex h-9 items-center gap-2 border border-(--border) px-3 font-mono text-xs text-(--text-secondary) transition hover:border-(--brand) hover:bg-(--brand-muted) hover:text-(--text-primary)"
          >
            <HugeiconsIcon
              icon={SlidersHorizontalIcon}
              size={14}
              strokeWidth={1.5}
            />
            <span className="hidden sm:inline">Sort</span>
          </button>

          {/* Add Card */}
          <button
            type="button"
            onClick={onAddCard}
            className="flex h-9 items-center gap-2 border border-(--brand) bg-(--brand-muted) px-3 font-mono text-xs text-(--brand-hover) transition hover:bg-[rgba(124,92,252,0.18)] hover:text-(--text-primary)"
          >
            <HugeiconsIcon
              icon={Add01Icon}
              size={14}
              strokeWidth={1.5}
            />
            <span>Add card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
