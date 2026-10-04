import type { ReactNode } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  MoreHorizontalIcon,
  Share08Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";

import { ui } from "@/features/boards/board.helpers";

interface BoardHeaderProps {
  name: string;
  description?: string;
  workspaceName?: string;
  presence?: ReactNode;
}

function IconButton({
  label,
  icon,
}: {
  label: string;
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/8 bg-white/6 text-(--text-muted) transition-colors duration-200 hover:bg-white/10 hover:text-(--text-primary)"
    >
      <HugeiconsIcon icon={icon} size={16} strokeWidth={1.6} />
    </button>
  );
}

export default function BoardHeader({
  name,
  description,
  presence,
}: BoardHeaderProps) {
  return (
    <header className="flex flex-col gap-6 border-b border-white/8 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="mt-3 truncate font-mono text-[22px] font-semibold tracking-tight text-(--text-primary) sm:text-[26px]">
          {name}
        </h1>

        {description && (
          <p className="mt-2 max-w-xl font-mono text-[12px] leading-5 text-(--text-secondary)">
            {description}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {presence}

        <IconButton label="Favorite board" icon={StarIcon} />

        <button type="button" className={ui.pill}>
          <HugeiconsIcon
            icon={Share08Icon}
            size={14}
            strokeWidth={1.6}
            className="shrink-0 text-(--text-muted)"
          />
          Share
        </button>

        <IconButton label="Board actions" icon={MoreHorizontalIcon} />
      </div>
    </header>
  );
}
