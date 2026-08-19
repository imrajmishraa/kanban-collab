import {
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
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
  boardId: _boardId,
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
    <div className="border-b border-neutral-800 bg-[#080808] px-4 py-3 md:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-9 w-full max-w-md items-center border border-neutral-800 bg-[#0b0b0b] transition focus-within:border-neutral-700">
            <Search size={14} className="ml-3 shrink-0 text-neutral-600" />

            <input
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search cards..."
              aria-label="Search cards"
              className="min-w-0 flex-1 bg-transparent px-2 font-mono text-xs text-neutral-200 outline-none placeholder:text-neutral-600"
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="mr-1 flex h-7 w-7 items-center justify-center text-neutral-600 transition hover:text-neutral-300"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter */}
          <button
            type="button"
            onClick={onFilter}
            className="flex h-9 shrink-0 items-center gap-2 border border-neutral-800 px-3 font-mono text-xs text-neutral-500 transition hover:border-neutral-700 hover:text-neutral-200"
          >
            <Filter size={14} />

            <span className="hidden sm:inline">Filter</span>
          </button>

          {/* Members */}
          <button
            type="button"
            onClick={onMembers}
            className="flex h-9 shrink-0 items-center gap-2 border border-neutral-800 px-3 font-mono text-xs text-neutral-500 transition hover:border-neutral-700 hover:text-neutral-200"
          >
            <Users size={14} />

            <span className="hidden sm:inline">Members</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          <button
            type="button"
            onClick={onSort}
            className="flex h-9 items-center gap-2 border border-neutral-800 px-3 font-mono text-xs text-neutral-500 transition hover:border-neutral-700 hover:text-neutral-200"
          >
            <SlidersHorizontal size={14} />

            <span className="hidden sm:inline">Sort</span>
          </button>

          {/* Add Card */}
          <button
            type="button"
            onClick={onAddCard}
            className="flex h-9 items-center gap-2 border border-[#ff1f5a]/40 bg-[#ff1f5a]/10 px-3 font-mono text-xs text-[#ff1f5a] transition hover:border-[#ff1f5a] hover:bg-[#ff1f5a]/15"
          >
            <Plus size={14} />

            <span>Add card</span>
          </button>
        </div>
      </div>
    </div>
  );
}
