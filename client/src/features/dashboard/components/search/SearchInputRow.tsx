import type { RefObject } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";

import { Tooltip } from "@/components/Tooltips/ToolTip";

import type { Scope } from "./types";

const TABS: Array<{ id: Scope; label: string }> = [
  { id: "cards", label: "Cards" },
  { id: "boards", label: "Boards" },
];

interface SearchInputRowProps {
  query: string;
  onQueryChange: (value: string) => void;
  onClear: () => void;
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}

/** The palette header: field, clear button, scope tabs and the Esc hint. */
export function SearchInputRow({
  query,
  onQueryChange,
  onClear,
  scope,
  onScopeChange,
  inputRef,
}: SearchInputRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-(--hairline) px-4 py-3">
      <HugeiconsIcon
        icon={Search01Icon}
        size={18}
        strokeWidth={1.6}
        className="shrink-0 text-(--text-muted)"
      />

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search cards and boards"
        className="
          min-w-0 flex-1 bg-transparent
          text-[14px] tracking-tight text-(--text-primary)
          placeholder:text-(--text-subtle)
          outline-hidden ring-0 focus:outline-hidden focus:ring-0
          focus-visible:outline-hidden
        "
      />

      {query.length > 0 && (
        <Tooltip label="Clear" side="bottom" shape="solid" size="sm">
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear"
            className="shrink-0 rounded-md p-1 text-(--text-muted) transition-colors duration-200 hover:bg-(--bg-hover) hover:text-(--text-primary)"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={13} strokeWidth={1.8} />
          </button>
        </Tooltip>
      )}

      <div
        role="tablist"
        aria-label="Search scope"
        className="flex shrink-0 items-center gap-0.5 rounded-full border border-(--hairline) bg-(--tint-4) p-0.5"
      >
        {TABS.map((tab) => {
          const selected = scope === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onScopeChange(tab.id)}
              className={[
                "cursor-pointer rounded-full px-3 py-1 text-[11.5px] transition-colors duration-200",
                selected
                  ? "bg-(--tint-10) font-medium text-(--text-primary)"
                  : "text-(--text-muted) hover:text-(--text-soft)",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <span aria-hidden="true" className="h-5 w-px bg-(--hairline)" />

      <kbd className="hidden shrink-0 rounded-md border border-(--hairline) bg-(--tint-6) px-1.5 py-0.5 font-mono text-[10px] text-(--text-secondary) sm:block">
        Esc
      </kbd>
    </div>
  );
}
