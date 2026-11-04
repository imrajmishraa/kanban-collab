import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowRight02Icon,
  Cancel01Icon,
  Menu03Icon,
} from "@hugeicons/core-free-icons";

import { useAuth } from "@/hooks/useAuth";

import NavbarSearch from "./NavbarSearch";
import { MOBILE_LINKS, NAV, NAV_LINKS, SOLUTIONS } from "./navConfig";
import KanbanIcon from "@/assets/KanbanIcon";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

/** The `md` breakpoint the nav already switches on. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(min-width: 768px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (event: MediaQueryListEvent) =>
      setIsDesktop(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

interface NavbarProps {
  onNavigate?: (href: string) => void;
  activeHref?: string;
  /**
   * Kept so existing callers keep compiling. The header no longer switches
   * palette, so this has no effect.
   */
  dark?: boolean;
}

export default function Navbar({ onNavigate, activeHref = "" }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const currentPath = activeHref || location.pathname;
  const isActive = (href: string) => currentPath === href;

  const [mobileOpen, setMobileOpen] = useState(false);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(location.pathname);

  /* Solutions remembers the route it was opened on, so a navigation closes it
     by derivation instead of by an effect that resets state after render. */
  const [solutionsAt, setSolutionsAt] = useState<string | null>(null);
  const solutionsOpen = solutionsAt === currentPath;

  if (location.pathname !== menuPath) {
    setMenuPath(location.pathname);
    setMobileOpen(false);
    setUserMenuOpen(false);
    setSolutionsAt(null);
  }

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith("http")) {
      setMobileOpen(false);
      return;
    }
    event.preventDefault();
    if (onNavigate) onNavigate(href);
    else navigate(href);
    setMobileOpen(false);
    setSolutionsAt(null);
  };

  /* ── Solutions: hover open, hover-away close, click toggle ─────── */
  const solutionsRef = useRef<HTMLDivElement>(null);
  const solutionsTriggerRef = useRef<HTMLButtonElement>(null);
  const solutionsTimer = useRef<number | null>(null);

  const solutionsActive =
    currentPath === "/solutions" || currentPath.startsWith("/solutions/");

  const clearSolutionsTimer = useCallback(() => {
    if (solutionsTimer.current !== null) {
      window.clearTimeout(solutionsTimer.current);
      solutionsTimer.current = null;
    }
  }, []);

  const openSolutions = useCallback(() => {
    clearSolutionsTimer();
    setSolutionsAt(currentPath);
  }, [clearSolutionsTimer, currentPath]);

  /* A short grace period, so moving from the trigger to the panel — a few
     pixels of gap — does not close it on the way. */
  const scheduleSolutionsClose = useCallback(() => {
    clearSolutionsTimer();
    solutionsTimer.current = window.setTimeout(() => {
      setSolutionsAt(null);
      solutionsTimer.current = null;
    }, 160);
  }, [clearSolutionsTimer]);

  useEffect(() => clearSolutionsTimer, [clearSolutionsTimer]);

  useEffect(() => {
    if (!solutionsOpen) return;
    const onDown = (event: Event) => {
      if (!solutionsRef.current?.contains(event.target as Node)) {
        setSolutionsAt(null);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSolutionsAt(null);
      solutionsTriggerRef.current?.focus();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [solutionsOpen]);

  /* ── Phone menu: outside tap and Escape close it ──────────────────
     It already closes when a link is followed or the route changes; without
     this it stayed open behind whatever the visitor tapped next. */
  useEffect(() => {
    if (!mobileOpen) return;
    const onDown = (event: Event) => {
      const target = event.target as Node;
      if (mobilePanelRef.current?.contains(target)) return;
      if (mobileTriggerRef.current?.contains(target)) return;
      setMobileOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileOpen(false);
      mobileTriggerRef.current?.focus();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  /* ── Account dropdown: hover open / delayed close ──────────────── */
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!userMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [userMenuOpen]);

  const isDesktop = useIsDesktop();

  const focusRing = cn(
    "focus-visible:outline-hidden focus-visible:ring-2",
    NAV.focus,
  );

  const iconBtn = cn(
    "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg",
    "transition-colors duration-150",
    NAV.icon,
    NAV.iconHover,
    focusRing,
  );

  /* One recipe for every top-level item — the plain links and the Solutions
     trigger alike. Colour and hover are identical across them; the only thing
     that changes with state is the weight, bold when active and normal
     otherwise, so nothing shifts sideways on hover. */
  const desktopLink = (active: boolean) =>
    cn(
      "group relative rounded-md px-3.5 py-2",
      "text-[15.5px] transition-colors duration-150",
      NAV.text,
      active ? "font-bold" : "font-medium",
      focusRing,
    );

  /* The action, permanently white: an off-white chip with a dark green label,
     the same in both themes. */
  const ctaSoft = cn(
    "rounded-lg border font-bold",
    "bg-[rgb(252,253,252)] text-[rgb(45,84,52)]",
    "border-[rgb(226,232,226)] hover:bg-[rgb(244,247,244)]",
    "transition-colors duration-150 motion-reduce:transition-none",
  );

  const panelRow = cn(
    "flex items-center gap-3 rounded-lg px-3 py-3",
    "text-[13px]",
    "transition-colors duration-150",
    NAV.text,
    NAV.hover,
    "hover:text-[rgb(176,176,176)]",
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-17 w-full mx-auto max-w-384",
        NAV.surface,
        /* The bar is white in both themes, so it has to set its own ink. Without
           this, any child that does not declare a colour inherits `body`'s,
           which is near-white in dark mode — white text on a white bar. */
        NAV.ink,
        "border-x border-b ",
        NAV.edge,
      )}
    >
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-15 sm:gap-6 sm:px-6">
        {/* ── LEFT: brand ─────────────────────────────────────────── */}
        <Link to="/home" aria-label="Home" className={focusRing}>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex group/logo min-w-0 mt-1.5 shrink items-center gap-3 rounded-full",
              focusRing,
            )}
          >
            <span className="flex shrink-0 items-center justify-center">
              {/* Logo, visible normally, hidden on hover */}
              <KanbanIcon
                size={24}
                variant="upper"
                theme="light"
                className="transition-transform duration-150 group-hover/logo:scale-110"
              />
            </span>
            <span
              className={cn(
                "font-display text-[16px] font-bold leading-none tracking-tight",
                "transition-colors duration-150",
                NAV.ink,
              )}
            >
              Kanban
            </span>
          </button>
        </Link>

        {/* ── RIGHT: nav links + controls ─────────────────────────── */}
        <div className="flex shrink-0 items-center mt-px gap-3.5 sm:gap-4">
          {/* Desktop nav */}
          <nav className="hidden items-center mt-1.5 gap-1.5 md:flex">
            {isDesktop ? <NavbarSearch onNavigate={onNavigate} /> : null}

            <a
              href="/use-cases"
              onClick={(event) => handleNavClick(event, "/use-cases")}
              aria-current={isActive("/use-cases") ? "page" : undefined}
              className={desktopLink(isActive("/use-cases"))}
            >
              Examples
            </a>

            {/* ── Solutions: opens on hover and on click ──────────── */}
            <div
              ref={solutionsRef}
              className="relative"
              onMouseEnter={openSolutions}
              onMouseLeave={scheduleSolutionsClose}
            >
              <button
                ref={solutionsTriggerRef}
                type="button"
                onClick={() =>
                  setSolutionsAt((value) =>
                    value === currentPath ? null : currentPath,
                  )
                }
                aria-expanded={solutionsOpen}
                aria-controls="navbar-solutions"
                aria-haspopup="true"
                className={cn(
                  desktopLink(solutionsActive),
                  "flex cursor-pointer items-center gap-1.5",
                )}
              >
                Solutions
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={14}
                  strokeWidth={2}
                  aria-hidden="true"
                  className={cn(
                    "shrink-0 transition-transform duration-200 motion-reduce:transition-none",
                    solutionsOpen && "rotate-180",
                  )}
                />
              </button>

              {solutionsOpen ? (
                <div
                  id="navbar-solutions"
                  className={cn(
                    "absolute left-0 top-full z-50 mt-2 w-60 rounded-xl border p-2",
                    "origin-top animate-in fade-in zoom-in-95 duration-150 ease-out",
                    "motion-reduce:animate-none",
                    NAV.surface,
                    NAV.edge,
                    NAV.panel,
                  )}
                >
                  <ul>
                    {SOLUTIONS.map((item) => (
                      <li key={item.title}>
                        <a
                          href={item.href}
                          onClick={(event) => handleNavClick(event, item.href)}
                          className={panelRow}
                        >
                          <HugeiconsIcon
                            icon={item.icon}
                            size={20}
                            strokeWidth={1.6}
                            aria-hidden="true"
                            className={cn("shrink-0", NAV.icon)}
                          />
                          <span>{item.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {NAV_LINKS.filter((item) => item.title !== "Examples").map(
              (item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(event) => handleNavClick(event, item.href)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={desktopLink(isActive(item.href))}
                >
                  {item.title}
                </a>
              ),
            )}
          </nav>

          {/* Divider */}
          <span
            aria-hidden
            className={cn("mx-1 hidden h-5 w-px md:block", NAV.divider)}
          />

          {/* Auth */}
          {isAuthenticated && user ? (
            <button
              type="button"
              onClick={() => navigate("/workspaces")}
              className={cn(
                "group hidden items-center justify-center gap-1.5 px-4 py-2",
                "text-[13px]",
                ctaSoft,
                "transition-[background-color,transform] duration-150 ease-out",
                "hover:scale-105",
                "active:scale-[0.97]",
                focusRing,
                "md:inline-flex cursor-pointer",
              )}
            >
              <span>Dashboard</span>
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={13}
                strokeWidth={2.2}
                className="shrink-0 transition-transform duration-200 ease-out group-hover:-rotate-45"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/auth/login")}
              className={cn(
                "group hidden items-center justify-center gap-1.5 px-4 py-2",
                "text-[13px]",
                ctaSoft,
                "transition-[background-color,transform] duration-150 ease-out",
                "hover:scale-105",
                "active:scale-[0.97]",
                focusRing,
                "md:inline-flex cursor-pointer",
              )}
            >
              <span>Get Started</span>
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={13}
                strokeWidth={2.2}
                className="shrink-0 transition-transform duration-200 ease-out group-hover:-rotate-45"
              />
            </button>
          )}

          {/* Search — phone only, and only mounted on this side of the
              breakpoint, so there is never a second copy listening. */}
          {isDesktop ? null : (
            <NavbarSearch onNavigate={onNavigate} variant="mobile" />
          )}

          {/* Menu: the phone's only way to the nav links, so it is there
              whether or not anyone is signed in. */}
          <button
            ref={mobileTriggerRef}
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            aria-expanded={mobileOpen}
            aria-controls="navbar-mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className={cn(iconBtn, "md:hidden")}
          >
            <HugeiconsIcon
              icon={mobileOpen ? Cancel01Icon : Menu03Icon}
              size={18}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      {/* ── Phone menu: the Solutions card shape, with search on top ─ */}
      {mobileOpen ? (
        <div
          ref={mobilePanelRef}
          id="navbar-mobile-menu"
          className={cn(
            "absolute right-4 top-full z-50 w-60 rounded-xl border p-2 md:hidden",
            "origin-top animate-in fade-in zoom-in-95 duration-150 ease-out",
            "motion-reduce:animate-none",
            NAV.surface,
            NAV.edge,
            NAV.panel,
          )}
        >
          <ul>
            {MOBILE_LINKS.map((item) => (
              <li key={item.title}>
                <a
                  href={item.href}
                  onClick={(event) => handleNavClick(event, item.href)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    panelRow,
                    isActive(item.href) && cn("font-bold", NAV.accent),
                  )}
                >
                  <HugeiconsIcon
                    icon={item.icon ?? Menu03Icon}
                    size={20}
                    strokeWidth={1.6}
                    aria-hidden="true"
                    className={cn("shrink-0", NAV.icon)}
                  />
                  {item.title}
                </a>
              </li>
            ))}
          </ul>

          {!isAuthenticated && (
            <div className={cn("mt-1 border-t p-1.5 pt-3", NAV.edge)}>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/auth/login");
                }}
                className={cn(
                  "group relative flex w-full cursor-pointer items-center justify-center px-3 py-2.5",
                  "text-sm",
                  ctaSoft,
                  "transition-[background-color,transform] duration-150 ease-out",
                  "active:scale-[0.98]",
                  focusRing,
                )}
              >
                <span className="pr-5">Get Started</span>
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  size={14}
                  strokeWidth={2.2}
                  className="absolute right-3 transition-transform duration-200 ease-out group-hover:-rotate-45"
                />
              </button>
            </div>
          )}
        </div>
      ) : null}
    </header>
  );
}
