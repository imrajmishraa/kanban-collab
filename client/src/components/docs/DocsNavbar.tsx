import { Link } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  GithubIcon,
  Menu03Icon,
} from "@hugeicons/core-free-icons";

import KanbanIcon from "@/assets/KanbanIcon";

import { Tooltip } from "@/components/Tooltips/ToolTip";
import { cn } from "@/utils/cn";

import DocsSearch from "./DocsSearch";
import { GITHUB_URL } from "./docsConfig";

interface DocsNavProps {
  onOpenNav: () => void;
  navOpen: boolean;
}

export default function DocsNav({ onOpenNav, navOpen }: DocsNavProps) {
  return (
    <header
      className="
        sticky top-0 z-40 w-full mx-auto max-w-384 border-x border-b border-(--hairline)
        bg-(--bg-root)/85 backdrop-blur-xl 
      "
    >
      <div className="mx-auto flex h-16 w-full items-center gap-3 px-4 sm:h-17 sm:gap-4 sm:px-6">
        {/* ── LEFT: brand ─────────────────────────────────────────── */}
        <Link to="/docs" className="flex shrink-0 items-center gap-2.5">
          <span className="flex shrink-0 items-center justify-center">
            {/* Logo, visible normally, hidden on hover */}
            <KanbanIcon
              size={24}
              variant="upper"
              theme="auto"
              className="transition-transform duration-150 group-hover/logo:scale-110"
            />
          </span>
          <span className="text-[17px] font-bold tracking-tight">Kanban</span>
          {/* Inverted chip: `--solid-bg` and `--solid-text` are already exact
              opposites in both scopes — black on white in light, white on black
              in dark — so this needs no theme logic at all. */}
          <span
            className="
              hidden rounded-md border border-(--hairline) bg-(--solid-bg)
              px-1.5 py-0.5 text-[11px] font-semibold tracking-wide
              text-(--solid-text) sm:block
            "
          >
            DOCS
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
          <Link
            to="/home"
            className="
              hidden items-center gap-1.5 px-2.5 py-2 text-[13px]
              text-(-glass) text-(--text-subtle) hover:text-(--text-muted) md:inline-flex
            "
          >
            Back to Home
          </Link>

          <DocsSearch />

          <Tooltip label="Star on GitHub" side="bottom" size="md">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View the source on GitHub"
              className="
                grid size-9 place-items-center rounded-lg text-(--text-secondary)
                transition-colors duration-150
                hover:bg-(--tint-4) hover:text-(--text-primary)
                focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none
              "
            >
              <HugeiconsIcon icon={GithubIcon} size={18} strokeWidth={1.8} />
            </a>
          </Tooltip>

          {/* Phone menu: the same trigger the marketing bar uses, in the same
              place, so the two bars behave the same way under a thumb. */}
          <button
            type="button"
            onClick={onOpenNav}
            aria-expanded={navOpen}
            aria-controls="docs-mobile-nav"
            aria-label={navOpen ? "Close navigation" : "Open navigation"}
            className={cn(
              "grid size-9 cursor-pointer place-items-center rounded-lg lg:hidden",
              "text-(--text-secondary) transition-colors duration-150",
              "hover:bg-(--tint-4) hover:text-(--text-primary)",
              "focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none",
            )}
          >
            <HugeiconsIcon
              icon={navOpen ? Cancel01Icon : Menu03Icon}
              size={18}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
