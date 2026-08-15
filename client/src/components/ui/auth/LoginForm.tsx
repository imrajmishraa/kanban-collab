import { useState, type FormEventHandler } from "react";

import { loginSchema, type LoginFormData } from "@/validations/auth.schema";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isSubmitting?: boolean;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

export default function LoginForm({
  onSubmit,
  isSubmitting = false,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<LoginFormErrors>({});

  const clearFieldError = (field: keyof LoginFormErrors) => {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };

      delete next[field];

      return next;
    });
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const formData: LoginFormData = {
      email,
      password,
    };

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: LoginFormErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0];

        if (field === "email" || field === "password") {
          fieldErrors[field] = issue.message;
        }
      }

      setErrors(fieldErrors);

      return;
    }

    setErrors({});

    const { email: validatedEmail, password: validatedPassword } = result.data;

    await onSubmit(validatedEmail, validatedPassword);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="login-email"
          className="block font-mono text-xs text-(--text-secondary)"
        >
          Email
        </label>

        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            clearFieldError("email");
          }}
          placeholder="you@example.com"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          className={`h-11 w-full border bg-(--bg-root) px-3 font-mono text-sm text-(--text-primary) outline-none!
          ring-0!
          shadow-none!
          transition-all
          focus:outline-none!
          focus:ring-0!
          focus:shadow-none!
          focus-visible:outline-none!
          focus-visible:ring-0!
          focus-visible:shadow-none! disabled:cursor-not-allowed disabled:opacity-60 ${
            errors.email
              ? "border-(--danger)"
              : "border-(--border-strong) focus:border-(--brand)"
          }`}
        />

        {errors.email && (
          <p
            id="login-email-error"
            className="font-mono text-xs leading-5 text-(--danger)"
          >
            <span className="mr-2">&gt;</span>
            {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label
          htmlFor="login-password"
          className="block font-mono text-xs text-(--text-secondary)"
        >
          Password
        </label>

        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            clearFieldError("password");
          }}
          placeholder="••••••••"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "login-password-error" : undefined
          }
          className={`h-11 w-full border bg-(--bg-root) px-3 font-mono text-sm text-(--text-primary) outline-none!
          ring-0!
          shadow-none!
          transition-all
          focus:outline-none!
          focus:ring-0!
          focus:shadow-none!
          focus-visible:outline-none!
          focus-visible:ring-0!
          focus-visible:shadow-none! disabled:cursor-not-allowed disabled:opacity-60 ${
            errors.password
              ? "border-(--danger)"
              : "border-(--border-strong) focus:border-(--brand)"
          }`}
        />

        {errors.password && (
          <p
            id="login-password-error"
            className="font-mono text-xs leading-5 text-(--danger)"
          >
            <span className="mr-2">&gt;</span>
            {errors.password}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="
          flex h-11 w-full items-center justify-center
          border border-(--brand)
          bg-(--brand)/10
          px-4
          font-mono text-sm text-(--brand)
          outline-none!
          ring-0!
          shadow-none!
          transition-all
          hover:bg-(--brand)/15
          hover:text-(--brand)
          focus:outline-none!
          focus:ring-0!
          focus:shadow-none!
          focus-visible:outline-none!
          focus-visible:ring-0!
          focus-visible:shadow-none!
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {isSubmitting ? "[ Signing in... ]" : "[ Sign In ]"}
      </button>
    </form>
  );
}
