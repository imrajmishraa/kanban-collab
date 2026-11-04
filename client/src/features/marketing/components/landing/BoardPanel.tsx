import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, ReloadIcon } from "@hugeicons/core-free-icons";

const PROGRESS = 68;

export default function BoardPanel() {
  return (
    <div
      className="
        light mx-auto w-full max-w-105 overflow-hidden rounded-xl
        border border-(--hairline) bg-(--bg-surface) p-3
        shadow-[0_30px_70px_-40px_rgba(0,0,0,0.35)]
      "
    >
      {/* ── The board, as the app renders it ── */}
      <div className="overflow-hidden rounded-sm">
        <img
          src="https://ik.imagekit.io/kanban/DemoBoards_3XKaAtwya.png"
          alt="A Kanban board: three columns of cards, each with tags, a description, a due date and an assignee"
          width={2100}
          height={972}
          loading="eager"
          decoding="async"
          className="block h-auto w-full"
        />
      </div>

      {/* ── Progress strip ── */}
      <div className="mt-2 flex items-center gap-2 border-t border-(--hairline) pt-2.5">
        <span className="font-mono text-[10px] font-semibold text-(--text-primary)">
          12
        </span>
        <span className="hidden text-[9.5px] text-(--text-muted) sm:inline">
          Active sprints
        </span>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={9}
          strokeWidth={2}
          className="shrink-0 text-(--text-subtle)"
        />
        <span className="shrink-0 text-[9.5px] font-medium text-(--text-primary)">
          Sprint 4
        </span>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={9}
          strokeWidth={2}
          className="hidden shrink-0 text-(--text-subtle) sm:block"
        />
        <span className="hidden shrink-0 text-[9.5px] text-(--text-muted) sm:inline">
          Progress
        </span>

        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-(--tint-10)">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand),var(--brand-hover))]"
            style={{ width: `${PROGRESS}%` }}
          />
        </div>

        <span className="shrink-0 font-mono text-[9.5px] font-medium text-(--text-primary)">
          {PROGRESS}%
        </span>

        <span className="ml-auto hidden shrink-0 text-[9px] text-(--text-subtle) md:inline">
          Updated 2m ago
        </span>
        <HugeiconsIcon
          icon={ReloadIcon}
          size={10}
          strokeWidth={1.9}
          className="shrink-0 text-(--text-subtle)"
        />
      </div>
    </div>
  );
}
