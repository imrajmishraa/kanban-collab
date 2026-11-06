import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/utils/cn";

import { DOCS_NAV, isSection } from "./docsConfig";

interface Result {
  title: string;
  href: string;
  parent?: string;
}

/* Flattened once, at module scope, so a keystroke is a filter and not a walk.
   Sections have to be opened as well as leaves: a three-level tree nests
   "AI Agents" inside "Integrations", and a search that stopped at the section
   would find the heading but none of the pages under it. */
const RESULTS: Result[] = DOCS_NAV.flatMap((group) => {
  const own: Result[] = [{ title: group.title, href: group.href }];

  const nested = (group.children ?? []).flatMap((child): Result[] => {
    if (isSection(child)) {
      return child.children.map((leaf) => ({
        title: leaf.title,
        href: leaf.href,
        parent: `${group.title} · ${child.title}`,
      }));
    }
    return [{ title: child.title, href: child.href, parent: group.title }];
  });

  return [...own, ...nested];
});

interface DocsSearchProps {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}

export default function DocsSearch({
  variant = "desktop",
  onNavigate,
}: DocsSearchProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const matches = useMemo(() => {
    const query = term.trim().toLowerCase();
    if (!query) return [];
    return RESULTS.filter((item) =>
      `${item.parent ?? ""} ${item.title}`.toLowerCase().includes(query),
    ).slice(0, 8);
  }, [term]);

  /* ⌘K and Ctrl-K both reach the field, the way every docs site does it. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k") return;
      if (!event.metaKey && !event.ctrlKey) return;
      event.preventDefault();
      inputRef.current?.focus();
      setOpen(true);
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* A click anywhere else closes the panel without stealing the focus. */
  useEffect(() => {
    if (!open) return;

    const onDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const go = (href: string) => {
    setTerm("");
    setOpen(false);
    onNavigate?.();
    navigate(href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (matches.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      const match = matches[activeIndex];
      if (match) {
        event.preventDefault();
        go(match.href);
      }
    }
  };

  return (
    <div
      ref={wrapRef}
      className={cn("relative", variant === "desktop" ? "hidden md:block" : "")}
    >
      <div className="relative flex items-center">
        <HugeiconsIcon
          icon={Search01Icon}
          size={15}
          strokeWidth={1.8}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 text-(--text-subtle)"
        />

        <label
          htmlFor={`docs-search-${variant}`}
          className="sr-only text-(--text-subtle)"
        >
          Search documentation
        </label>
        <input
          ref={inputRef}
          id={`docs-search-${variant}`}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={`docs-search-results-${variant}`}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          value={term}
          placeholder="Search documentation…"
          onChange={(event) => {
            setTerm(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            /* The reference's own field: filled, no border, 14px, tight
               leading. The ring only appears on the keyboard path. */
            "h-9 rounded-lg bg-(--tint-4) pl-9 pr-14 text-[14px] leading-tight",
            "text-(--text-primary) outline-none",
            "placeholder:text-(--text-subtle)",
            "transition-colors duration-150 hover:bg-(--tint-6)",
            "focus-visible:ring-2 focus-visible:ring-blue-500",
            "[&::-webkit-search-cancel-button]:appearance-none",
            variant === "desktop" ? "w-64" : "w-full p-2 pl-8",
          )}
        />

        <kbd
          className="
            pointer-events-none absolute right-1.5 flex h-5 items-center gap-1
            rounded border border-(--hairline) bg-(--bg-root) px-1.5
            font-mono text-[11px] font-medium text-(--text-secondary)
          "
        >
          ⌘K
        </kbd>
      </div>

      {open && term.trim() !== "" ? (
        <div
          id={`docs-search-results-${variant}`}
          role="listbox"
          className="
            absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl
            border border-(--hairline) bg-(--bg-surface) p-1.5
            shadow-[0_18px_50px_-12px_rgba(0,0,0,0.18)]
          "
        >
          {matches.length === 0 ? (
            <p className="px-3 py-3 text-[14px] text-(--text-muted)">
              Nothing matches “{term.trim()}”.
            </p>
          ) : (
            <ul>
              {matches.map((item, index) => (
                <li key={item.href}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => go(item.href)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between gap-3",
                      "rounded-lg px-3 py-2 text-left text-[14px]",
                      "transition-colors duration-150",
                      index === activeIndex
                        ? "bg-(--tint-4) text-(--text-primary)"
                        : "text-(--text-secondary)",
                    )}
                  >
                    <span className="truncate">{item.title}</span>
                    {item.parent ? (
                      <span className="shrink-0 text-[12px] text-(--text-muted)">
                        {item.parent}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
