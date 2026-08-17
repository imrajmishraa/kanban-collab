import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WorkspaceCardProps {
  id: string;
  name: string;
  boardCount: number;
  activeTaskCount: number;
}

export default function WorkspaceCard({
  id,
  name,
  boardCount,
  activeTaskCount,
}: WorkspaceCardProps) {
  const navigate = useNavigate();

  return (
    <article className="group border border-neutral-800 bg-[#0a0a0a] p-5 transition-colors hover:border-neutral-700 hover:bg-[#0c0c0e]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-600">
            Workspace
          </p>

          <h3 className="mt-2 truncate font-mono text-sm font-semibold text-neutral-100">
            <span className="mr-1.5 text-rose-500">&gt;</span>
            {name}
          </h3>
        </div>

        <span className="font-mono text-[10px] text-neutral-700">
          {id.slice(-4).toUpperCase()}
        </span>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4 border-t border-neutral-800 pt-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
            Boards
          </p>

          <p className="mt-1 font-mono text-sm text-neutral-300">
            {String(boardCount).padStart(2, "0")}
          </p>
        </div>

        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
            Active tasks
          </p>

          <p className="mt-1 font-mono text-sm text-neutral-300">
            {String(activeTaskCount).padStart(2, "0")}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/workspaces/${id}`)}
        className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-neutral-500 transition-colors hover:text-rose-400"
      >
        Open workspace
        <ArrowUpRight size={13} strokeWidth={1.5} />
      </button>
    </article>
  );
}
