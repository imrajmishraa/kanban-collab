import { useEffect, useId, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Loading03Icon,
  LockPasswordIcon,
  Mail01Icon,
  UserCircleIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";

import { useAuth } from "@/hooks/auth/useAuth";
import { ApiClientError } from "@/api/client";
import {
  registerSchema,
  type RegisterFormData,
} from "@/validations/auth/auth.validator";
import { OAuthButton } from "@components/ui/auth/OAuthButton";
import { LiveBoardPreview } from "#components/ui/auth/LiveBoardPreview";
import { StatBlock } from "#components/ui/auth/StatBlock";

interface RegisterLocationState {
  from?: { pathname?: string; search?: string; hash?: string };
}

function getPostRegisterDestination(state: unknown): string {
  if (!state || typeof state !== "object") return "/dashboard";
  const s = state as RegisterLocationState;
  if (!s.from?.pathname || !s.from.pathname.startsWith("/"))
    return "/dashboard";
  return `${s.from.pathname}${s.from.search ?? ""}${s.from.hash ?? ""}`;
}

function getRegisterErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    switch (err.code) {
      case "EMAIL_ALREADY_EXISTS":
        return "An account with this email already exists. Try signing in instead.";
      case "VALIDATION_FAILED": {
        const first = err.errors[0];
        return first?.message ?? "Please check the highlighted fields.";
      }
      case "RATE_LIMIT_SIGNUP":
        return "Too many accounts created from this network. Try again later.";
      case "NETWORK_ERROR":
        return "Can't reach the server. Check your connection and try again.";
      default:
        return err.message;
    }
  }
  return err instanceof Error
    ? err.message
    : "We couldn't create your account. Please try again.";
}

