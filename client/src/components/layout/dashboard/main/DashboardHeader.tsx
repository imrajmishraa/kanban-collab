import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <header className="flex flex-col gap-6 border-b border-neutral-800 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
          Dashboard
        </p>

        <h1 className="mt-3 font-mono text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl">
          Welcome back
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
          Here's your workspace at a glance.
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate("/workspaces/new")}
        className="inline-flex w-fit items-center gap-2 border border-rose-500/70 bg-rose-500/10 px-4 py-2.5 font-mono text-xs text-rose-400 transition-colors hover:border-rose-500 hover:bg-rose-500/15 hover:text-rose-300"
      >
        <Plus size={14} strokeWidth={1.5} />
        <span>[ New Workspace ]</span>
      </button>
    </header>
  );
}
