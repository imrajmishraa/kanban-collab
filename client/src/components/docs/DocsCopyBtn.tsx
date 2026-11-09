import { useCallback, useEffect, useRef, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUpRight01Icon,
  ChatGptIcon,
  ClaudeIcon,
  Copy01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

import { toastError, toastSuccess } from "@/lib/toast";
import { cn } from "@/utils/cn";

const BLOCK = {
  h1: (text: string) => `# ${text}`,
  h2: (text: string) => `## ${text}`,
  h3: (text: string) => `### ${text}`,
  li: (text: string) => `- ${text}`,
  blockquote: (text: string) => `> ${text}`,
} as const;

type BlockTag = keyof typeof BLOCK;

const isBlockTag = (tag: string): tag is BlockTag => tag in BLOCK;

/** The article, as markdown. Good enough to paste into a chat window. */
function toMarkdown(root: HTMLElement): string {
  const lines: string[] = [];

  for (const node of Array.from(root.children)) {
    const tag = node.tagName.toLowerCase();
    const text = (node.textContent ?? "").replace(/\s+/g, " ").trim();
    if (!text) continue;

    if (isBlockTag(tag)) {
      lines.push(BLOCK[tag](text));
    } else if (tag === "ul" || tag === "ol") {
      const items = Array.from(node.querySelectorAll("li"))
        .map(
          (item) => `- ${(item.textContent ?? "").replace(/\s+/g, " ").trim()}`,
        )
        .join("\n");
      if (items) lines.push(items);
    } else {
      lines.push(text);
    }

    lines.push("");
  }

  return lines.join("\n").trim();
}

interface DocsCopyPageProps {
  /** The element holding the page. Read on click, not on mount. */
  contentRef: React.RefObject<HTMLElement | null>;
}

export default function DocsCopyBtn({ contentRef }: DocsCopyPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const resetTimer = useRef<number | null>(null);

  const copy = useCallback(async () => {
    const article = contentRef.current;
    if (!article) return;

    try {
      await navigator.clipboard.writeText(toMarkdown(article));
      setCopied(true);
      setMenuOpen(false);
      toastSuccess(
        "Copied page as Markdown",
        "Paste it into ChatGPT, Claude, an issue or a doc.",
      );

      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      /* Clipboard access can be refused — an insecure origin, or a browser
         setting. The button goes back to "Copy page"; the toast is what tells
         the reader it did not work, because a silent no-op reads as a click
         that missed. A DOMException's message is browser internals, so it is
         swapped for the fallback rather than shown. */
      setCopied(false);
      toastError(
        error instanceof DOMException ? undefined : error,
        "Couldn't copy — the browser refused clipboard access.",
      );
    }
  }, [contentRef]);

  useEffect(
    () => () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!menuOpen) return;

    const onDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const pageUrl = typeof window === "undefined" ? "" : window.location.href;

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <div className="flex items-stretch overflow-hidden rounded-lg border border-(--hairline)">
        <button
          type="button"
          onClick={copy}
          className="
            flex cursor-pointer items-center gap-2 px-3 py-1.5 text-[14px]
            font-medium text-(--text-secondary)
            transition-colors duration-150 hover:bg-(--tint-6) hover:text-(--text-primary)
          "
        >
          <HugeiconsIcon
            icon={copied ? Tick02Icon : Copy01Icon}
            size={15}
            strokeWidth={1.8}
            aria-hidden="true"
          />
          {copied ? "Copied" : "Copy page"}
        </button>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="More ways to take this page"
          className="
            flex cursor-pointer items-center px-2
            text-(--text-secondary)
            transition-colors duration-150 hover:bg-(--tint-6) hover:text-(--text-primary)
          "
        >
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={14}
            strokeWidth={2}
            aria-hidden="true"
          />
        </button>
      </div>

      {menuOpen ? (
        <div
          role="menu"
          className="
            absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl
            border border-(--hairline) bg-(--bg-surface) p-1.5
            shadow-[0_18px_50px_-12px_rgba(0,0,0,0.28)]
          "
        >
          <button
            type="button"
            role="menuitem"
            onClick={copy}
            className="
              flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5
              text-left transition-colors duration-150 hover:bg-(--tint-4)
            "
          >
            <HugeiconsIcon
              icon={Copy01Icon}
              size={18}
              strokeWidth={1.6}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-(--text-secondary)"
            />
            <span className="min-w-0">
              <span className="block text-[12px] font-semibold text-(--text-primary)">
                Copy page
              </span>
              <span className="mt-0.5 block text-[11px] text-(--text-muted)">
                Copy page as Markdown for LLMs
              </span>
            </span>
          </button>

          <a
            role="menuitem"
            href={`https://chatgpt.com/?q=${encodeURIComponent(
              `Read this documentation page and answer questions about it: ${pageUrl}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex w-full items-start gap-3 rounded-lg px-3 py-2.5
              transition-colors duration-150 hover:bg-(--tint-4)
            "
          >
            <span
              aria-hidden="true"
              className="mt-2 grid size-5 shrink-0 place-items-center text-(--text-secondary)"
            >
              <HugeiconsIcon
                icon={ChatGptIcon}
                size={18}
                strokeWidth={1.6}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-(--text-secondary)"
              />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-(--text-primary)">
                Open in ChatGPT
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  size={13}
                  strokeWidth={2}
                />
              </span>
              <span className="mt-0.5 block text-[11px] text-(--text-muted)">
                Ask questions about this page
              </span>
            </span>
          </a>

          <a
            role="menuitem"
            href={`https://claude.ai/new?q=${encodeURIComponent(
              `Read this documentation page and answer questions about it: ${pageUrl}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex w-full items-start gap-3 rounded-lg px-3 py-2.5",
              "transition-colors duration-150 hover:bg-(--tint-4)",
            )}
          >
            <span
              aria-hidden="true"
              className="mt-2 grid size-5 shrink-0 place-items-center text-(--text-secondary)"
            >
              <HugeiconsIcon
                icon={ClaudeIcon}
                size={18}
                strokeWidth={1.6}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-(--text-secondary)"
              />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-(--text-primary)">
                Open in Claude
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  size={13}
                  strokeWidth={2}
                />
              </span>
              <span className="mt-0.5 block text-[11px] text-(--text-muted)">
                Ask questions about this page
              </span>
            </span>
          </a>
        </div>
      ) : null}
    </div>
  );
}
