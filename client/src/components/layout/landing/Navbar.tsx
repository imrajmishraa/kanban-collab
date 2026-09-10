import { useEffect, useState, type MouseEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Menu01Icon,
  Cancel01Icon,
  UserIcon,
  Logout03Icon,
  Edit02Icon,
  GithubIcon,
} from "@hugeicons/core-free-icons";

export interface NavigationSection {
  title: string;
  href: string;
}

const navigationData: NavigationSection[] = [
  { title: "Features", href: "/features" },
  { title: "How it Works", href: "/how-it-works" },
  { title: "GitHub", href: "https://github.com/imrajmishraa/kanban-collab" },
];

interface NavbarProps {
  onNavigate?: (href: string) => void;
  activeHref?: string;
}

export default function Navbar({ onNavigate, activeHref = "" }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [showHeader, setShowHeader] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const currentPath = activeHref || location.pathname;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    let timeoutId: number | undefined;

    const clearHideTimeout = () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    const scheduleHide = () => {
      clearHideTimeout();
      if (mediaQuery.matches || isHovered || mobileMenuOpen) return;
      timeoutId = window.setTimeout(() => setShowHeader(false), 2500);
    };

    const handleActivity = () => {
      setShowHeader(true);
      scheduleHide();
    };

    const handleViewportChange = () => {
      clearHideTimeout();
      if (mediaQuery.matches) {
        setShowHeader(true);
        return;
      }
      scheduleHide();
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    mediaQuery.addEventListener("change", handleViewportChange);

    scheduleHide();

    return () => {
      clearHideTimeout();
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      mediaQuery.removeEventListener("change", handleViewportChange);
    };
  }, [isHovered, mobileMenuOpen]);

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    const isExternal = href.startsWith("http");
    if (isExternal) {
      setMobileMenuOpen(false);
      return;
    }
    event.preventDefault();
    if (onNavigate) onNavigate(href);
    else navigate(href);
    setMobileMenuOpen(false);
  };

  const handleStartBuilding = () => {
    navigate("/auth/register");
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    if (!isAuthenticated || isSigningOut) return;
    setIsSigningOut(true);
    try {
      await logout();
      setMobileMenuOpen(false);
      navigate("/auth/login", { replace: true });
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header
      onMouseEnter={() => {
        setIsHovered(true);
        setShowHeader(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed inset-x-0 top-0 z-50 w-full transition-all duration-500 ${
        showHeader
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-full opacity-0"
      }`}
    >
      {/* ── Glassy floating container ─────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-5 sm:pt-4">
        <div
          className="
            group/glass
            relative
            overflow-hidden
            rounded-2xl
            border border-white/8
            bg-white/3
            backdrop-blur-xl
            backdrop-saturate-150
            shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]
            transition-all duration-300
            hover:border-white/[0.14]
            hover:bg-white/5
            hover:shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)]
          "
        >
          {/* Top sheen */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35)_50%,transparent)]" />

          {/* Brand glow */}
          <div className="pointer-events-none absolute -top-24 left-1/4 h-40 w-72 -translate-x-1/2 rounded-full bg-(--brand)/14 blur-[60px]" />

          {/* Diagonal reflection */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.05)_45%,transparent_60%)]" />

          {/* ── Main row ────────────────────────────────────────────── */}
          <div className="relative flex h-14 items-center justify-between px-4 sm:px-5">
            {/* Brand */}
            <button
              type="button"
              onClick={() => {
                navigate("/");
                setMobileMenuOpen(false);
              }}
              className="group flex cursor-pointer items-center gap-2.5 font-mono text-lg font-bold tracking-tight text-(--text-primary) transition-colors"
              aria-label="Go to homepage"
            >
              <img
                src="/appIcon.png"
                alt=""
                width={28}
                height={28}
                draggable={false}
                className="h-7 w-7 rounded-lg border border-white/8 object-cover shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition-all duration-300 group-hover:border-(--brand)/40 group-hover:shadow-[0_0_16px_-2px_var(--brand)]"
              />
              <span>Kanban</span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-6 md:flex">
              <nav className="flex items-center gap-1">
                {navigationData.map((item) => {
                  const isExternal = item.href.startsWith("http");
                  const isActive = !isExternal && currentPath === item.href;

                  return (
                    <a
                      key={item.title}
                      href={item.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      onClick={(event) => handleNavClick(event, item.href)}
                      className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs tracking-wide transition-all duration-200 ${
                        isActive
                          ? "text-(--brand-hover)"
                          : "text-(--text-secondary) hover:bg-white/6 hover:text-(--text-primary)"
                      }`}
                    >
                      {isExternal && (
                        <HugeiconsIcon icon={GithubIcon} size={14} />
                      )}
                      {item.title}

                      {isActive && (
                        <span className="absolute inset-x-2 -bottom-px h-px bg-[linear-gradient(90deg,transparent,var(--brand),transparent)]" />
                      )}
                    </a>
                  );
                })}

                {!isAuthenticated && (
                  <a
                    href="/auth/login"
                    onClick={(event) => handleNavClick(event, "/auth/login")}
                    className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs tracking-wide transition-all duration-200 ${
                      currentPath === "/auth/login"
                        ? "text-(--brand-hover)"
                        : "text-(--text-secondary) hover:bg-white/6 hover:text-(--text-primary)"
                    }`}
                  >
                    <HugeiconsIcon icon={UserIcon} size={14} />
                    Login
                    {currentPath === "/auth/login" && (
                      <span className="absolute inset-x-2 -bottom-px h-px bg-[linear-gradient(90deg,transparent,var(--brand),transparent)]" />
                    )}
                  </a>
                )}
              </nav>

              {/* Divider */}
              <div className="h-5 w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.14),transparent)]" />

              {/* Auth actions */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  <span className="flex max-w-52 items-center gap-1.5 truncate rounded-lg border border-white/8 bg-white/4 px-2.5 py-1 font-mono text-xs text-(--text-primary) backdrop-blur-sm">
                    <HugeiconsIcon
                      icon={Edit02Icon}
                      size={12}
                      className="text-(--text-secondary)"
                    />
                    {user.email}
                  </span>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-xs text-(--brand) transition-all duration-200 hover:bg-(--brand)/10 hover:text-(--brand-hover) disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <HugeiconsIcon icon={Logout03Icon} size={14} />
                    {isSigningOut ? "Leaving..." : "Sign Out"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartBuilding}
                  className="
                    group/btn relative flex items-center gap-1.5 overflow-hidden
                    rounded-lg border border-(--brand)/40
                    bg-(--brand)/10
                    px-3.5 py-1.5 font-mono text-xs text-(--brand-hover)
                    backdrop-blur-sm
                    transition-all duration-300
                    hover:border-(--brand)/70
                    hover:bg-(--brand)/20
                    hover:shadow-[0_0_20px_-4px_var(--brand)]
                    active:scale-95
                  "
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] transition-transform duration-700 group-hover/btn:translate-x-full" />
                  <HugeiconsIcon icon={ArrowRight02Icon} size={14} />
                  Get Started
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen((previous) => !previous);
                setShowHeader(true);
              }}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-(--text-secondary) transition-all duration-200 hover:border-white/[0.14] hover:bg-white/8 hover:text-(--text-primary) md:hidden"
            >
              {mobileMenuOpen ? (
                <HugeiconsIcon icon={Cancel01Icon} size={18} />
              ) : (
                <HugeiconsIcon icon={Menu01Icon} size={18} />
              )}
            </button>
          </div>

          {/* ── Mobile Menu ─────────────────────────────────────────── */}
          {mobileMenuOpen && (
            <div
              id="mobile-navigation"
              className="relative border-t border-white/6 px-4 py-4 md:hidden"
            >
              <nav className="flex flex-col gap-1 font-mono text-sm">
                {navigationData.map((item) => {
                  const isExternal = item.href.startsWith("http");
                  const isActive = !isExternal && currentPath === item.href;

                  return (
                    <a
                      key={item.title}
                      href={item.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      onClick={(event) => handleNavClick(event, item.href)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-all duration-200 ${
                        isActive
                          ? "bg-white/6 font-bold text-(--brand-hover)"
                          : "text-(--text-secondary) hover:bg-white/5 hover:text-(--text-primary)"
                      }`}
                    >
                      {isExternal && (
                        <HugeiconsIcon icon={GithubIcon} size={14} />
                      )}
                      {item.title}
                    </a>
                  );
                })}

                {!isAuthenticated && (
                  <a
                    href="/auth/login"
                    onClick={(event) => handleNavClick(event, "/auth/login")}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-all duration-200 ${
                      currentPath === "/auth/login"
                        ? "bg-white/6 font-bold text-(--brand-hover)"
                        : "text-(--text-secondary) hover:bg-white/5 hover:text-(--text-primary)"
                    }`}
                  >
                    <HugeiconsIcon icon={UserIcon} size={14} />
                    Login
                  </a>
                )}

                <div className="my-2 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)]" />

                {isAuthenticated && user ? (
                  <div className="flex items-center gap-2">
                    <span className="flex max-w-52 items-center gap-1.5 truncate rounded-lg border border-white/8 bg-white/4 px-2.5 py-1 font-mono text-xs text-(--text-primary)">
                      <HugeiconsIcon
                        icon={Edit02Icon}
                        size={12}
                        className="text-(--text-secondary)"
                      />
                      {user.email}
                    </span>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-xs text-(--brand) transition-all duration-200 hover:bg-(--brand)/10 hover:text-(--brand-hover) disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <HugeiconsIcon icon={Logout03Icon} size={14} />
                      {isSigningOut ? "Leaving..." : "Sign Out"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartBuilding}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-(--brand)/40 bg-(--brand)/10 px-3.5 py-2 font-mono text-xs text-(--brand-hover) backdrop-blur-sm transition-all duration-300 hover:border-(--brand)/70 hover:bg-(--brand)/20 active:scale-95"
                  >
                    <HugeiconsIcon icon={ArrowRight02Icon} size={14} />
                    Get Started
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
