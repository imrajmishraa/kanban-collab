import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";

import { useNewWorkspaceDialog } from "@/components/layout/dashboard/workspace/create/newWorkspaceDialog.context";

export default function DashboardHeader() {
  const { open: openNewWorkspace } = useNewWorkspaceDialog();

  return (
    <header
      className="
        flex flex-col gap-6
        border-b border-white/8
        pb-6
        sm:flex-row sm:items-end sm:justify-between
      "
    >
      <div>
        <h1
          className="
            mt-3
            font-mono text-[22px] font-semibold tracking-tight
            text-(--text-primary)
            sm:text-[26px]
          "
        >
          Welcome back
        </h1>

        <p
          className="
            mt-2 max-w-xl
            font-mono text-[12px] leading-5
            text-(--text-secondary)
          "
        >
          Here&apos;s your workspace at a glance.
        </p>
      </div>

      <button
        type="button"
        onClick={openNewWorkspace}
        className="
          group/new inline-flex w-fit cursor-pointer
          items-center gap-2
          rounded-full
          border border-white/8 bg-white/6
          px-4 py-2
          font-mono text-[12px]
          text-(--text-primary)
          transition-colors duration-200
          hover:bg-white/10
        "
      >
        <HugeiconsIcon
          icon={Add01Icon}
          size={14}
          strokeWidth={1.6}
          className="
            shrink-0 text-(--text-muted)
            transition-colors duration-200
            group-hover/new:text-(--brand)
          "
        />

        <span>New workspace</span>
      </button>
    </header>
  );
}
