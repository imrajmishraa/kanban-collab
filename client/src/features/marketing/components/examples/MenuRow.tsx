import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import Shortcut from "./Shortcut";

interface MenuRowProps {
  icon?: ReactNode;
  label: ReactNode;
  /** The row the pointer is on: a tint, and one weight heavier. */
  active?: boolean;
  danger?: boolean;
  /** A right chevron, for a row that opens something. */
  chevron?: boolean;
  /** Right-aligned mono: a key chord, a count, a permission. */
  hint?: string;
  /** A control at the end of the row — a switch, usually. */
  trailing?: ReactNode;
  /** A second, quieter line under the label instead of a label in the row. */
  helper?: boolean;
}

export default function MenuRow({
  icon,
  label,
  active,
  danger,
  chevron,
  hint,
  trailing,
  helper,
}: MenuRowProps) {
  return (
    <div
      className={[
        "flex gap-2 px-2 py-1.75 text-[12px] leading-[1.45] tracking-[-0.2px]",
        "sm:gap-3 sm:px-2.5 sm:py-2.25 sm:text-[14px]",
        helper ? "items-start" : "items-center",
        active ? "rounded-md bg-(--tint-4) font-semibold" : "",
        danger ? "text-(--danger)" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon ? (
        <span
          className={[
            "mt-px shrink-0 [&_svg]:size-3.5 sm:[&_svg]:size-4",
            danger ? "text-(--danger)" : "text-(--text-muted)",
          ].join(" ")}
        >
          {icon}
        </span>
      ) : null}

      <span
        className={
          helper
            ? "flex-1 whitespace-normal text-[10.5px] leading-[1.4] text-(--text-muted) sm:text-[12px]"
            : "flex-1 truncate"
        }
      >
        {label}
      </span>

      {hint ? <Shortcut>{hint}</Shortcut> : null}

      {chevron ? (
        <span className="shrink-0 text-(--text-subtle)">
          <HugeiconsIcon icon={ArrowRight01Icon} size={13} strokeWidth={1.9} />
        </span>
      ) : null}

      {trailing}
    </div>
  );
}
