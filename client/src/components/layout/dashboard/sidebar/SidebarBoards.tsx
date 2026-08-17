import { FolderKanban } from "lucide-react";

import SidebarItem from "@components/ui/dashboard/SidebarItem";

import type { Board } from "@/types/api/dashboard/board";

interface SidebarBoardsProps {
  collapsed: boolean;
  boards?: Board[];
  isLoading?: boolean;
  isError?: boolean;
}

const SidebarBoards = ({
  collapsed,
  boards = [],
  isLoading = false,
  isError = false,
}: SidebarBoardsProps) => {
  return (
    <section className="px-3 pt-6">
      {!collapsed && (
        <p className="mb-2 px-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-neutral-600">
          BOARDS
        </p>
      )}

      <div className="space-y-0.5">
        {isLoading
          ? !collapsed && (
              <div className="px-2 py-2 font-mono text-[11px] text-neutral-600">
                Loading...
              </div>
            )
          : isError
            ? !collapsed && (
                <div className="px-2 py-2 font-mono text-[11px] text-red-400">
                  Unable to load boards.
                </div>
              )
            : boards.length === 0
              ? !collapsed && (
                  <div className="px-2 py-2 font-mono text-[11px] text-neutral-600">
                    No boards
                  </div>
                )
              : boards.map((board) => (
                  <SidebarItem
                    key={board.id}
                    label={board.name}
                    href={`/boards/${board.id}`}
                    icon={<FolderKanban className="size-4" />}
                    collapsed={collapsed}
                  />
                ))}
      </div>
    </section>
  );
};

export default SidebarBoards;
