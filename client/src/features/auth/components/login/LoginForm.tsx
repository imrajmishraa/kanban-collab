import { useId, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Loading03Icon,
  LockPasswordIcon,
  Mail01Icon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";

import KanbanIcon from "@/assets/KanbanIcon";
import { useAuth } from "@/hooks/useAuth";
import { toastError, toastSuccess } from "@/lib/toast";
import { ApiClientError } from "@/services/client";
import {
  loginSchema,
  type LoginFormData,
  postLoginDestination,
  useUnifiedOAuth,
  OAuthButton,
  FieldError,
} from "@/features/auth";

function loginErrorMessage(err: unknown): string {
  if (!(err instanceof ApiClientError)) {
    return "We couldn't reach the server. Check your connection and try again.";
  }

  switch (err.statusCode) {
    case 400:
    case 401:
      return "The email or password you entered is incorrect.";
    case 403:
      return "This account can't sign in right now. Ask an admin to check your access.";
    case 404:
      return "We couldn't find an account with that email.";
    case 409:
      return "This account is already signed in somewhere else. Try again in a moment.";
    case 422:
      return "Some of those details didn't look right. Check them and try again.";
    case 429:
      return "Too many attempts. Wait a minute, then try again.";
    default:
      return err.statusCode >= 500
        ? "Something went wrong on our side. Try again in a moment."
        : "We couldn't sign you in. Try again in a moment.";
  }
}

/** The field chrome, shared by both inputs so they cannot drift apart. */
const FIELD = [
  "h-12 w-full rounded-xl border bg-(--bg-surface) pr-4",
  "text-[15px] text-(--text-primary) placeholder:text-(--text-subtle)",
  "outline-hidden transition-colors duration-150",
  "hover:border-(--hairline-strong) focus:border-(--brand) focus:bg-(--tint-2)",
].join(" ");

/**
 * The mark at the left edge of a field.
 */
const MARK =
  "pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-(--text-subtle) opacity-0 transition-[opacity,color] duration-150 peer-focus:opacity-100 peer-focus:text-(--brand) peer-not-placeholder-shown:opacity-100";

/** Padding follows the mark: reserved while it shows, plain while it does not. */
const PAD = "pl-4 focus:pl-11 [&:not(:placeholder-shown)]:pl-11";

/** The clear button: only while there is something to clear. */
const CLEAR =
  "absolute top-1/2 hidden size-6 -translate-y-1/2 place-items-center rounded-md text-(--text-subtle) transition-colors duration-150 peer-not-placeholder-shown:grid hover:bg-(--tint-4) hover:text-(--text-primary)";

/**
 * The sign-in column.
 */
export function LoginForm() {
  const { login, refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = postLoginDestination(location.state);

  const emailId = useId();
  const passwordId = useId();
  const rememberId = useId();
  const emailErrorId = useId();
  const passwordErrorId = useId();

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const {
    register: registerField,
    handleSubmit,
    clearErrors,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: { email: "", password: "" },
  });

  const emailField = registerField("email");
  const passwordField = registerField("password");

  /* Once an error is on screen, typing is the answer to it, so the bubble gets
     out of the way on the first key — it comes back on the next submit. */
  const clearOnType = (field: "email" | "password") => () => {
    if (errors[field]) clearErrors(field);
  };

  const handleOAuthSuccess = async () => {
    const ok = await refresh();
    if (ok) {
      toastSuccess("Login Success", "Taking you to your workspaces.");
      navigate(destination, { replace: true });
    }
  };

  const handleOAuthError = (errorMsg: string) => {
    toastError(new Error(errorMsg));
  };

  const { signInWithGoogle, signInWithGithub, loadingProvider } =
    useUnifiedOAuth({
      onSuccess: handleOAuthSuccess,
      onError: handleOAuthError,
      rememberMe: remember,
    });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values.email, values.password, remember);
      toastSuccess("Login Success", "Taking you to your workspaces.");
      navigate(destination, { replace: true });
    } catch (err) {
      toastError(null, loginErrorMessage(err));
    }
  });

  return (
    <div className="mx-auto w-full max-w-105">
      <h2 className="text-[24px] font-semibold leading-[1.2] tracking-[-0.6px] text-(--text-primary) sm:text-[26px]">
        Log in to Kanban
      </h2>

      {/* the two providers, side by side */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <OAuthButton
          provider="google"
          loading={loadingProvider === "google"}
          disabled={loadingProvider !== null || isSubmitting}
          onClick={signInWithGoogle}
        />
        <OAuthButton
          provider="github"
          loading={loadingProvider === "github"}
          disabled={loadingProvider !== null || isSubmitting}
          onClick={signInWithGithub}
        />
      </div>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-(--hairline)" />
        <span className="font-mono text-[10px] text-(--text-subtle)">
          Or With Email
        </span>
        <span className="h-px flex-1 bg-(--hairline)" />
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <div className="relative">
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
                clearOnType("email")();
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
              <HugeiconsIcon icon={Cancel01Icon} size={13} strokeWidth={2.4} />
            </button>
          </div>

          {errors.email && (
            <FieldError
              id={emailErrorId}
              message={errors.email.message}
              onDismiss={() => clearErrors("email")}
              width={235}
              size="sm"
            />
          )}
        </div>

        <div className="relative">
          <label htmlFor={passwordId} className="sr-only">
            Password
          </label>

          <div className="relative">
            <input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? passwordErrorId : undefined}
              {...passwordField}
              onChange={(event) => {
                passwordField.onChange(event);
                clearOnType("password")();
              }}
              className={[
                FIELD,
                "peer",
                PAD,
                "pr-20",
                errors.password ? "border-(--danger)" : "border-(--hairline)",
              ].join(" ")}
            />

            <span className={MARK} aria-hidden="true">
              <HugeiconsIcon
                icon={LockPasswordIcon}
                size={16}
                strokeWidth={1.8}
              />
            </span>

            <button
              type="button"
              onClick={() => {
                setValue("password", "", { shouldValidate: false });
                clearErrors("password");
                document.getElementById(passwordId)?.focus();
              }}
              aria-label="Clear password"
              className={[CLEAR, "right-10"].join(" ")}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={13} strokeWidth={2.4} />
            </button>

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-2.5 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-(--text-muted) transition-colors duration-150 hover:bg-(--tint-4) hover:text-(--text-primary)"
            >
              <HugeiconsIcon
                icon={showPassword ? ViewOffIcon : ViewIcon}
                size={16}
              />
            </button>
          </div>

          {errors.password && (
            <FieldError
              id={passwordErrorId}
              message={errors.password.message}
              onDismiss={() => clearErrors("password")}
              width={170}
              size="sm"
            />
          )}
        </div>

        <div className="mt-1 flex items-center justify-between">
          <label
            htmlFor={rememberId}
            className="flex cursor-pointer items-center gap-2 text-[13px] text-(--text-secondary) select-none"
          >
            <input
              id={rememberId}
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="size-4 accent-(--brand)"
            />
            Keep me signed in
          </label>

          <Link
            to="/auth/forgot-password"
            className="text-[13px] font-medium text-(--text-primary) underline-offset-4 hover:underline"
          >
            Forgotten password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || loadingProvider !== null}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--brand) text-[15px] font-semibold text-(--solid-text) transition-colors duration-150 hover:bg-(--brand-hover) focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-surface) focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <HugeiconsIcon
                icon={Loading03Icon}
                size={16}
                className="animate-spin motion-reduce:animate-none"
              />
              Signing you in…
            </>
          ) : (
            "Log in"
          )}
        </button>
      </form>

      <div className="mt-8 border-t border-(--hairline) pt-6">
        <Link
          to="/auth/register"
          className="flex h-12 w-full items-center justify-center rounded-xl border border-(--brand-line) text-[15px] font-semibold text-(--brand) transition-colors duration-150 hover:bg-(--brand-wash)"
        >
          Create new account
        </Link>
      </div>

      {/* The lockup sits on its own, centred under the card's actions.
          A `Link` wrapping a `button` is two interactive elements nested, which
          is invalid — and it also swallowed the click. One `Link` now, styled as
          the row. */}
      <div className="pt-6 flex w-full justify-center">
        <div className="group/logo inline-flex min-w-0 items-center gap-2 rounded-full px-2 py-2 transition-colors duration-150">
          <KanbanIcon size={20} variant="upper" theme="auto" />
          <span className="font-display -m-1.5 text-[14px] font-bold leading-none tracking-tight text-(--text-primary)">
            Kanban
          </span>
        </div>
      </div>
    </div>
  );
}
