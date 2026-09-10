import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";

export default function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <header
      className="
        flex flex-col gap-6
        border-b border-(--border)
        pb-8
        sm:flex-row sm:items-end sm:justify-between
      "
    >
      <div>
        <p
          className="
            font-mono text-[10px] uppercase
            tracking-[0.2em]
            text-(--text-muted)
          "
        >
          Dashboard
        </p>

        <h1
          className="
            mt-3
            font-mono text-2xl font-bold
            tracking-tight
            text-(--text-primary)
            sm:text-3xl
          "
        >
          Welcome back
        </h1>

        <p
          className="
            mt-2 max-w-xl
            text-sm leading-6
            text-(--text-secondary)
          "
        >
          Here's your workspace at a glance.
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate("/workspaces/new")}
        className="
          inline-flex w-fit
          items-center gap-2
          rounded-md
          border border-(--brand)
          bg-(--brand-muted)
          px-4 py-2.5
          font-mono text-xs
          text-(--brand-hover)
          transition-all duration-150
          hover:bg-[rgba(124,92,252,0.18)]
          hover:text-(--text-primary)
        "
      >
        <HugeiconsIcon
          icon={Add01Icon}
          size={14}
          strokeWidth={1.5}
        />

        <span> New Workspace </span>
      </button>
    </header>
  );
};
