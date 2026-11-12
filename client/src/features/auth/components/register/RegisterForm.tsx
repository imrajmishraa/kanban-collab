import { useId, useState, type ChangeEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight02Icon,
  Cancel01Icon,
  Loading03Icon,
  LockPasswordIcon,
  Mail01Icon,
  UserCircleIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";

import { useAuth } from "@/hooks/useAuth";
import { toastError, toastSuccess } from "@/lib/toast";
import { ApiClientError } from "@/services/client";
import { FieldError } from "../FieldError";
import { OAuthButton } from "../OAuthButton";
import { CLEAR, FIELD, MARK, PAD } from "../fieldChrome";
import { useUnifiedOAuth } from "../../hooks/useUnifiedOAuth";
import { postLoginDestination } from "../../utils/postLoginDestination";
import {
  PASSWORD_MIN,
  registerSchema,
  type RegisterFormData,
} from "../../validations/auth.validator";

/* Same shape as `loginErrorMessage`: the server's own words can name a
   collection or describe the failing rule, so the client says it instead. */
function registerErrorMessage(err: unknown): string {
  if (!(err instanceof ApiClientError)) {
    return "We couldn't reach the server. Check your connection and try again.";
  }

  switch (err.code) {
    case "EMAIL_ALREADY_EXISTS":
      return "An account with this email already exists. Try signing in instead.";
    case "VALIDATION_FAILED":
      return (
        err.errors[0]?.message ?? "Some of those details didn't look right."
      );
    case "RATE_LIMIT_SIGNUP":
      return "Too many accounts created from this network. Try again later.";
    case "NETWORK_ERROR":
      return "We couldn't reach the server. Check your connection and try again.";
    default:
      return err.statusCode >= 500
        ? "Something went wrong on our side. Try again in a moment."
        : err.message;
  }
}

/**
 * "By joining, you agree to …" — one line, on both steps.
 *
 * This replaces the required checkbox the old page carried. Consent is still
 * given by pressing the button, and the server never asked for the flag; the
 * line states it once instead of gating a form on a control people tick without
 * reading. Both links are real routes (`/terms`, `/privacy`).
 */
function TermsNotice() {
  return (
    <p className="mt-8 text-center text-[12.5px] leading-[1.65] text-(--text-subtle)">
      By joining, you agree to our{" "}
      <Link
        to="/terms"
        className="text-(--text-secondary) underline-offset-4 transition-colors duration-150 hover:text-(--text-primary) hover:underline"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        to="/privacy"
        className="text-(--text-secondary) underline-offset-4 transition-colors duration-150 hover:text-(--text-primary) hover:underline"
      >
        Privacy Policy
      </Link>
    </p>
  );
}

/** One field: label, mark, clear button, and the bubble under it. */
function Field({
  id,
  type,
  placeholder,
  autoComplete,
  icon,
  error,
  errorId,
  invalid,
  field,
  onChange,
  onClear,
  trailing,
}: {
  id: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  icon: IconSvgElement;
  error?: string;
  errorId: string;
  invalid: boolean;
  field: UseFormRegisterReturn;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  trailing?: ReactNode;
}) {
  return (
    /* `pb-10` is the slot the bubble lands in: 8px of margin plus the bubble's
       30px, and two pixels spare. The bubble is positioned off the field
       itself, so without a reserved strip it floats over the *next* field — and
       with four of them stacked, that is the field a person is about to type
       into. Reserving the strip costs 40px of gutter and buys a form that
       neither shifts nor covers anything when a field is wrong. */
    <div className="pb-10">
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>

      <div className="relative">
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={invalid ? "true" : "false"}
          aria-describedby={error ? errorId : undefined}
          {...field}
          onChange={onChange}
          className={[
            FIELD,
            "peer",
            PAD,
            trailing ? "pr-20" : "pr-11",
            error ? "border-(--danger)" : "border-(--hairline)",
          ].join(" ")}
        />

        <span className={MARK} aria-hidden="true">
          <HugeiconsIcon icon={icon} size={16} strokeWidth={1.8} />
        </span>

        <button
          type="button"
          onClick={onClear}
          aria-label={`Clear ${placeholder.toLowerCase()}`}
          className={[CLEAR, trailing ? "right-10" : "right-3"].join(" ")}
        >
          <HugeiconsIcon icon={Cancel01Icon} size={13} strokeWidth={2.4} />
        </button>

        {trailing}

        {error && (
          <FieldError
            id={errorId}
            message={error}
            onDismiss={onClear}
            width={300}
            size="sm"
          />
        )}
      </div>
    </div>
  );
}

/**
 * The sign-up column — the shape of the reference: a claim, the providers
 * stacked full width, and one way past them.
 *
 * Two steps, not two pages. The card opens on the providers, because that is
 * the shorter road in; "Continue with Email" swaps the same column over to the
 * form, and the way back is one press. Nothing is unmounted between them, so a
 * half-typed name survives a look at the other options.
 *
 * Only the providers the server actually configured are rendered
 * (`isGoogleAvailable` / `isGithubAvailable`). The reference also shows ChatGPT
 * and Apple; this backend has neither, and a button that cannot start a flow is
 * worse than no button. When `/auth/oauth` reports them, they arrive here as
 * one more entry in the stack — the row is already `block`.
 */
export function RegisterForm() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = postLoginDestination(location.state);

  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmId = useId();
  const nameErrorId = useId();
  const emailErrorId = useId();
  const passwordErrorId = useId();
  const confirmErrorId = useId();

  const [step, setStep] = useState<"providers" | "email">("providers");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    clearErrors,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    /* Validation is a submit-time event, the same as the sign-in form: nothing
       is checked while typing, nothing on blur, and no bubble appears until
       Create account has been pressed once. */
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const nameField = registerField("fullName");
  const emailField = registerField("email");
  const passwordField = registerField("password");
  const confirmField = registerField("confirmPassword");

  /* Once an error is on screen, typing is the answer to it. */
  const clearOnType =
    (field: "fullName" | "email" | "password" | "confirmPassword") => () => {
      if (errors[field]) clearErrors(field);
    };

  const clearField =
    (
      field: "fullName" | "email" | "password" | "confirmPassword",
      id: string,
    ) =>
    () => {
      setValue(field, "", { shouldValidate: false });
      clearErrors(field);
      document.getElementById(id)?.focus();
    };

  const {
    signInWithGoogle,
    signInWithGithub,
    loadingProvider,
    isGoogleAvailable,
    isGithubAvailable,
  } = useUnifiedOAuth({ rememberMe: true });

  const busy = isSubmitting || loadingProvider !== null;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await register(values.fullName, values.email, values.password);
      /* Straight in, not back to a sign-in form with the details they just
         typed. The session is set by this call, so the guard and this
         `navigate` now agree on where "next" is. */
      await login(values.email, values.password, true);
      toastSuccess("Account created", "Taking you to your workspaces.");
      navigate(destination, { replace: true });
    } catch (err) {
      /* When the server names a field, the sentence belongs on that field.
         Otherwise it is a toast, never a banner above the form. */
      let placedOnAField = false;

      if (err instanceof ApiClientError) {
        for (const fieldError of err.errors) {
          const field = fieldError.field;
          if (
            field === "fullName" ||
            field === "email" ||
            field === "password"
          ) {
            setError(field, { type: "server", message: fieldError.message });
            placedOnAField = true;
          }
        }
      }

      if (!placedOnAField) toastError(null, registerErrorMessage(err));
    }
  });

  const showPasswordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((value) => !value)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      className="absolute top-1/2 right-2.5 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-(--text-muted) transition-colors duration-150 hover:bg-(--tint-4) hover:text-(--text-primary)"
    >
      <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={16} />
    </button>
  );

  if (step === "providers") {
    return (
      <div className="mx-auto flex w-full max-w-105 flex-col">
        <h2 className="text-center text-[30px] leading-[1.08] font-bold tracking-[-1.2px] text-(--text-primary) sm:text-[34px] sm:tracking-[-1.5px]">
          Your first board
          <br />
          is just a sign-up away.
        </h2>

        <div className="mt-8 flex flex-col gap-3">
          {isGoogleAvailable && (
            <OAuthButton
              variant="block"
              provider="google"
              loading={loadingProvider === "google"}
              disabled={busy}
              onClick={signInWithGoogle}
            />
          )}
          {isGithubAvailable && (
            <OAuthButton
              variant="block"
              provider="github"
              loading={loadingProvider === "github"}
              disabled={busy}
              onClick={signInWithGithub}
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => setStep("email")}
          className="group/email mx-auto mt-7 flex items-center gap-1.5 rounded-lg px-3 py-2 text-[15px] font-semibold text-(--brand) transition-colors duration-150 hover:text-(--brand-hover) focus-visible:ring-2 focus-visible:ring-(--brand)/40 focus-visible:outline-hidden"
        >
          Continue with Email
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            size={17}
            strokeWidth={2.2}
            className="transition-transform duration-150 group-hover/email:translate-x-0.5 motion-reduce:transition-none"
          />
        </button>

        <TermsNotice />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-105 flex-col">
      <button
        type="button"
        onClick={() => setStep("providers")}
        className="flex items-center gap-1.5 self-start rounded-lg py-1.5 text-[13px] font-medium text-(--text-muted) transition-colors duration-150 hover:text-(--text-primary) focus-visible:ring-2 focus-visible:ring-(--brand)/40 focus-visible:outline-hidden"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={15} strokeWidth={2.2} />
        All sign-up options
      </button>

      <h2 className="mt-3 text-[24px] leading-[1.2] font-semibold tracking-[-0.6px] text-(--text-primary) sm:text-[26px]">
        Create your account
      </h2>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col">
        <Field
          id={nameId}
          type="text"
          placeholder="Full name"
          autoComplete="name"
          icon={UserCircleIcon}
          error={errors.fullName?.message}
          errorId={nameErrorId}
          invalid={Boolean(errors.fullName)}
          field={nameField}
          onChange={(event) => {
            nameField.onChange(event);
            clearOnType("fullName")();
          }}
          onClear={clearField("fullName", nameId)}
        />

        <Field
          id={emailId}
          type="email"
          placeholder="Email address"
          autoComplete="email"
          icon={Mail01Icon}
          error={errors.email?.message}
          errorId={emailErrorId}
          invalid={Boolean(errors.email)}
          field={emailField}
          onChange={(event) => {
            emailField.onChange(event);
            clearOnType("email")();
          }}
          onClear={clearField("email", emailId)}
        />

        <Field
          id={passwordId}
          type={showPassword ? "text" : "password"}
          placeholder={`Password (${PASSWORD_MIN}+ characters)`}
          autoComplete="new-password"
          icon={LockPasswordIcon}
          error={errors.password?.message}
          errorId={passwordErrorId}
          invalid={Boolean(errors.password)}
          field={passwordField}
          onChange={(event) => {
            passwordField.onChange(event);
            clearOnType("password")();
          }}
          onClear={clearField("password", passwordId)}
          trailing={showPasswordToggle}
        />

        <Field
          id={confirmId}
          type={showPassword ? "text" : "password"}
          placeholder="Confirm password"
          autoComplete="new-password"
          icon={LockPasswordIcon}
          error={errors.confirmPassword?.message}
          errorId={confirmErrorId}
          invalid={Boolean(errors.confirmPassword)}
          field={confirmField}
          onChange={(event) => {
            confirmField.onChange(event);
            clearOnType("confirmPassword")();
          }}
          onClear={clearField("confirmPassword", confirmId)}
        />

        <button
          type="submit"
          disabled={busy}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--brand) text-[15px] font-semibold text-(--solid-text) transition-colors duration-150 hover:bg-(--brand-hover) focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-surface) focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <HugeiconsIcon
                icon={Loading03Icon}
                size={16}
                className="animate-spin motion-reduce:animate-none"
              />
              Creating your account…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <TermsNotice />
    </div>
  );
}
