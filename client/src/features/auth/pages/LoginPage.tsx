import { useState, useId, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Loading03Icon,
  LockPasswordIcon,
  Mail01Icon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/hooks/auth/useAuth";



/* TYPES */

interface LoginLocationState {
  from?: { pathname?: string; search?: string; hash?: string };
}

function getLoginDestination(state: unknown): string {
  if (!state || typeof state !== "object") return "/dashboard";
  const s = state as LoginLocationState;
  if (!s.from?.pathname || !s.from.pathname.startsWith("/"))
    return "/dashboard";
  return `${s.from.pathname}${s.from.search ?? ""}${s.from.hash ?? ""}`;
}

/* BRAND LOGOS */

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.61z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function GithubLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.7v-2.4c-3.3.7-4-1.6-4-1.6-.6-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.7.2-3.4 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.6 3.3-1.2 3.3-1.2.7 1.7.3 3 .1 3.4.8.8 1.2 2 1.2 3.2 0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .4.2.8.8.7A12 12 0 0 0 12 .3z"
      />
    </svg>
  );
}

/* PAGE */

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = getLoginDestination(location.state);

  const emailId = useId();
  const passwordId = useId();
  const rememberId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(
    null,
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password, remember);
      navigate(destination, { replace: true });
    } catch (err) {
      console.error("Sign in failed:", err);
      setError(
        "We couldn't sign you in. Double-check your email and password.",
      );
      setIsSubmitting(false);
    }
  };

  const handleOauth = (provider: "google" | "github") => {
    setOauthLoading(provider);
    const params = new URLSearchParams({ rememberMe: String(remember) });
    window.location.href = `/api/v1/auth/oauth/${provider}?${params}`
  };

  return (
    <main className="relative h-screen overflow-hidden text-(--text-primary)">
      <div className="grid h-full lg:grid-cols-[1.15fr_1fr]">
        {/* LEFT — Advertisement panel */}

        <aside className="relative hidden overflow-hidden border-r border-white/8 lg:flex lg:flex-col">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.12) 0.9px, transparent 0.9px)",
              backgroundSize: "24px 24px",
              maskImage:
                "radial-gradient(ellipse 80% 70% at 30% 40%, #000 0%, transparent 85%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 80% 70% at 30% 40%, #000 0%, transparent 85%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-40 top-1/3 h-150 w-180 rounded-[50%] bg-(--brand)/8 blur-[170px]"
          />

          <div className="relative flex h-full flex-col p-10 xl:p-14">
            <div className="flex flex-1 flex-col justify-center py-8 xl:py-10">
              <div className="inline-flex items-center gap-2.5 self-start rounded-full border border-white/8 bg-white/3 px-3 py-1.5 backdrop-blur-xl">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
                  2,847 teams working now
                </span>
              </div>

              <h1 className="mt-7 max-w-lg font-mono text-[2rem] font-normal leading-[1.08] tracking-[-0.03em] text-white xl:text-[2.5rem]">
                Where teams move
                <br />
                <span className="text-white/35">work forward.</span>
              </h1>

              <p className="mt-5 max-w-md font-mono text-[13px] leading-[1.85] text-white/50">
                Sign in to jump back into your boards — see what your team
                shipped while you were gone.
              </p>

              <LiveBoardPreview />

              <ul className="mt-8 grid max-w-md grid-cols-3 gap-3">
                <StatBlock value="12k+" label="Boards" />
                <StatBlock value="99.98%" label="Uptime" />
                <StatBlock value="<50ms" label="Sync" />
              </ul>
            </div>
          </div>
        </aside>

        {/* RIGHT — Login form */}

        <section className="relative flex h-full flex-col overflow-x-hidden overflow-y-auto">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-80 w-200 -translate-x-1/2 rounded-[50%] bg-(--brand)/4 blur-[140px]"
          />

          {/* Mobile brand */}
          <div className="relative flex items-center justify-center px-4 pt-8 lg:hidden">
            <Link to="/" className="group inline-flex items-center gap-2.5">
              <img
                src="/appIcon.png"
                alt=""
                width={26}
                height={26}
                draggable={false}
                className="h-6.5 w-6.5 rounded-lg border border-white/8 object-cover"
              />
              <span className="font-mono text-[15px] font-bold tracking-tight text-white">
                Kanban Collab
              </span>
            </Link>
          </div>

          {/* Form container — vertical centered, tight */}
          <div className="relative flex flex-1 items-center justify-center px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <div className="w-full max-w-95">
              <div>
                <h2 className="font-mono text-[1.5rem] font-normal leading-[1.15] tracking-[-0.02em] text-white sm:text-[1.65rem]">
                  Welcome back
                </h2>
                <p className="mt-2 font-mono text-[12px] leading-[1.65] text-white/45">
                  Sign in to continue to your workspace.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2.5">
                <OAuthButton
                  provider="google"
                  loading={oauthLoading === "google"}
                  disabled={oauthLoading !== null || isSubmitting}
                  onClick={() => handleOauth("google")}
                />
                <OAuthButton
                  provider="github"
                  loading={oauthLoading === "github"}
                  disabled={oauthLoading !== null || isSubmitting}
                  onClick={() => handleOauth("github")}
                />
              </div>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/8" />
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/30">
                  or with email
                </span>
                <span className="h-px flex-1 bg-white/8" />
              </div>

              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mb-4 flex items-start gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3.5 py-2.5"
                >
                  <span className="mt-1.25 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                  <p className="font-mono text-[12px] leading-[1.55] text-rose-200">
                    {error}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor={emailId}
                    className="block font-mono text-[11px] uppercase tracking-[0.18em] text-white/45"
                  >
                    Email
                  </label>
                  <div className="group/input relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-white/30 transition-colors group-focus-within/input:text-(--brand)">
                      <HugeiconsIcon icon={Mail01Icon} size={14} />
                    </span>
                    <input
                      id={emailId}
                      type="email"
                      name="email"
                      autoComplete="email"
                      inputMode="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="
                        w-full rounded-lg border border-white/10 bg-white/2
                        py-2.5 pl-10 pr-3.5
                        font-mono text-[13px] text-white/90 placeholder:text-white/25
                        outline-none transition-all duration-200
                        hover:border-white/14
                        focus:border-(--brand)/60 focus:bg-white/3
                        focus:shadow-[0_0_0_3px_rgba(255,140,66,0.12)]
                      "
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={passwordId}
                      className="block font-mono text-[11px] uppercase tracking-[0.18em] text-white/45"
                    >
                      Password
                    </label>
                    <Link
                      to="/auth/forgot-password"
                      className="font-mono text-[11px] text-white/40 transition-colors duration-200 hover:text-(--brand)"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="group/input relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-white/30 transition-colors group-focus-within/input:text-(--brand)">
                      <HugeiconsIcon icon={LockPasswordIcon} size={14} />
                    </span>
                    <input
                      id={passwordId}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="
                        w-full rounded-lg border border-white/10 bg-white/2
                        py-2.5 pl-10 pr-11
                        font-mono text-[13px] text-white/90 placeholder:text-white/25
                        outline-none transition-all duration-200
                        hover:border-white/14
                        focus:border-(--brand)/60 focus:bg-white/3
                        focus:shadow-[0_0_0_3px_rgba(255,140,66,0.12)]
                      "
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-white/30 transition-colors hover:text-white/60"
                    >
                      <HugeiconsIcon
                        icon={showPassword ? ViewOffIcon : ViewIcon}
                        size={14}
                      />
                    </button>
                  </div>
                </div>

                <label
                  htmlFor={rememberId}
                  className="flex cursor-pointer items-center gap-2.5 font-mono text-[12px] text-white/55 select-none"
                >
                  <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                    <input
                      id={rememberId}
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span
                      className="
                        absolute inset-0 rounded border border-white/15 bg-white/2
                        transition-all duration-200
                        peer-checked:border-(--brand)/60 peer-checked:bg-(--brand)/15
                        peer-focus-visible:ring-2 peer-focus-visible:ring-(--brand)/40
                      "
                    />
                    {remember && (
                      <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        className="relative h-2.5 w-2.5 text-(--brand)"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 6.5L5 9L10 3.5"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span>Keep me signed in for 30 days</span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting || oauthLoading !== null}
                  className="
                    group/cta relative mt-1 flex w-full items-center justify-center gap-2
                    overflow-hidden rounded-lg
                    border border-(--brand)/50 bg-(--brand)/15
                    px-4 py-2.5
                    font-mono text-[13px] font-medium text-(--brand-hover)
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]
                    transition-all duration-200
                    hover:border-(--brand)/80 hover:bg-(--brand)/25
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand)/50
                    disabled:cursor-not-allowed disabled:opacity-60
                    active:scale-[0.99]
                  "
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/12 to-transparent transition-transform duration-700 group-hover/cta:translate-x-full" />
                  {isSubmitting ? (
                    <>
                      <HugeiconsIcon
                        icon={Loading03Icon}
                        size={14}
                        className="animate-spin"
                      />
                      <span>Signing you in…</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <HugeiconsIcon
                        icon={ArrowRight02Icon}
                        size={14}
                        className="transition-transform duration-200 group-hover/cta:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center font-mono text-[12px] leading-normal text-white/45">
                Don't have an account?{" "}
                <Link
                  to="/auth/register"
                  className="text-white/85 underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-(--brand) hover:decoration-(--brand)/60"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* OAUTH BUTTON */

function OAuthButton({
  provider,
  loading,
  disabled,
  onClick,
}: {
  provider: "google" | "github";
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const label = provider === "google" ? "Google" : "GitHub";
  const Logo = provider === "google" ? GoogleLogo : GithubLogo;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Continue with ${label}`}
      className="
        group/oauth relative flex items-center justify-center gap-2.5
        rounded-lg border border-white/10 bg-white/3
        px-4 py-2.5 font-mono text-[12px] text-white/80
        transition-all duration-200
        hover:border-white/20 hover:bg-white/5 hover:text-white
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand)/40
        disabled:cursor-not-allowed disabled:opacity-50
        active:scale-[0.99]
      "
    >
      {loading ? (
        <HugeiconsIcon
          icon={Loading03Icon}
          size={16}
          className="animate-spin"
        />
      ) : (
        <Logo className="h-4 w-4" />
      )}
      <span>{label}</span>
    </button>
  );
}

/* STAT BLOCK */

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/2 p-3">
      <div className="font-mono text-[15px] font-medium tracking-tight text-white">
        {value}
      </div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
        {label}
      </div>
    </div>
  );
}

/* LIVE BOARD PREVIEW */

function LiveBoardPreview() {
  const columns = [
    { title: "To do", count: 5, active: false },
    { title: "Doing", count: 3, active: true },
    { title: "Done", count: 12, active: false },
  ];

  return (
    <div className="mt-7 max-w-md">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#08080C] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        <div className="flex h-9 items-center justify-between border-b border-white/6 px-3.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-rose-500/70 bg-rose-500/10" />
            <span className="h-2 w-2 rounded-full border border-yellow-500/70 bg-yellow-500/10" />
            <span className="h-2 w-2 rounded-full border border-emerald-500/70 bg-emerald-500/10" />
          </div>
          <span className="font-mono text-[10px] text-white/40">sprint-04</span>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.15em] text-emerald-400">
            <span className="relative flex h-1 w-1">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1 w-1 rounded-full bg-emerald-400" />
            </span>
            5 online
          </span>
        </div>

        <div className="grid grid-cols-3 gap-px bg-white/4">
          {columns.map((col) => (
            <div key={col.title} className="bg-[#08080C] p-3">
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-1 w-1 rounded-full ${
                      col.active ? "bg-(--brand)" : "bg-white/20"
                    }`}
                  />
                  <span
                    className={`font-mono text-[9px] uppercase tracking-[0.18em] ${
                      col.active ? "text-(--brand)" : "text-white/40"
                    }`}
                  >
                    {col.title}
                  </span>
                </div>
                <span className="font-mono text-[8px] tabular-nums text-white/25">
                  {col.count}
                </span>
              </div>

              <div className="space-y-1.5">
                <PreviewCard active={col.active} />
                <PreviewCard />
                {col.active && <PreviewCard ghost />}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-white/6 px-3.5 py-2.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-(--brand) font-mono text-[7px] text-white">
            MA
          </span>
          <span className="truncate font-mono text-[10px] text-white/50">
            <span className="text-white/75">Maya</span> moved{" "}
            <span className="text-white/70">Auth flow</span> to Done
          </span>
          <span className="ml-auto shrink-0 font-mono text-[9px] text-white/30">
            just now
          </span>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ active, ghost }: { active?: boolean; ghost?: boolean }) {
  if (ghost) {
    return (
      <div className="flex h-9 items-center justify-center rounded border border-dashed border-(--brand)/30 bg-(--brand)/3">
        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-(--brand)/60">
          + card
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded border p-1.5 ${
        active
          ? "border-(--brand)/40 bg-(--brand)/6"
          : "border-white/6 bg-white/2"
      }`}
    >
      <div className="flex items-center gap-1">
        <span
          className={`h-1 w-1 rounded-full ${
            active ? "bg-(--brand)" : "bg-white/25"
          }`}
        />
        <span
          className={`h-1 rounded-full ${
            active ? "w-12 bg-(--brand)/50" : "w-10 bg-white/15"
          }`}
        />
      </div>
      <div className="mt-1.5 h-1 w-3/4 rounded-full bg-white/10" />
    </div>
  );
}
