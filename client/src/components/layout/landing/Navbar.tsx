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

  const ink = isDarkNav ? "text-[#EAF2ED]" : "text-[#17181A]";
  const inkSecondary = isDarkNav ? "text-[#9FB0A6]" : "text-[#4E545B]";
  const accent = isDarkNav ? "text-[#4DE352]" : "text-[#16A34A]";
  const accentBar = isDarkNav ? "bg-[#4DE352]" : "bg-[#16A34A]";
  const dividerBg = isDarkNav ? "bg-[#24312B]" : "bg-[#E4E6E9]";
  const surface = isDarkNav
    ? "bg-[#101713] border-[#24312B] hover:border-[#31413A] hover:bg-[#141C17] hover:text-[#EAF2ED]"
    : "bg-white border-[#E4E6E9] hover:border-[#D2D6DA] hover:bg-[#F0F1F3] hover:text-[#17181A]";
  const focusRing = isDarkNav
    ? "focus-visible:ring-[#4DE352]/40"
    : "focus-visible:ring-[#16A34A]/40";
  const ctaFill = "bg-[#4DE352] text-[#071009] hover:bg-[#63EA68]";

  const btn = cn(
    "flex size-8 shrink-0 items-center justify-center rounded-md border",
    isDarkNav
      ? "border-[#24312B] bg-[#101713] text-[#9FB0A6]"
      : "border-[#E4E6E9] bg-white text-[#4E545B]",
    "transition-colors duration-150",
    surface,
    "focus-visible:outline-none focus-visible:ring-2",
    focusRing,
  );

  /* Shared class recipe for one nav link (desktop) */
  const desktopLink = (active: boolean) =>
    cn(
      "group relative rounded-md px-3 py-1.5",
      "text-[13px] font-medium",
      "transition-colors duration-150",
      "focus-visible:outline-none focus-visible:ring-2",
      focusRing,
      active
        ? accent
        : cn(
            inkSecondary,
            isDarkNav ? "hover:text-[#EAF2ED]" : "hover:text-[#17181A]",
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
            ? "bg-[#0A0F0D]/30 backdrop-blur-xl backdrop-saturate-150"
            : "bg-transparent"
          : scrolled
            ? "bg-white/35 backdrop-blur-xl backdrop-saturate-150"
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
          className="focus-visible:outline-none focus-visible:ring-2"
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
                        ? "hover:text-[#EAF2ED]"
                        : "hover:text-[#17181A]",
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
                "focus-visible:outline-none focus-visible:ring-2",
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
                "focus-visible:outline-none focus-visible:ring-2",
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
              ? "border-[#24312B]/95 bg-[#0A0F0D]/95"
              : "border-[#E4E6E9] bg-white/95",
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
                    ? "bg-[#4DE352]/10 text-[#4DE352]"
                    : "bg-[#16A34A]/10 text-[#16A34A]"
                  : cn(
                      inkSecondary,
                      isDarkNav
                        ? "hover:bg-[#141C17] hover:text-[#EAF2ED]"
                        : "hover:bg-[#F0F1F3] hover:text-[#17181A]",
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
                      ? "bg-[#4DE352]/10 text-[#4DE352]"
                      : "bg-[#16A34A]/10 text-[#16A34A]"
                    : cn(
                        inkSecondary,
                        isDarkNav
                          ? "hover:bg-[#141C17] hover:text-[#EAF2ED]"
                          : "hover:bg-[#F0F1F3] hover:text-[#17181A]",
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
                  isDarkNav ? "border-[#24312B]" : "border-[#E4E6E9]",
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
                    "focus-visible:outline-none focus-visible:ring-2",
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
                ? "border-[#24312B] bg-[#101713] shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
                : "border-[#E4E6E9] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3 border-b px-4 py-3",
                isDarkNav ? "border-[#24312B]" : "border-[#E4E6E9]",
              )}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-[#4DE352] text-xs font-bold text-[#071009]">
                {initials}
              </span>
              <span
                className={cn(
                  "truncate text-[13px] font-medium",
                  isDarkNav ? "text-[#EAF2ED]" : "text-[#17181A]",
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
                    ? "text-[#9FB0A6] hover:bg-[#141C17] hover:text-[#EAF2ED]"
                    : "text-[#4E545B] hover:bg-[#F0F1F3] hover:text-[#17181A]",
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
