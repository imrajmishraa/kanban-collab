import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";

import { useNewWorkspaceDialog } from "@/components/layout/dashboard/workspace/create/newWorkspaceDialog.context";

export default function DashboardHeader() {
  const { open: openNewWorkspace } = useNewWorkspaceDialog();

  return (
    <header className="flex flex-col gap-6 border-b border-orange-50/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-neutral-100 sm:text-[26px]">
          Welcome back
        </h1>

        <p className="mt-2 max-w-xl text-[12.5px] leading-5 text-neutral-400">
          Here is your workspace at a{" "}
          <span className="font-medium text-orange-100 capitalize">glance</span>
        </p>
      </div>

      {/* Solid, one per screen, asymmetric corners: the ChaiUI primary. */}
      <button
        type="button"
        onClick={openNewWorkspace}
        className="
          group/new inline-flex w-fit cursor-pointer items-center gap-2
          rounded-none rounded-tr-lg rounded-bl-lg
          bg-white px-4 py-2
          text-[12px] font-semibold text-black
          transition-colors duration-200
          hover:bg-neutral-200
        "
      >
        <HugeiconsIcon
          icon={Add01Icon}
          size={14}
          strokeWidth={2}
          className="shrink-0"
        />

        <span>New workspace</span>
      </button>
    </header>
  );
}
