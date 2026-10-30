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
  ArrowRight02Icon,
  Cancel01Icon,
  Menu01Icon,
  GithubIcon,
  UserIcon,
  Logout03Icon,
} from "@hugeicons/core-free-icons";

import { useAuth } from "@/hooks/auth/useAuth";
import logo from "@/assets/logo.svg?inline";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export interface NavigationSection {
  title: string;
  href: string;
  external?: boolean;
}

const navigationData: NavigationSection[] = [
  { title: "Features", href: "/features" },
  { title: "How it Works", href: "/how-it-works" },
];

interface NavbarProps {
  onNavigate?: (href: string) => void;
  activeHref?: string;
  /** Force a palette; defaults to dark (matches the app's dark theme). */
  dark?: boolean;
}

export default function Navbar({
  onNavigate,
  activeHref = "",
  dark = true,
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const currentPath = activeHref || location.pathname;

  const isActive = (item: NavigationSection) => {
    if (item.external) return false;
    return currentPath === item.href;
  };

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(location.pathname);

  if (location.pathname !== menuPath) {
    setMenuPath(location.pathname);
    setMobileOpen(false);
    setUserMenuOpen(false);
  }

  /* ── Frosted glass appears on scroll ─────────────────────────── */
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    const isExternal = href.startsWith("http");
    if (isExternal) {
      setMobileOpen(false);
      return;
    }
    event.preventDefault();
    if (onNavigate) onNavigate(href);
    else navigate(href);
    setMobileOpen(false);
  };

  const handleSignOut = async () => {
    if (!isAuthenticated || isSigningOut) return;
    setIsSigningOut(true);
    try {
      await logout();
      setUserMenuOpen(false);
      navigate("/auth/login", { replace: true });
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      setIsSigningOut(false);
    }
  };

  /* ── User dropdown: hover open / delayed close ─────────────────── */
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | null>(null);

  const openMenu = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setUserMenuOpen(true);
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setUserMenuOpen(false);
      closeTimer.current = null;
    }, 160);
  }, []);

  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  /* ── Escape closes dropdown ────────────────────────────────────── */
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

  const initials = (user?.email ?? "?").charAt(0).toUpperCase();

  /* ── Palette: hardcoded dark / hardcoded light ─────────────────── */
  const isDarkNav = dark;

  const ink = isDarkNav
    ? "text-[var(--text-primary)]"
    : "text-[var(--text-primary)]";
  const inkSecondary = isDarkNav
    ? "text-[var(--text-secondary)]"
    : "text-[var(--text-secondary)]";
  const accent = isDarkNav ? "text-[var(--success)]" : "text-[var(--success)]";
  const accentBar = isDarkNav ? "bg-(--success)" : "bg-(--success)";
  const dividerBg = isDarkNav ? "bg-[var(--hairline)]" : "bg-[var(--hairline)]";
  const surface = isDarkNav
    ? "bg-(--bg-root) border-[var(--hairline)] hover:border-[var(--hairline-strong)] hover:bg-(--bg-surface) hover:text-[var(--text-primary)]"
    : "bg-(--solid-bg) border-[var(--hairline)] hover:border-[var(--hairline-strong)] hover:bg-(--text-primary) hover:text-[var(--text-primary)]";
  const focusRing = isDarkNav
    ? "focus-visible:ring-[var(--success)]/40"
    : "focus-visible:ring-[var(--success)]/40";
  const ctaFill =
    "bg-(--success) text-(--text-secondary) hover:bg-[var(--success)]";

  const btn = cn(
    "flex size-8 shrink-0 items-center justify-center rounded-md border",
    isDarkNav
      ? "border-[var(--hairline)] bg-(--bg-root) text-[var(--text-secondary)]"
      : "border-[var(--hairline)] bg-(--solid-bg) text-[var(--text-secondary)]",
    "transition-colors duration-150",
    surface,
    "focus-visible:outline-hidden focus-visible:ring-2",
    focusRing,
  );

  /* Shared class recipe for one nav link (desktop) */
  const desktopLink = (active: boolean) =>
    cn(
      "group relative rounded-md px-3 py-1.5",
      "text-[13px] font-medium",
      "transition-colors duration-150",
      "focus-visible:outline-hidden focus-visible:ring-2",
      focusRing,
      active
        ? accent
        : cn(
            inkSecondary,
            isDarkNav
              ? "hover:text-[var(--text-primary)]"
              : "hover:text-[var(--text-primary)]",
          ),
    );

  const underline = (active: boolean) =>
    cn(
      "absolute inset-x-3 bottom-0 h-0.5 rounded-full",
      accentBar,
      "origin-left transition-transform duration-300 ease-out",
      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
    );

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full",
        "transition-[background-color,border-color] duration-300",
        isDarkNav
          ? scrolled
            ? "bg-(--bg-root)/30 backdrop-blur-xl backdrop-saturate-150"
            : "bg-transparent"
          : scrolled
            ? "bg-(--tint-15) backdrop-blur-xl backdrop-saturate-150"
            : "bg-transparent",
      )}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 -top-24 h-24",
          isDarkNav
            ? "bg-[radial-gradient(ellipse_at_top,rgba(77,227,82,0.08),transparent_70%)]"
            : "bg-[radial-gradient(ellipse_at_top,rgba(217,146,42,0.10),transparent_70%)]",
        )}
      />

      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-15 sm:gap-4 sm:px-6">
        {/* ── LEFT: brand ─────────────────────────────────────────── */}
        <Link
          to="/"
          aria-label="Home"
          className="focus-visible:outline-hidden focus-visible:ring-2"
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex min-w-0 shrink items-center gap-3 rounded-full",
              focusRing,
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md",
              )}
            >
              <img
                src={logo}
                alt=""
                width={28}
                height={28}
                draggable={false}
                className="size-full object-cover rounded-full"
              />
            </span>
            <span
              className={cn(
                "font-display text-[17px] font-bold leading-none tracking-tight transition-colors duration-300",
                ink,
              )}
            >
              Kanban
            </span>
          </button>
        </Link>

        {/* ── RIGHT: nav links + controls ─────────────────────────── */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Nav links — desktop only */}
          <nav className="hidden items-center gap-1 md:flex">
            {navigationData.map((item) => {
              const active = isActive(item);

              if (item.external) {
                return (
                  <a
                    key={item.title}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      desktopLink(false),
                      "flex items-center gap-1.5",
                      inkSecondary,
                      isDarkNav
                        ? "hover:text-[var(--text-primary)]"
                        : "hover:text-[var(--text-primary)]",
                    )}
                  >
                    <HugeiconsIcon
                      icon={GithubIcon}
                      size={13}
                      strokeWidth={2.2}
                    />
                    {item.title}
                    <span aria-hidden className={underline(false)} />
                  </a>
                );
              }

              return (
                <a
                  key={item.title}
                  href={item.href}
                  onClick={(event) => handleNavClick(event, item.href)}
                  className={desktopLink(active)}
                >
                  {item.title}
                  <span aria-hidden className={underline(active)} />
                </a>
              );
            })}

            {!isAuthenticated && (
              <a
                href="/auth/login"
                onClick={(event) => handleNavClick(event, "/auth/login")}
                className={cn(
                  desktopLink(currentPath === "/auth/login"),
                  "flex items-center gap-1.5",
                )}
              >
                <HugeiconsIcon icon={UserIcon} size={13} strokeWidth={2.2} />
                Login
                <span
                  aria-hidden
                  className={underline(currentPath === "/auth/login")}
                />
              </a>
            )}
          </nav>

          {/* Divider between links and controls */}
          <span
            aria-hidden
            className={cn("mx-1 hidden h-4 w-px md:block", dividerBg)}
          />

          {/* Auth */}
          {isAuthenticated && user ? (
            <button
              type="button"
              onClick={() => navigate("/auth/register")}
              className={cn(
                "group hidden items-center justify-center gap-1.5 rounded-md px-3.5 py-1.5",
                "text-[13px] font-semibold",
                ctaFill,
                "transition-[background-color,transform] duration-150 ease-out",
                "hover:scale-105",
                "active:scale-[0.97]",
                "focus-visible:outline-hidden focus-visible:ring-2",
                focusRing,
                "md:inline-flex cursor-pointer",
              )}
            >
              <span>Dashboard</span>
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={13}
                strokeWidth={2.2}
                className={cn(
                  "shrink-0",
                  "transition-transform duration-200 ease-out",
                  "group-hover:-rotate-45",
                )}
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/auth/register")}
              className={cn(
                "group hidden items-center justify-center gap-1.5 rounded-md px-3.5 py-1.5",
                "text-[13px] font-semibold",
                ctaFill,
                "transition-[background-color,transform] duration-150 ease-out",
                "hover:scale-105",
                "active:scale-[0.97]",
                "focus-visible:outline-hidden focus-visible:ring-2",
                focusRing,
                "md:inline-flex cursor-pointer",
              )}
            >
              <span>Get Started</span>
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={13}
                strokeWidth={2.2}
                className={cn(
                  "shrink-0",
                  "transition-transform duration-200 ease-out",
                  "group-hover:-rotate-45",
                )}
              />
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            aria-expanded={mobileOpen}
            aria-controls="navbar-mobile-nav"
            aria-label="Toggle menu"
            className={cn(
              btn,
              "md:hidden cursor-pointer border-none transparent-none",
            )}
          >
            <HugeiconsIcon
              icon={mobileOpen ? Cancel01Icon : Menu01Icon}
              size={18}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          id="navbar-mobile-nav"
          className={cn(
            "border-t backdrop-blur-xl backdrop-saturate-150 md:hidden",
            isDarkNav
              ? "border-[var(--hairline)]/95 bg-(--bg-root)/95"
              : "border-[var(--hairline)] bg-(--bg-root)/95",
          )}
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-0.5 px-4 py-3">
            {navigationData.map((item) => {
              const active = isActive(item);
              const cls = cn(
                "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium",
                "transition-colors duration-150",
                active
                  ? isDarkNav
                    ? "bg-(--success)/10 text-[var(--success)]"
                    : "bg-(--success)/10 text-[var(--success)]"
                  : cn(
                      inkSecondary,
                      isDarkNav
                        ? "hover:bg-(--bg-surface) hover:text-[var(--text-primary)]"
                        : "hover:bg-(--text-primary) hover:text-[var(--text-primary)]",
                    ),
              );

              if (item.external) {
                return (
                  <a
                    key={item.title}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cls}
                    onClick={() => setMobileOpen(false)}
                  >
                    <HugeiconsIcon
                      icon={GithubIcon}
                      size={14}
                      strokeWidth={2.2}
                    />
                    {item.title}
                  </a>
                );
              }

              return (
                <a
                  key={item.title}
                  href={item.href}
                  onClick={(event) => handleNavClick(event, item.href)}
                  className={cls}
                >
                  {item.title}
                </a>
              );
            })}

            {!isAuthenticated && (
              <a
                href="/auth/login"
                onClick={(event) => handleNavClick(event, "/auth/login")}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium",
                  "transition-colors duration-150",
                  currentPath === "/auth/login"
                    ? isDarkNav
                      ? "bg-(--success)/10 text-[var(--success)]"
                      : "bg-(--success)/10 text-[var(--success)]"
                    : cn(
                        inkSecondary,
                        isDarkNav
                          ? "hover:bg-(--bg-surface) hover:text-[var(--text-primary)]"
                          : "hover:bg-(--text-primary) hover:text-[var(--text-primary)]",
                      ),
                )}
              >
                <HugeiconsIcon icon={UserIcon} size={14} strokeWidth={2.2} />
                Login
              </a>
            )}

            {!isAuthenticated && (
              <div
                className={cn(
                  "mt-1 border-t pt-3",
                  isDarkNav
                    ? "border-[var(--hairline)]"
                    : "border-[var(--hairline)]",
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/auth/register");
                  }}
                  className={cn(
                    "group relative flex items-center justify-center rounded-md px-3 py-2.5",
                    "text-sm font-semibold",
                    ctaFill,
                    "transition-[background-color,transform] duration-150 ease-out",
                    "active:scale-[0.98]",
                    "focus-visible:outline-hidden focus-visible:ring-2",
                    focusRing,
                    "w-full cursor-pointer",
                  )}
                >
                  <span className="pr-5">Get Started</span>
                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    size={14}
                    strokeWidth={2.2}
                    className={cn(
                      "absolute right-3",
                      "transition-transform duration-200 ease-out",
                      "group-hover:-rotate-45",
                    )}
                  />
                </button>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* ── User dropdown ─────────────────────────────────────────── */}
      {isAuthenticated && user && userMenuOpen && (
        <div
          id="navbar-user-menu"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
          className={cn(
            "absolute right-3 top-full z-50 mt-1",
            "before:absolute before:inset-x-0 before:-top-2 before:h-2 before:content-['']",
            "sm:right-6",
          )}
        >
          <div
            className={cn(
              "w-64 overflow-hidden rounded-xl border shadow-lg",
              isDarkNav
                ? "border-[var(--hairline)] bg-(--bg-root) shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
                : "border-[var(--hairline)] bg-(--solid-bg) shadow-[0_12px_40px_rgba(0,0,0,0.12)]",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3 border-b px-4 py-3",
                isDarkNav
                  ? "border-[var(--hairline)]"
                  : "border-[var(--hairline)]",
              )}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-(--success) text-xs font-bold text-(--text-secondary)">
                {initials}
              </span>
              <span
                className={cn(
                  "truncate text-[13px] font-medium",
                  isDarkNav
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-primary)]",
                )}
              >
                {user.email}
              </span>
            </div>

            <div className="p-1.5">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium",
                  "transition-colors duration-150 cursor-pointer",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  isDarkNav
                    ? "text-[var(--text-secondary)] hover:bg-(--bg-surface) hover:text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-(--text-primary) hover:text-[var(--text-primary)]",
                )}
              >
                <HugeiconsIcon
                  icon={Logout03Icon}
                  size={15}
                  strokeWidth={2.2}
                />
                {isSigningOut ? "Leaving..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
