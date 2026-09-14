import {
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
  Home01Icon,
  Loading03Icon,
  Mail01Icon,
  RefreshIcon,
  SecurityCheckIcon,
  UserAdd01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";

type Step = "email" | "code" | "sent";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 30;

/* PAGE */
export default function ForgotPasswordPage() {
  const emailId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(() => Array(CODE_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const filled = code.filter(Boolean).length;
  const isCodeComplete = filled === CODE_LENGTH;

  /* ── Send code ─────────────────────────────────────────── */
  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !email.trim()) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await new Promise((r) => setTimeout(r, 800));
      setStep("code");
      setCooldown(RESEND_COOLDOWN);
      requestAnimationFrame(() => {
        setTimeout(() => codeRefs.current[0]?.focus(), 50);
      });
    } catch {
      setError("Couldn't send the code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Verify code ───────────────────────────────────────── */
  const handleVerify = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!isCodeComplete || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await new Promise((r) => setTimeout(r, 800));
      setStep("sent");
    } catch {
      setError("Wrong code. Please try again.");
      setCode(Array(CODE_LENGTH).fill(""));
      requestAnimationFrame(() => {
        codeRefs.current[0]?.focus();
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Auto-submit when 6 digits entered ─────────────────── */
  useEffect(() => {
    if (step !== "code" || !isCodeComplete || isSubmitting) return;
    const t = setTimeout(() => formRef.current?.requestSubmit(), 280);
    return () => clearTimeout(t);
  }, [isCodeComplete, step, isSubmitting]);

  /* ── Resend cooldown tick ──────────────────────────────── */
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  /* ── OTP handlers ──────────────────────────────────────── */
  const handleChange = (i: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    setError(null);

    if (digit && i < CODE_LENGTH - 1) {
      codeRefs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!code[i] && i > 0) {
        const prev = [...code];
        prev[i - 1] = "";
        setCode(prev);
        codeRefs.current[i - 1]?.focus();
      } else if (code[i]) {
        const next = [...code];
        next[i] = "";
        setCode(next);
      }
    }

    if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      codeRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowRight" && i < CODE_LENGTH - 1) {
      e.preventDefault();
      codeRefs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    if (!pasted) return;

    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setCode(next);
    setError(null);

    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    codeRefs.current[focusIndex]?.focus();
  };

  const handleResend = async () => {
    if (cooldown > 0 || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await new Promise((r) => setTimeout(r, 600));
      setCooldown(RESEND_COOLDOWN);
      setCode(Array(CODE_LENGTH).fill(""));
      requestAnimationFrame(() => {
        codeRefs.current[0]?.focus();
      });
    } catch {
      setError("Couldn't resend the code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeEmail = () => {
    setCode(Array(CODE_LENGTH).fill(""));
    setError(null);
    setStep("email");
  };

  return (
    <main className="relative h-screen overflow-hidden bg-[#050506] text-(--text-primary)">
      <div className="grid h-full lg:grid-cols-[1.15fr_1fr]">
        {/* ═══════════════════════════════════════════════════════
            LEFT — Advertisement panel with starfield background
            ═══════════════════════════════════════════════════════ */}
        <aside className="relative hidden overflow-hidden bg-[#050506] lg:flex lg:flex-col">
          {/* Top cap */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-150 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.025),transparent_70%)]"
          />

          {/* Primary warm glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 -top-130 h-205 w-350 -translate-x-1/2 rounded-[50%] bg-(--brand)/12 blur-[160px]"
          />

          {/* Cool counter-glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-90 h-105 w-195 -translate-x-1/2 rounded-[50%] bg-white/2 blur-[130px]"
          />

          {/* STARFIELD — four dot layers */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.35) 0.6px, transparent 0.6px)",
              backgroundSize: "28px 28px",
              maskImage:
                "radial-gradient(ellipse 80% 60% at 50% 15%, #000 0%, transparent 85%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 80% 60% at 50% 15%, #000 0%, transparent 85%)",
            }}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.5) 0.8px, transparent 0.8px)",
              backgroundSize: "44px 44px",
              backgroundPosition: "12px 18px",
              maskImage:
                "radial-gradient(ellipse 75% 55% at 50% 18%, #000 0%, transparent 82%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 75% 55% at 50% 18%, #000 0%, transparent 82%)",
            }}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--brand) 1px, transparent 1px)",
              backgroundSize: "110px 110px",
              backgroundPosition: "30px 40px",
              maskImage:
                "radial-gradient(ellipse 70% 50% at 50% 15%, #000 0%, transparent 80%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 70% 50% at 50% 15%, #000 0%, transparent 80%)",
            }}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.7) 1.2px, transparent 1.2px)",
              backgroundSize: "180px 180px",
              backgroundPosition: "60px 90px",
              maskImage:
                "radial-gradient(ellipse 65% 45% at 50% 18%, #000 0%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 65% 45% at 50% 18%, #000 0%, transparent 75%)",
            }}
          />

          {/* Content */}
          <div className="relative flex h-full flex-col p-10 xl:p-14">
            <div className="flex flex-1 flex-col justify-center py-8 xl:py-10">
              <div className="inline-flex items-center gap-2.5 self-start rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 backdrop-blur-xl">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/80 opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
                  Secure account recovery
                </span>
              </div>

              <h1 className="mt-8 max-w-lg font-mono text-[2.05rem] font-normal leading-[1.06] tracking-[-0.035em] text-white xl:text-[2.55rem]">
                Locked out?
                <br />
                <span className="text-white/30">We'll get you back in.</span>
              </h1>

              <p className="mt-5 max-w-md font-mono text-[13px] leading-[1.8] text-white/45">
                Enter the email tied to your account and we'll send a 6-digit
                code to verify it's really you.
              </p>

              <SecurityIllustration />

              <ul className="mt-8 grid max-w-md grid-cols-3 gap-3">
                <StatBlock value="60s" label="Link expiry" />
                <StatBlock value="24/7" label="Support" />
                <StatBlock value="TLS" label="Encrypted" />
              </ul>
            </div>
          </div>
        </aside>

        {/* ═══════════════════════════════════════════════════════
            RIGHT — Form panel
            Has its own 1px left border (only on desktop where the
            aside is visible)
            ═══════════════════════════════════════════════════════ */}
        <section className="relative flex h-full flex-col overflow-x-hidden overflow-y-auto border-l border-white/8 bg-[#050506] lg:border-white/8 max-lg:border-l-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-96 w-2xl -translate-x-1/2 rounded-[50%] bg-(--brand)/4.5 blur-[150px]"
          />

          {/* Mobile brand */}
          <div className="relative flex items-center justify-center px-4 pt-8 lg:hidden">
            <Link
              to="/"
              className="group inline-flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-90"
            >
              <img
                src="/appIcon.png"
                alt=""
                width={26}
                height={26}
                draggable={false}
                className="h-6.5 w-6.5 rounded-lg border border-white/10 object-cover"
              />
              <span className="font-mono text-[15px] font-bold tracking-tight text-white">
                Kanban Collab
              </span>
            </Link>
          </div>

          {/* Form container */}
          <div className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            <div className="w-full max-w-90">
              {/* ── Step 1: Email ──────────────────────────── */}
              {step === "email" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h2 className="font-mono text-[1.55rem] font-normal leading-[1.12] tracking-normal text-white sm:text-[1.7rem]">
                      Reset your password
                    </h2>
                    <p className="mt-2.5 font-mono text-[12.5px] leading-[1.65] text-white/40">
                      We'll send a 6-digit code to your email.
                    </p>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className="mt-5 flex items-start gap-3 rounded-xl border border-rose-500/25 bg-rose-500/7 px-3.5 py-3"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                      <p className="font-mono text-[12.5px] leading-normal text-rose-100/90">
                        {error}
                      </p>
                    </div>
                  )}

                  <form
                    onSubmit={handleSendCode}
                    noValidate
                    className="mt-7 space-y-5"
                  >
                    <div className="space-y-2">
                      <label
                        htmlFor={emailId}
                        className="block font-mono text-[11px] uppercase tracking-[0.18em] text-white/40"
                      >
                        Email address
                      </label>
                      <div className="group/input relative">
                        <span className="pointer-events-none absolute left-3.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-white/25 transition-colors duration-200 group-focus-within/input:text-(--brand)">
                          <HugeiconsIcon icon={Mail01Icon} size={15} />
                        </span>
                        <input
                          id={emailId}
                          type="email"
                          name="email"
                          autoComplete="email"
                          inputMode="email"
                          required
                          autoFocus
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError(null);
                          }}
                          placeholder="you@example.com"
                          className="
                            w-full rounded-xl border border-white/9 bg-white/2.5
                            py-3 pl-11 pr-4
                            font-mono text-[13.5px] text-white/90 placeholder:text-white/22
                            outline-none transition-all duration-200
                            hover:border-white/14 hover:bg-white/3.5
                            focus:border-(--brand)/55 focus:bg-white/4
                            focus:shadow-[0_0_0_3px_rgba(255,140,66,0.13)]
                          "
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !email.trim()}
                      className="
                        relative mt-1 flex w-full cursor-pointer items-center justify-center gap-2.5
                        rounded-xl
                        border border-(--brand)/45 bg-(--brand)/14
                        px-4 py-3
                        font-mono text-[13.5px] font-medium text-(--brand-hover)
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]
                        transition-all duration-200
                        hover:border-(--brand)/75 hover:bg-(--brand)/22
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand)/45
                        disabled:cursor-not-allowed disabled:opacity-50
                        active:scale-[0.985]
                      "
                    >
                      {isSubmitting ? (
                        <>
                          <HugeiconsIcon
                            icon={Loading03Icon}
                            size={15}
                            className="animate-spin"
                          />
                          <span>Sending code…</span>
                        </>
                      ) : (
                        <>
                          <span>Send verification code</span>
                          <HugeiconsIcon
                            icon={ArrowRight02Icon}
                            size={15}
                            className="transition-transform duration-200 hover:translate-x-0.5"
                          />
                        </>
                      )}
                    </button>
                  </form>

                  <AuthNavLinks />
                </div>
              )}

              {/* ── Step 2: Code ───────────────────────────── */}
              {step === "code" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-(--brand)/35 bg-(--brand)/12 text-(--brand) shadow-[0_0_24px_-6px_rgba(255,140,66,0.35)]">
                      <HugeiconsIcon icon={SecurityCheckIcon} size={19} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                        Verification
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[12.5px] text-white/70">
                        Code sent to{" "}
                        <span className="text-white/90">{email}</span>
                      </span>
                    </div>
                  </div>

                  <h2 className="mt-6 font-mono text-[1.55rem] font-normal leading-[1.12] tracking-tight text-white sm:text-[1.7rem]">
                    Enter the code
                  </h2>
                  <p className="mt-2.5 font-mono text-[12.5px] leading-[1.65] text-white/40">
                    Type the 6-digit code from your email.
                  </p>

                  {error && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className="mt-5 flex items-start gap-3 rounded-xl border border-rose-500/25 bg-rose-500/7 px-3.5 py-3"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                      <p className="font-mono text-[12.5px] leading-normal text-rose-100/90">
                        {error}
                      </p>
                    </div>
                  )}

                  <form
                    ref={formRef}
                    onSubmit={handleVerify}
                    noValidate
                    className="mt-7"
                  >
                    <div className="flex items-center justify-between gap-2 sm:gap-2.5">
                      {code.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            codeRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleChange(i, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(i, e)}
                          onPaste={handlePaste}
                          onFocus={(e) => e.target.select()}
                          aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
                          className={`
                            h-12 w-11 sm:h-13 sm:w-12
                            rounded-xl border bg-white/2.5 text-center
                            font-mono text-[17px] font-medium text-white
                            outline-none transition-all duration-200
                            ${
                              digit
                                ? "border-(--brand)/55 bg-(--brand)/9 shadow-[0_0_0_1px_rgba(255,140,66,0.15)]"
                                : "border-white/9"
                            }
                            hover:border-white/16
                            focus:border-(--brand)/60 focus:bg-white/4
                            focus:shadow-[0_0_0_3px_rgba(255,140,66,0.14)]
                          `}
                        />
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-16 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-(--brand)/70 transition-all duration-300 ease-out"
                            style={{
                              width: `${(filled / CODE_LENGTH) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-white/35">
                          {filled}/{CODE_LENGTH}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleChangeEmail}
                        className="cursor-pointer font-mono text-[12px] text-white/40 transition-colors duration-200 hover:text-(--brand)"
                      >
                        Change email
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !isCodeComplete}
                      className="
                        relative mt-6 flex w-full cursor-pointer items-center justify-center gap-2.5
                        rounded-xl
                        border border-(--brand)/45 bg-(--brand)/14
                        px-4 py-3
                        font-mono text-[13.5px] font-medium text-(--brand-hover)
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]
                        transition-all duration-200
                        hover:border-(--brand)/75 hover:bg-(--brand)/22
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand)/45
                        disabled:cursor-not-allowed disabled:opacity-50
                        active:scale-[0.985]
                      "
                    >
                      {isSubmitting ? (
                        <>
                          <HugeiconsIcon
                            icon={Loading03Icon}
                            size={15}
                            className="animate-spin"
                          />
                          <span>Verifying…</span>
                        </>
                      ) : (
                        <>
                          <span>Verify &amp; send reset link</span>
                          <HugeiconsIcon
                            icon={ArrowRight02Icon}
                            size={15}
                            className="transition-transform duration-200 hover:translate-x-0.5"
                          />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-5 flex justify-center">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={cooldown > 0 || isSubmitting}
                      className="group inline-flex cursor-pointer items-center gap-2 font-mono text-[12.5px] text-white/40 transition-colors duration-200 hover:text-(--brand) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-white/40"
                    >
                      <HugeiconsIcon
                        icon={RefreshIcon}
                        size={13}
                        className="transition-transform duration-300 group-enabled:group-hover:rotate-180"
                      />
                      <span>
                        {cooldown > 0
                          ? `Resend in ${cooldown}s`
                          : "Didn't get it? Resend code"}
                      </span>
                    </button>
                  </div>

                  <AuthNavLinks />
                </div>
              )}

              {/* ── Step 3: Sent ───────────────────────────── */}
              {step === "sent" && (
                <div className="animate-in fade-in zoom-in-95 duration-500 text-center">
                  <div className="relative mx-auto flex h-18 w-18 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full border border-emerald-400/20" />
                    <span className="absolute inset-1 rounded-full bg-emerald-400/5" />
                    <span className="relative flex h-18 w-18 items-center justify-center rounded-full border border-emerald-400/35 bg-emerald-400/9 text-emerald-400 shadow-[0_0_48px_-10px_rgba(52,211,153,0.55)]">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={30} />
                    </span>
                  </div>

                  <h2 className="mt-7 font-mono text-[1.55rem] font-normal leading-[1.12] tracking-tight text-white sm:text-[1.7rem]">
                    Reset link sent
                  </h2>

                  <p className="mx-auto mt-3.5 max-w-72 font-mono text-[13px] leading-[1.7] text-white/50">
                    We sent a password reset link to{" "}
                    <span className="text-white/85">{email}</span>. It expires
                    in 60 minutes.
                  </p>

                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      relative mt-7 flex w-full cursor-pointer items-center justify-center gap-2.5
                      rounded-xl
                      border border-(--brand)/45 bg-(--brand)/14
                      px-4 py-3
                      font-mono text-[13.5px] font-medium text-(--brand-hover)
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]
                      transition-all duration-200
                      hover:border-(--brand)/75 hover:bg-(--brand)/22
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand)/45
                      active:scale-[0.985]
                    "
                  >
                    <HugeiconsIcon icon={Mail01Icon} size={15} />
                    <span>Open Gmail</span>
                    <HugeiconsIcon
                      icon={ArrowRight02Icon}
                      size={15}
                      className="transition-transform duration-200 hover:translate-x-0.5"
                    />
                  </a>

                  <AuthNavLinks />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AUTH NAV LINKS — Home · Login · Register
   ═══════════════════════════════════════════════════════════════ */
function AuthNavLinks() {
  const links = [
    { to: "/", label: "Home", icon: Home01Icon },
    { to: "/auth/login", label: "Login", icon: UserCircleIcon },
    { to: "/auth/register", label: "Register", icon: UserAdd01Icon },
  ];

  return (
    <div className="mt-7 flex items-center justify-center gap-5">
      {links.map(({ to, label, icon }) => (
        <Link
          key={label}
          to={to}
          className="group inline-flex cursor-pointer items-center gap-1.5 font-mono text-[12.5px] text-white/40 transition-colors duration-200 hover:text-(--brand)"
        >
          <HugeiconsIcon
            icon={icon}
            size={12}
            className="transition-transform duration-200 group-hover:scale-110"
          />
          <span>{label}</span>
        </Link>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECURITY ILLUSTRATION
   ═══════════════════════════════════════════════════════════════ */
function SecurityIllustration() {
  return (
    <div className="relative mt-9 max-w-md">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-8 -inset-y-6 rounded-[50%] bg-(--brand)/8 blur-[90px]"
      />

      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#08080C]/80 backdrop-blur-xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.08) 0.8px, transparent 0.8px)",
            backgroundSize: "20px 20px",
            maskImage:
              "radial-gradient(ellipse 75% 75% at 50% 45%, #000 0%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 75% at 50% 45%, #000 0%, transparent 85%)",
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent"
        />

        <div className="relative flex flex-col items-center px-6 py-7">
          <svg viewBox="0 0 160 120" className="h-24 w-auto" aria-hidden="true">
            <circle
              cx="80"
              cy="60"
              r="52"
              stroke="rgba(255,140,66,0.08)"
              strokeWidth="0.75"
              fill="none"
            />
            <circle
              cx="80"
              cy="60"
              r="40"
              stroke="rgba(255,140,66,0.12)"
              strokeWidth="0.75"
              fill="none"
              strokeDasharray="2 4"
            />

            <rect
              x="35"
              y="35"
              width="90"
              height="58"
              rx="5"
              fill="rgba(255,255,255,0.03)"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.25"
            />
            <path
              d="M 35 40 L 80 68 L 125 40"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.25"
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            <g transform="translate(80 78)">
              <circle cx="0" cy="0" r="18" fill="#08080C" />
              <circle
                cx="0"
                cy="0"
                r="18"
                stroke="var(--brand)"
                strokeWidth="1.5"
                fill="none"
              />
              <circle
                cx="0"
                cy="0"
                r="14"
                stroke="rgba(255,140,66,0.3)"
                strokeWidth="0.75"
                fill="none"
              />
              <rect
                x="-6"
                y="-2"
                width="12"
                height="10"
                rx="1.5"
                fill="var(--brand)"
                fillOpacity="0.9"
              />
              <path
                d="M -3.5 -2 V -5 C -3.5 -7 0 -7 0 -7 C 0 -7 3.5 -7 3.5 -5 V -2"
                stroke="var(--brand)"
                strokeWidth="1.75"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="0" cy="2" r="1" fill="#08080C" />
            </g>
          </svg>

          <div className="mt-3 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
              End-to-end encrypted
            </p>
            <p className="mt-1.5 font-mono text-[11.5px] leading-relaxed text-white/30">
              Your reset link travels over TLS 1.3
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAT BLOCK
   ═══════════════════════════════════════════════════════════════ */
function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/7 bg-white/2.5 p-3.5 backdrop-blur-sm transition-colors duration-200 hover:border-white/12">
      <div className="font-mono text-[15px] font-medium tracking-tight text-white">
        {value}
      </div>
      <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/35">
        {label}
      </div>
    </div>
  );
}
