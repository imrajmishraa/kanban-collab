import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  return (
    <article className="group flex flex-col gap-3 border-b border-neutral-800 py-4 transition-colors last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <button
          type="button"
          onClick={() => navigate(`/boards/${id}`)}
          className="flex items-center gap-2 text-left font-mono text-sm text-neutral-300 transition-colors hover:text-neutral-100"
        >
          <span className="text-rose-500">&gt;</span>
          <span className="truncate">{name}</span>
        </button>

        <p className="mt-1 pl-4 font-mono text-[10px] uppercase tracking-wider text-neutral-700">
          {workspace}
        </p>
      </div>

      <div className="flex items-center gap-3 pl-4 sm:pl-0">
        <time className="font-mono text-[10px] text-neutral-700">
          {updatedAt}
        </time>

        <ArrowUpRight
          size={13}
          strokeWidth={1.5}
          className="text-neutral-700 transition-colors group-hover:text-neutral-400"
        />
      </div>
    </article>
  );
}
