import {
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight02Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  Mail01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";

import { toastError } from "@/lib/toast";
import { FieldError } from "../FieldError";
import { CLEAR, FIELD, MARK, PAD } from "../fieldChrome";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "../../validations/auth.validator";

type Step = "email" | "code" | "sent";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 30;

/**
 * Stand-in for the two endpoints the server has not implemented yet.
 *
 * `/api/v1/auth/forgot-password` and `/api/v1/auth/reset-password` appear in
 * `csrf.middleware.ts` and in the rate-limit table, and nowhere else — there is
 * no handler behind either. So these three waits are the whole of the network
 * story, exactly as they were on the old page. When the routes land, each
 * `await pause(...)` becomes one `apiClient.post`.
 */
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** The six boxes, in the card's language rather than the old mono-glow one. */
const BOX = [
  "h-12 w-11 rounded-xl border text-center sm:h-13 sm:w-12",
  "text-[17px] font-medium text-(--text-primary)",
  "outline-hidden transition-[color,background-color,border-color,box-shadow] duration-200",
  "hover:border-(--hairline-strong)",
  "focus:border-(--brand) focus:bg-(--tint-4)",
  "focus:ring-2 focus:ring-(--brand)/25",
].join(" ");

/** One row of small print under the column — the card's bottom anchor. */
function Footer({ children }: { children: ReactNode }) {
  return (
    <p className="mt-8 text-center text-[12.5px] leading-[1.65] text-(--text-subtle)">
      {children}
    </p>
  );
}

/** The link that goes back a step, styled like the register column's. */
function BackLink({
  onClick,
  to,
  children,
}: {
  onClick?: () => void;
  to?: string;
  children: ReactNode;
}) {
  const className =
    "flex items-center gap-1.5 self-start rounded-lg py-1.5 text-[13px] font-medium text-(--text-muted) transition-colors duration-150 hover:text-(--text-primary) focus-visible:ring-2 focus-visible:ring-(--brand)/40 focus-visible:outline-hidden";

  return to ? (
    <Link to={to} className={className}>
      <HugeiconsIcon icon={ArrowLeft01Icon} size={15} strokeWidth={2.2} />
      {children}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      <HugeiconsIcon icon={ArrowLeft01Icon} size={15} strokeWidth={2.2} />
      {children}
    </button>
  );
}

/**
 * The reset column: ask for the email, take the six-digit code, confirm.
 *
 * Three steps of one column, the same as the sign-up card — nothing is
 * unmounted in between, so the address typed in step one is still there if you
 * go back to it. The code boxes keep the behaviour the old page had: one digit
 * per box, arrows and backspace walk the row, a pasted code fills all six, and
 * the sixth digit submits on its own after a beat.
 */
export function ForgotPasswordForm() {
  const emailId = useId();
  const emailErrorId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [step, setStep] = useState<Step>("email");
  const [code, setCode] = useState<string[]>(() => Array(CODE_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register: registerField,
    handleSubmit,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    /* Submit-time, like the other two forms: nothing is checked until the
       button has been pressed once. */
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: { email: "" },
  });

  const emailField = registerField("email");

  const filled = code.filter(Boolean).length;
  const isCodeComplete = filled === CODE_LENGTH;

  /* ── Step 1: ask for the code ───────────────────────────── */
  const handleSendCode = handleSubmit(async (values) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await pause(800);
      setSentEmail(values.email);
      setStep("code");
      setCooldown(RESEND_COOLDOWN);
    } catch {
      toastError(null, "We couldn't send the code. Try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  });

  /* ── Step 2: check the code ─────────────────────────────── */
  const handleVerify = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!isCodeComplete || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await pause(800);
      setStep("sent");
    } catch {
      toastError(null, "That code didn't match. Check it and try again.");
      setCode(Array(CODE_LENGTH).fill(""));
      requestAnimationFrame(() => codeRefs.current[0]?.focus());
    } finally {
      setIsSubmitting(false);
    }
  };

  /* The sixth digit submits on its own, after long enough for the last key to
     land in its box first. */
  useEffect(() => {
    if (step !== "code" || !isCodeComplete || isSubmitting) return;
    const timer = setTimeout(() => formRef.current?.requestSubmit(), 280);
    return () => clearTimeout(timer);
  }, [isCodeComplete, step, isSubmitting]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (step !== "code") return;
    const timer = setTimeout(() => codeRefs.current[0]?.focus(), 50);
    return () => clearTimeout(timer);
  }, [step]);

  /* ── The code row ───────────────────────────────────────── */
  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < CODE_LENGTH - 1) codeRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace") {
      if (!code[index] && index > 0) {
        const previous = [...code];
        previous[index - 1] = "";
        setCode(previous);
        codeRefs.current[index - 1]?.focus();
      } else if (code[index]) {
        const next = [...code];
        next[index] = "";
        setCode(next);
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      codeRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      event.preventDefault();
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    if (!pasted) return;

    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i];
    setCode(next);

    codeRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  };

  const handleResend = async () => {
    if (cooldown > 0 || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await pause(600);
      setCooldown(RESEND_COOLDOWN);
      setCode(Array(CODE_LENGTH).fill(""));
      requestAnimationFrame(() => codeRefs.current[0]?.focus());
    } catch {
      toastError(null, "We couldn't resend the code. Try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeEmail = () => {
    setStep("email");
    setCode(Array(CODE_LENGTH).fill(""));
    setCooldown(0);
  };

  /* ── Step 1 ─────────────────────────────────────────────── */
  if (step === "email") {
    return (
      <div className="mx-auto flex w-full max-w-105 flex-col">
        <BackLink to="/auth/login">Back to log in</BackLink>

        <h2 className="mt-3 text-[26px] leading-[1.15] font-semibold tracking-[-0.7px] text-(--text-primary) sm:text-[28px]">
          Forgot your password?
        </h2>
        <p className="mt-2.5 text-[13.5px] leading-[1.6] text-(--text-secondary)">
          Enter the email on your account and we'll send you a six-digit code.
        </p>

        <form
          onSubmit={handleSendCode}
          noValidate
          className="mt-6 flex flex-col"
        >
          {/* `pb-10` is the slot the error bubble lands in, so it cannot cover
              the button below — see RegisterForm for the same reasoning. */}
          <div className="pb-10">
            <label htmlFor={emailId} className="sr-only">
              Email address
            </label>

            <div className="relative">
              <input
                id={emailId}
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="Email address"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? emailErrorId : undefined}
                {...emailField}
                onChange={(event) => {
                  emailField.onChange(event);
                  if (errors.email) clearErrors("email");
                }}
                className={[
                  FIELD,
                  "peer",
                  PAD,
                  "pr-11",
                  errors.email ? "border-(--danger)" : "border-(--hairline)",
                ].join(" ")}
              />

              <span className={MARK} aria-hidden="true">
                <HugeiconsIcon icon={Mail01Icon} size={16} strokeWidth={1.8} />
              </span>

              <button
                type="button"
                onClick={() => {
                  setValue("email", "", { shouldValidate: false });
                  clearErrors("email");
                  document.getElementById(emailId)?.focus();
                }}
                aria-label="Clear email address"
                className={[CLEAR, "right-3"].join(" ")}
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={13}
                  strokeWidth={2.4}
                />
              </button>

              {errors.email && (
                <FieldError
                  id={emailErrorId}
                  message={errors.email.message}
                  onDismiss={() => clearErrors("email")}
                  width={300}
                  size="sm"
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--brand) text-[15px] font-semibold text-(--solid-text) transition-colors duration-150 hover:bg-(--brand-hover) focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-surface) focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  size={16}
                  className="animate-spin motion-reduce:animate-none"
                />
                Sending the code…
              </>
            ) : (
              "Send code"
            )}
          </button>
        </form>

        <Footer>
          New to Kanban?{" "}
          <Link
            to="/auth/register"
            className="text-(--text-secondary) underline-offset-4 transition-colors duration-150 hover:text-(--text-primary) hover:underline"
          >
            Create an account
          </Link>
        </Footer>
      </div>
    );
  }

  /* ── Step 2 ─────────────────────────────────────────────── */
  if (step === "code") {
    return (
      <div className="mx-auto flex w-full max-w-105 flex-col">
        <BackLink onClick={handleChangeEmail}>Use a different email</BackLink>

        <h2 className="mt-3 text-[26px] leading-[1.15] font-semibold tracking-[-0.7px] text-(--text-primary) sm:text-[28px]">
          Enter the code
        </h2>
        <p className="mt-2.5 text-[13.5px] leading-[1.6] text-(--text-secondary)">
          We sent a six-digit code to{" "}
          <span className="break-all text-(--text-primary)">{sentEmail}</span>.
        </p>

        <form ref={formRef} onSubmit={handleVerify} noValidate className="mt-7">
          <div className="flex items-center justify-between gap-2 sm:gap-2.5">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  codeRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                onFocus={(event) => event.target.select()}
                aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
                className={[
                  BOX,
                  digit
                    ? "border-(--brand) bg-(--brand)/10"
                    : "border-(--hairline) bg-(--tint-2)",
                ].join(" ")}
              />
            ))}
          </div>

          {/* A quiet progress line instead of a bar: the boxes already show how
              far along you are, so this only has to be readable at a glance. */}
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-[11px] text-(--text-subtle)">
              {filled}/{CODE_LENGTH} digits
            </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isSubmitting}
              className="group inline-flex items-center gap-1.5 rounded-lg text-[12.5px] font-medium text-(--text-muted) transition-colors duration-150 hover:text-(--brand) focus-visible:ring-2 focus-visible:ring-(--brand)/40 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-(--text-muted)"
            >
              <HugeiconsIcon
                icon={RefreshIcon}
                size={13}
                className="transition-transform duration-300 group-enabled:group-hover:rotate-180 motion-reduce:transition-none"
              />
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isCodeComplete}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--brand) text-[15px] font-semibold text-(--solid-text) transition-colors duration-150 hover:bg-(--brand-hover) focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-surface) focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  size={16}
                  className="animate-spin motion-reduce:animate-none"
                />
                Checking the code…
              </>
            ) : (
              "Verify code"
            )}
          </button>
        </form>

        <Footer>Nothing arriving? Check spam before resending.</Footer>
      </div>
    );
  }

  /* ── Step 3 ─────────────────────────────────────────────── */
  return (
    <div className="mx-auto flex w-full max-w-105 flex-col items-center text-center">
      <span className="flex size-16 items-center justify-center rounded-full border border-(--success)/35 bg-(--success)/10 text-(--success)">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={28} />
      </span>

      <h2 className="mt-6 text-[26px] leading-[1.15] font-semibold tracking-[-0.7px] text-(--text-primary) sm:text-[28px]">
        Check your inbox
      </h2>
      <p className="mt-2.5 max-w-80 text-[13.5px] leading-[1.6] text-(--text-secondary)">
        A reset link is on its way to{" "}
        <span className="break-all text-(--text-primary)">{sentEmail}</span>. It
        expires in 60 minutes.
      </p>

      <a
        href="https://mail.google.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--brand) text-[15px] font-semibold text-(--solid-text) transition-colors duration-150 hover:bg-(--brand-hover) focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-surface) focus-visible:outline-hidden"
      >
        Open Gmail
        <HugeiconsIcon icon={ArrowRight02Icon} size={16} strokeWidth={2.2} />
      </a>

      <Footer>
        <Link
          to="/auth/login"
          className="text-(--text-secondary) underline-offset-4 transition-colors duration-150 hover:text-(--text-primary) hover:underline"
        >
          Back to log in
        </Link>
      </Footer>
    </div>
  );
}
