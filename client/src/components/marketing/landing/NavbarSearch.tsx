import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Cancel01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { Tooltip } from "@/components/Tooltips/ToolTip";
import { cn } from "@/utils/cn";

import {
  DEFAULT_PROTECTED,
  NAV,
  PROTECTED_PAGES,
  PUBLIC_PAGES,
  QUICK_PAGES,
  type NavPage,
} from "./navConfig";

/**
 * The header's search: a single icon at rest that opens into a pill field with
 * a panel of free pages under it.
 *
 * It owns its own state, its own keyboard handling and its own dismissal, so
 * the navbar only has to render `<NavbarSearch />`. F opens it from anywhere on
 * the page, Escape and an outside click close it, and a route change resets it.
 */

interface NavbarSearchProps {
  /** Lets the host route the visit itself; falls back to the router. */
  onNavigate?: (href: string) => void;
  /**
   * "desktop" grows the icon into a pill inside the bar. "mobile" takes over
   * the whole bar with a back arrow and a full-width field, which is the only
   * way to fit a usable input on a phone.
   */
  variant?: "desktop" | "mobile";
  className?: string;
}

export default function NavbarSearch({
  onNavigate,
  variant = "desktop",
  className,
}: NavbarSearchProps) {
  const isMobile = variant === "mobile";
  const navigate = useNavigate();
  const { pathname } = useLocation();

  /* A guarded destination's parent line is only useful if it names the place
     the visitor is actually going: "Workspace" becomes the workspace. */
  const { activeWorkspaceId, activeWorkspaceName } = useActiveWorkspace();
  const workspaceName = activeWorkspaceId ? activeWorkspaceName : null;

  /* The panel remembers the route it was opened on, so a navigation closes it
     by derivation. An effect that called setOpen(false) on a pathname change
     would render twice for every visit, which is what the react-hooks rule
     warns about. */
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const [term, setTerm] = useState("");
  /* The row the keyboard is on. Reset whenever the list changes underneath it. */
  const [activeIndex, setActiveIndex] = useState(0);
  const open = openedAt === pathname;

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hrefFor = (item: NavPage) =>
    item.workspaceScoped && activeWorkspaceId
      ? `/workspaces/${activeWorkspaceId}${item.href}`
      : item.href;

  const parentFor = (item: NavPage) =>
    item.workspaceScoped && workspaceName ? workspaceName : item.parent;

  const focusRing = cn(
    "focus-visible:outline-hidden focus-visible:ring-2",
    NAV.focus,
  );

  const close = useCallback(() => {
    setOpenedAt(null);
    setTerm("");
    setActiveIndex(0);
  }, []);

  /* Opening always starts from an empty field, so a stale term can never
     reappear when the panel is reopened after a visit. */
  const openSearch = useCallback(() => {
    setTerm("");
    setActiveIndex(0);
    setOpenedAt(pathname);
  }, [pathname]);

  const go = useCallback(
    (href: string) => {
      close();
      if (onNavigate) onNavigate(href);
      else navigate(href);
    },
    [close, navigate, onNavigate],
  );

  /* F opens it, unless the visitor is already typing somewhere. */
  useEffect(() => {
    if (open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "f" && event.key !== "F") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      event.preventDefault();
      openSearch();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, openSearch]);

  /* Focus the field as it opens, and dismiss on an outside click or Escape. */
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const onDown = (event: Event) => {
      if (!wrapRef.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  /* Enter only travels to a page that exists. A typo leaves the visitor where
     they are with the panel still open, rather than sending them to a search
     route with a term that matches nothing. */
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = rows[activeIndex] ?? rows[0];
    if (!target) return;
    go(hrefFor(target));
  };

  /* Up and Down walk the list, Enter takes the highlighted row. Wrapping at the
     ends keeps the keys useful in a list this short. */
  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      close();
      event.currentTarget.blur();
      return;
    }
    if (rows.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % rows.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + rows.length) % rows.length);
    }
  };

  const needle = term.trim().toLowerCase();
  const typing = needle.length > 0;

  const matches = typing
    ? [...PUBLIC_PAGES, ...PROTECTED_PAGES].filter((item) =>
        `${item.title} ${item.parent ?? ""}`.toLowerCase().includes(needle),
      )
    : [];

  /* What the arrow keys walk: the same rows the panel draws, in order. */
  const rows: NavPage[] = typing
    ? matches
    : [...QUICK_PAGES, ...DEFAULT_PROTECTED];

  /* One row: boxed icon, the page title over the section it belongs to, and a
     chevron. The parent line is what makes a guarded destination legible — it
     says where in the app the visitor is about to land. */
  const renderRow = (item: NavPage, index: number) => (
    <li key={item.href}>
      <a
        href={hrefFor(item)}
        onClick={(event) => {
          event.preventDefault();
          go(hrefFor(item));
        }}
        aria-current={index === activeIndex ? "true" : undefined}
        className={cn(
          "group flex items-center gap-3 mt-0.5 rounded-lg px-2.5 py-2",
          "transition-colors duration-150",
          NAV.hover,
          index === activeIndex && "bg-[rgb(243,243,243)]",
        )}
      >
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg border",
            NAV.edge,
          )}
        >
          <HugeiconsIcon
            icon={item.icon}
            size={17}
            strokeWidth={1.6}
            aria-hidden="true"
            className={NAV.icon}
          />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-[rgb(55,55,55)]">
            {item.title}
          </span>
          {parentFor(item) ? (
            <span className="block truncate text-[11px] font-normal text-[rgb(140,140,140)]">
              {parentFor(item)}
            </span>
          ) : null}
        </span>

        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={15}
          strokeWidth={2}
          aria-hidden="true"
          className="shrink-0 text-[rgb(178,178,178)]"
        />
      </a>
    </li>
  );

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      {/* One container that only changes width, so opening is a size change
          rather than one control replacing another. */}
      {isMobile && open ? (
        /* The phone takes over the whole bar: a back arrow to leave, then a
           field that has room for a real query. */
        <div
          className={cn(
            "fixed inset-x-0 top-0 z-50 flex h-17 items-center gap-2 border-b px-3",
            NAV.surface,
            NAV.edge,
          )}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close search"
            className={cn(
              "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg",
              "transition-colors duration-150",
              NAV.icon,
              NAV.iconHover,
              focusRing,
            )}
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={18}
              strokeWidth={2}
              className="rotate-180"
            />
          </button>

          <form
            role="search"
            onSubmit={submit}
            className={cn(
              /* The same field the desktop bar uses: the magnifier sits inside
                 on the leading edge, the border is the hairline token rather
                 than a hardcoded grey, and the submit is a soft circle at the
                 trailing edge. */
              "flex h-10 flex-1 items-center gap-2 rounded-full border pr-1 pl-3.5",
              NAV.edge,
            )}
          >
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
              className={cn("shrink-0", NAV.icon)}
            />
            <label htmlFor="navbar-search-input" className="sr-only">
              Search
            </label>
            <input
              ref={inputRef}
              id="navbar-search-input"
              type="text"
              name="q"
              value={term}
              onChange={(event) => {
                setTerm(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search pages"
              autoComplete="off"
              spellCheck={false}
              className={cn(
                "h-full w-full min-w-0 bg-transparent text-[15px] outline-none",
                NAV.text,
                NAV.placeholder,
              )}
            />
            <button
              type="submit"
              aria-label="Search"
              className={cn(
                "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full",
                "bg-[rgb(246,246,246)] text-[rgb(90,90,90)]",
                "transition-colors duration-150 hover:bg-[rgb(236,236,236)] hover:text-[rgb(55,55,55)]",
                focusRing,
              )}
            >
              <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={2} />
            </button>
          </form>
        </div>
      ) : (
        <div
          className={cn(
            "flex h-9 items-center overflow-hidden",
            /* Only the width animates. The radius is set per state and not
             transitioned: shrinking a pill to 36px used to read as a circle
             collapsing into the icon. */
            "transition-[width] duration-200 ease-out motion-reduce:transition-none",
            open
              ? "w-70 gap-2 rounded-full border border-[rgb(198,198,198)] pr-1 pl-3"
              : "w-9 justify-center rounded-lg",
          )}
        >
          {open ? (
            <form
              role="search"
              onSubmit={submit}
              className="flex h-full w-full items-center gap-2"
            >
              <HugeiconsIcon
                icon={Search01Icon}
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
                className={cn("shrink-0", NAV.icon)}
              />
              <label htmlFor="navbar-search-input" className="sr-only">
                Search
              </label>
              <input
                ref={inputRef}
                id="navbar-search-input"
                type="text"
                name="q"
                value={term}
                onChange={(event) => {
                  setTerm(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search"
                autoComplete="off"
                spellCheck={false}
                className={cn(
                  "h-full w-full min-w-0 bg-transparent text-[14px] outline-none",
                  NAV.text,
                  NAV.placeholder,
                )}
              />
              {term !== "" ? (
                <button
                  type="button"
                  onClick={() => {
                    setTerm("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className={cn(
                    "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full",
                    "text-[rgb(150,150,150)] transition-colors duration-150",
                    "hover:bg-[rgb(240,240,240)] hover:text-[rgb(55,55,55)]",
                    focusRing,
                  )}
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    size={14}
                    strokeWidth={2.2}
                  />
                </button>
              ) : null}

              <button
                type="submit"
                aria-label="Search"
                className={cn(
                  "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full",
                  "bg-[rgb(246,246,246)] text-[rgb(90,90,90)]",
                  "transition-colors duration-150 hover:bg-[rgb(236,236,236)] hover:text-[rgb(55,55,55)]",
                  focusRing,
                )}
              >
                <HugeiconsIcon icon={Search01Icon} size={15} strokeWidth={2} />
              </button>
            </form>
          ) : (
            <Tooltip
              label="Search Pages"
              shape="solid"
              highlight="F"
              side="bottom"
              size="md"
              theme="dark"
            >
              <button
                type="button"
                onClick={openSearch}
                aria-label="Search, press F"
                aria-expanded={false}
                aria-controls="navbar-search"
                className={cn(
                  "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg",
                  "transition-colors duration-150",
                  NAV.icon,
                  NAV.iconHover,
                  focusRing,
                )}
              >
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={18}
                  strokeWidth={1.8}
                />
              </button>
            </Tooltip>
          )}
        </div>
      )}

      {open ? (
        <div
          id="navbar-search"
          className={cn(
            /* A fixed height keeps the panel from growing with the list: it is
               a menu, not a page. The rows scroll inside it.

               Where it hangs differs by width, and that is the point. On a
               phone the search is a full-width overlay pinned to the top, so
               the panel sits directly under that overlay at `top-17`. On a
               desktop the field is one control in the bar, so the panel is
               positioned against the wrapper and opens right under the input —
               anchoring it to the navbar edge left a gap the height of the
               bar's padding between the field and its own results. */
            "left-1/2 z-50 flex h-90 w-90 max-w-[calc(100vw-24px)] -translate-x-1/2 flex-col",
            /* The same panel at every width — same 360px, same rows, same
               height. Only the anchor differs: on a phone the search is a
               fixed overlay pinned to the top, so the panel hangs from its
               bottom edge; on a desktop it hangs from the field itself. */
            isMobile ? "fixed top-17" : "absolute top-full mt-2",
            "origin-top animate-in fade-in zoom-in-95 duration-150 ease-out",
            "motion-reduce:animate-none",
            NAV.surface,
            NAV.edge,
            NAV.panel,
          )}
        >
          <div className="-mr-1 flex-1 overflow-y-auto overscroll-contain pr-1">
            {typing ? (
              matches.length > 0 ? (
                <ul>{matches.map((item, index) => renderRow(item, index))}</ul>
              ) : (
                <p className={cn("px-3 py-4 text-[14px]", NAV.inkSecondary)}>
                  Nothing matches “{term.trim()}”.
                </p>
              )
            ) : (
              <>
                <p
                  className={cn(
                    "px-3 pt-1 pb-1 text-[11px] font-semibold tracking-wide uppercase",
                    NAV.icon,
                  )}
                >
                  More pages
                </p>
                <ul>
                  {QUICK_PAGES.map((item, index) => renderRow(item, index))}
                </ul>

                <p
                  className={cn(
                    "px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wide uppercase",
                    NAV.icon,
                  )}
                >
                  Login required
                </p>
                <ul>
                  {DEFAULT_PROTECTED.map((item, index) =>
                    renderRow(item, QUICK_PAGES.length + index),
                  )}
                </ul>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
