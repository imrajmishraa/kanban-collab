import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";

interface BoardSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Plain filter field for the board grid. No decoration beyond the hairline. */
export function BoardSearch({
  value,
  onChange,
  placeholder = "Find board",
}: BoardSearchProps) {
  return (
    <div className="flex h-8 w-full items-center gap-2 rounded-md border border-orange-50/15 bg-white/3 px-2.5 transition-colors duration-200 focus-within:border-orange-50/30 sm:w-56">
      <HugeiconsIcon
        icon={Search01Icon}
        size={13}
        strokeWidth={1.6}
        className="shrink-0 text-neutral-600"
      />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[12px] tracking-tight text-neutral-100 placeholder:text-neutral-600 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none"
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="shrink-0 rounded p-0.5 text-neutral-600 transition-colors duration-200 hover:text-neutral-300"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={11} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