export default function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = getPostRegisterDestination(location.state);

  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmId = useId();
  const termsId = useId();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(
    null,
  );

  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Returning from an OAuth provider via the browser Back button restores this
  // page from the back/forward cache with `oauthLoading` still set, which would
  // leave the OAuth buttons (and the whole form) stuck in a loading state.
  // Clear it whenever the page is restored.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setOauthLoading(null);
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await register(values.fullName, values.email, values.password);
      // Auto-login — send the user straight in.
      await login(values.email, values.password, true);
      navigate(destination, { replace: true });
    } catch (err) {
      console.error("Sign up failed:", err);

      // Map server field errors onto the matching inputs.
      let hasFieldErrors = false;
      if (err instanceof ApiClientError) {
        for (const fieldError of err.errors) {
          const field = fieldError.field;
          if (
            field === "fullName" ||
            field === "email" ||
            field === "password"
          ) {
            setError(field, { type: "server", message: fieldError.message });
            hasFieldErrors = true;
          }
        }
      }

      // Only fall back to the summary banner when nothing mapped inline.
      if (!hasFieldErrors) {
        setError("root", { message: getRegisterErrorMessage(err) });
      }
    }
  });

  const handleOauth = (provider: "google" | "github") => {
    setOauthLoading(provider);
    // Register is OAuth-first — no rememberMe checkbox on this page,
    // default to true (30-day session).
    window.location.href = `/api/v1/auth/oauth/${provider}?rememberMe=true`;
  };

  return (
    <main className="relative h-full overflow-hidden text-(--text-primary)">
      {/* Classic ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-(--brand)/6 blur-[120px] transition-transform duration-[8s] ease-in-out" />
        <div className="absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-emerald-500/5 blur-[100px] transition-transform duration-[10s] ease-in-out" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative grid h-full lg:grid-cols-[1.15fr_1fr]">
        {/* LEFT — Advertisement panel */}
        <aside className="relative hidden overflow-hidden border-r border-white/8 lg:flex lg:flex-col">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.1) 0.8px, transparent 0.8px)",
              backgroundSize: "22px 22px",
              maskImage:
                "radial-gradient(ellipse 75% 65% at 30% 40%, #000 0%, transparent 80%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 75% 65% at 30% 40%, #000 0%, transparent 80%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-32 top-1/3 h-140 w-160 rounded-[50%] bg-(--brand)/7 blur-[150px]"
          />

          <div className="relative flex h-full flex-col p-8 xl:p-12">
            <div className="flex flex-1 flex-col justify-center">
              <div className="inline-flex items-center gap-2.5 self-start rounded-full border border-white/8 bg-white/3 px-3 py-1.5 backdrop-blur-xl">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
                  Free forever · No credit card
                </span>
              </div>

              <h1 className="mt-6 max-w-lg font-mono text-[1.85rem] font-normal leading-[1.1] tracking-[-0.03em] text-white xl:text-[2.25rem]">
                Start building
                <br />
                <span className="text-white/35">with your team.</span>
              </h1>

              <p className="mt-4 max-w-md font-mono text-[13px] leading-[1.75] text-white/50">
                Create your workspace in seconds. Invite your team, spin up your
                first board, and start shipping work — together.
              </p>

              <LiveBoardPreview />

              <ul className="mt-6 grid max-w-md grid-cols-3 gap-2.5">
                <StatBlock value="∞" label="Boards" />
                <StatBlock value="100%" label="Open source" />
                <StatBlock value="MIT" label="License" />
              </ul>
            </div>
          </div>
        </aside>

        {/* RIGHT — Register form */}
        <section className="relative flex h-full flex-col overflow-x-hidden overflow-y-auto">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-72 w-180 -translate-x-1/2 rounded-[50%] bg-(--brand)/4 blur-[120px]"
          />

          {/* Form container */}
          <div className="relative flex flex-1 items-center justify-center px-4 py-5 sm:px-6 lg:px-10">
            <div className="w-full max-w-95">
              <div>
                <h2 className="font-mono text-[1.5rem] font-normal leading-[1.15] tracking-[-0.02em] text-white sm:text-[1.65rem]">
                  Create your account
                </h2>
                <p className="mt-2 font-mono text-[12px] leading-[1.65] text-white/45">
                  Free forever. Start collaborating in seconds.
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

              {errors.root && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mb-4 flex items-start gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3.5 py-2.5"
                >
                  <span className="mt-1.25 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                  <p className="font-mono text-[12px] leading-[1.55] text-rose-200">
                    {errors.root.message}
                  </p>
                </div>
              )}

              <form onSubmit={onSubmit} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor={nameId}
                    className="block font-mono text-[11px] uppercase tracking-[0.18em] text-white/45"
                  >
                    Full name
                  </label>
                  <div className="group/input relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-white/30 transition-colors group-focus-within/input:text-(--brand)">
                      <HugeiconsIcon icon={UserCircleIcon} size={14} />
                    </span>
                    <input
                      id={nameId}
                      type="text"
                      autoComplete="name"
                      placeholder="Jane Cooper"
                      aria-invalid={errors.fullName ? "true" : "false"}
                      {...registerField("fullName")}
                      className={[
                        "w-full rounded-lg border bg-white/2",
                        "py-2.5 pl-10 pr-3.5",
                        "font-mono text-[13px] text-white/90 placeholder:text-white/25",
                        "outline-none transition-all duration-200",
                        errors.fullName
                          ? "border-rose-500/50 focus:border-rose-500/70"
                          : "border-white/10 hover:border-white/14 focus:border-(--brand)/60 focus:bg-white/3",
                        "focus:shadow-[0_0_0_3px_rgba(255,140,66,0.12)]",
                      ].join(" ")}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="font-mono text-[11px] leading-normal text-rose-400">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

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
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      aria-invalid={errors.email ? "true" : "false"}
                      {...registerField("email")}
                      className={[
                        "w-full rounded-lg border bg-white/2",
                        "py-2.5 pl-10 pr-3.5",
                        "font-mono text-[13px] text-white/90 placeholder:text-white/25",
                        "outline-none transition-all duration-200",
                        errors.email
                          ? "border-rose-500/50 focus:border-rose-500/70"
                          : "border-white/10 hover:border-white/14 focus:border-(--brand)/60 focus:bg-white/3",
                        "focus:shadow-[0_0_0_3px_rgba(255,140,66,0.12)]",
                      ].join(" ")}
                    />
                  </div>
                  {errors.email && (
                    <p className="font-mono text-[11px] leading-normal text-rose-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor={passwordId}
                    className="block font-mono text-[11px] uppercase tracking-[0.18em] text-white/45"
                  >
                    Password
                  </label>
                  <div className="group/input relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-white/30 transition-colors group-focus-within/input:text-(--brand)">
                      <HugeiconsIcon icon={LockPasswordIcon} size={14} />
                    </span>
                    <input
                      id={passwordId}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      aria-invalid={errors.password ? "true" : "false"}
                      {...registerField("password")}
                      className={[
                        "w-full rounded-lg border bg-white/2",
                        "py-2.5 pl-10 pr-11",
                        "font-mono text-[13px] text-white/90 placeholder:text-white/25",
                        "outline-none transition-all duration-200",
                        errors.password
                          ? "border-rose-500/50 focus:border-rose-500/70"
                          : "border-white/10 hover:border-white/14 focus:border-(--brand)/60 focus:bg-white/3",
                        "focus:shadow-[0_0_0_3px_rgba(255,140,66,0.12)]",
                      ].join(" ")}
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
                  {errors.password ? (
                    <p className="font-mono text-[11px] leading-normal text-rose-400">
                      {errors.password.message}
                    </p>
                  ) : (
                    <p className="font-mono text-[10px] leading-normal text-white/30">
                      Use 8+ characters with a mix of letters and numbers.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor={confirmId}
                    className="block font-mono text-[11px] uppercase tracking-[0.18em] text-white/45"
                  >
                    Confirm password
                  </label>
                  <div className="group/input relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-white/30 transition-colors group-focus-within/input:text-(--brand)">
                      <HugeiconsIcon icon={LockPasswordIcon} size={14} />
                    </span>
                    <input
                      id={confirmId}
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      aria-invalid={errors.confirmPassword ? "true" : "false"}
                      {...registerField("confirmPassword")}
                      className={[
                        "w-full rounded-lg border bg-white/2",
                        "py-2.5 pl-10 pr-11",
                        "font-mono text-[13px] text-white/90 placeholder:text-white/25",
                        "outline-none transition-all duration-200",
                        errors.confirmPassword
                          ? "border-rose-500/50 focus:border-rose-500/70"
                          : "border-white/10 hover:border-white/14 focus:border-(--brand)/60 focus:bg-white/3",
                        "focus:shadow-[0_0_0_3px_rgba(255,140,66,0.12)]",
                      ].join(" ")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-white/30 transition-colors hover:text-white/60"
                    >
                      <HugeiconsIcon
                        icon={showConfirmPassword ? ViewOffIcon : ViewIcon}
                        size={14}
                      />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="font-mono text-[11px] leading-normal text-rose-400">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <label
                  htmlFor={termsId}
                  className="flex cursor-pointer items-start gap-2.5 font-mono text-[11px] leading-normal text-white/55 select-none"
                >
                  <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                    <input
                      id={termsId}
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
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
                    {agreeToTerms && (
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
                  <span>
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-white/85 underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-(--brand) hover:decoration-(--brand)/60"
                    >
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-white/85 underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-(--brand) hover:decoration-(--brand)/60"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={
                    isSubmitting || oauthLoading !== null || !agreeToTerms
                  }
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
                      <span>Creating your account…</span>
                    </>
                  ) : (
                    <>
                      <span>Create account</span>
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
                Already have an account?{" "}
                <Link
                  to="/auth/login"
                  className="text-white/85 underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-(--brand) hover:decoration-(--brand)/60"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
