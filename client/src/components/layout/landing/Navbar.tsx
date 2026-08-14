import { useEffect, useState, useTransition, type MouseEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";

export interface NavigationSection {
  title: string;
  href: string;
}

const navigationData: NavigationSection[] = [
  {
    title: "Features",
    href: "/features",
  },
  {
    title: "How it Works",
    href: "/how-it-works",
  },
  {
    title: "GitHub",
    href: "https://github.com/imrajmishraa/kanban-collab",
  },
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
  const [isPending, startTransition] = useTransition();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const currentPath = activeHref || location.pathname;

  /*
   * ------------------------------------------------------------
   * Responsive header visibility
   * ------------------------------------------------------------
   *
   * Desktop:
   * - Header becomes visible on mouse activity.
   * - Header hides after a short period of inactivity.
   *
   * Mobile:
   * - Header remains visible.
   * - Touch interaction keeps the header visible.
   * - Mobile menu prevents the header from hiding.
   */
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

      if (mediaQuery.matches || isHovered || mobileMenuOpen) {
        return;
      }

      timeoutId = window.setTimeout(() => {
        setShowHeader(false);
      }, 2500);
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

  // Navigation
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

    if (onNavigate) {
      onNavigate(href);
    } else {
      navigate(href);
    }

    setMobileMenuOpen(false);
  };

  // Authentication
  const handleStartBuilding = () => {
    navigate("/auth/register");
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    if (!isAuthenticated || isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await logout();

      setMobileMenuOpen(false);

      navigate("/auth/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  // Render
  return (
    <header
      onMouseEnter={() => {
        setIsHovered(true);
        setShowHeader(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      className={`fixed inset-x-0 top-0 z-50 w-full border-b border-neutral-800 bg-[#0c0c0e]/95 backdrop-blur-sm transition-all duration-300 ${
        showHeader
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-full items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <button
          type="button"
          onClick={() => {
            navigate("/");
            setMobileMenuOpen(false);
          }}
          className="group flex cursor-pointer items-center gap-2 font-mono text-lg font-bold tracking-tight text-neutral-100 transition-colors hover:text-white"
          aria-label="Go to homepage"
        >
          <span className="font-extrabold text-rose-500">&gt;</span>

          <span>Kanban</span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <nav className="flex items-center gap-5">
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
                  className={`relative font-mono text-xs tracking-wide transition-colors ${
                    isActive
                      ? "font-semibold text-rose-400"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {item.title}

                  {isActive && (
                    <svg
                      className="pointer-events-none absolute -bottom-1 left-0 h-1.5 w-full text-rose-500"
                      viewBox="0 0 100 20"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M 2,10 Q 50,18 98,9 Q 50,13 2,11"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </a>
              );
            })}

            {/* Login — only visible when logged out */}
            {!isAuthenticated && (
              <a
                href="/auth/login"
                onClick={(event) => handleNavClick(event, "/auth/login")}
                className={`font-mono text-xs tracking-wide transition-colors ${
                  currentPath === "/auth/sign-in"
                    ? "font-semibold text-rose-400"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Login
              </a>
            )}
          </nav>

          {/* Separator */}
          <div className="h-4 w-px bg-neutral-800" />

          {/* Authentication Actions */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <span className="max-w-52 truncate border border-neutral-700 bg-neutral-900/80 px-2 py-0.5 font-mono text-xs text-neutral-300">
                ✏️ {user.email}
              </span>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="font-mono text-xs text-rose-500 transition-colors hover:text-rose-400 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSigningOut ? "[ Leaving... ]" : "[ Sign Out ]"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartBuilding}
              className="border border-rose-500/80 bg-rose-500/10 px-3 py-1 font-mono text-xs text-rose-400 transition-colors hover:bg-rose-500/20 active:scale-95"
            >
              [ Get Started ]
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
          className="p-1 font-mono text-xs text-neutral-400 transition-colors hover:text-neutral-100 md:hidden"
        >
          {mobileMenuOpen ? "[ Close ]" : "[ Menu ]"}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-neutral-800 bg-[#0c0c0e] px-4 py-4 md:hidden"
        >
          <nav className="flex flex-col gap-3 font-mono text-sm">
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
                  className={`text-xs transition-colors ${
                    isActive
                      ? "font-bold text-rose-400"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {item.title}
                </a>
              );
            })}

            {/* Login — only visible when logged out */}
            {!isAuthenticated && (
              <a
                href="/auth/sign-in"
                onClick={(event) => handleNavClick(event, "/auth/sign-in")}
                className={`text-xs transition-colors ${
                  currentPath === "/auth/sign-in"
                    ? "font-bold text-rose-400"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Login
              </a>
            )}

            <div className="my-1 border-t border-neutral-800" />

            {/* Mobile Authentication */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <span className="max-w-52 truncate border border-neutral-700 bg-neutral-900/80 px-2 py-0.5 font-mono text-xs text-neutral-300">
                  ✏️ {user.email}
                </span>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="font-mono text-xs text-rose-500 transition-colors hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSigningOut ? "[ Leaving... ]" : "[ Sign Out ]"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartBuilding}
                className="border border-rose-500/80 bg-rose-500/10 px-3 py-1 font-mono text-xs text-rose-400 transition-colors hover:bg-rose-500/20 active:scale-95"
              >
                [ Get Started ]
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
