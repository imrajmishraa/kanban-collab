import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

interface RecentBoardItemProps {
  id: string;
  name: string;
  workspace: string;
  updatedAt: string;
}

export default function RecentBoardItem({
  id,
  name,
  workspace,
  updatedAt,
}: RecentBoardItemProps) {
  return (
    <Link
      to={`/boards/${id}`}
      className="
        group relative flex flex-col gap-3 rounded-lg
        px-2 py-4
        transition-colors duration-200
        hover:bg-white/4
        sm:flex-row sm:items-center sm:justify-between
      "
    >
      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="
              h-1.5 w-1.5 shrink-0 rounded-full
              bg-(--brand)/40
              transition-all duration-200
              group-hover:bg-(--brand)
              group-hover:shadow-[0_0_8px_var(--brand)]
            "
          />

          <span className="font-mono text-[13px] text-(--text-primary) transition-colors group-hover:text-white">
            {name}
          </span>
        </div>

        <p className="mt-1.5 pl-4 font-mono text-[10px] uppercase tracking-[0.16em] text-(--text-muted)">
          {workspace}
        </p>

        {/* Fade + icon — overlays the name area on hover */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-y-0 right-0 w-16
            flex items-center justify-end
            opacity-0 transition-opacity duration-200
            group-hover:opacity-100
            bg-linear-to-l from-white/3 to-transparent
          "
        >
          <span
            className="
              flex h-6 w-6 shrink-0 items-center justify-center rounded-md
              border border-white/8 bg-(--bg-elevated)
              text-(--text-muted)
              transition-all duration-300
              group-hover:border-(--brand)/40
              group-hover:bg-(--brand)/10
              group-hover:text-(--brand)
            "
          >
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={11}
              strokeWidth={1.8}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 pl-4 sm:pl-0">
        <time className="font-mono text-[10px] tabular-nums tracking-wider text-(--text-muted)">
          {updatedAt}
        </time>
      </div>
    </Link>
  );
}
