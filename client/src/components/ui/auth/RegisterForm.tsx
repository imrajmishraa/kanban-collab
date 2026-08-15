import { useState, type FormEventHandler } from "react";

import {
  registerSchema,
  type RegisterFormData,
} from "@/validations/auth.schema";

interface RegisterFormProps {
  onSubmit: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  isSubmitting?: boolean;
}

interface RegisterFormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterForm({
  onSubmit,
  isSubmitting = false,
}: RegisterFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<RegisterFormErrors>({});

  const clearFieldError = (field: keyof RegisterFormErrors) => {
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

    const formData: RegisterFormData = {
      fullName,
      email,
      password,
      confirmPassword,
    };

    const result = registerSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: RegisterFormErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0];

        if (
          field === "fullName" ||
          field === "email" ||
          field === "password" ||
          field === "confirmPassword"
        ) {
          fieldErrors[field] = issue.message;
        }
      }

      setErrors(fieldErrors);

      return;
    }

    setErrors({});

    const {
      fullName: validatedFullName,
      email: validatedEmail,
      password: validatedPassword,
    } = result.data;

    await onSubmit(validatedFullName, validatedEmail, validatedPassword);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Full Name */}
      <div className="space-y-2">
        <label
          htmlFor="register-fullName"
          className="block font-mono text-xs text-(--text-secondary)"
        >
          Full Name
        </label>

        <input
          id="register-fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(event) => {
            setFullName(event.target.value);
            clearFieldError("fullName");
          }}
          placeholder="Raj Mishra"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={
            errors.fullName ? "register-fullName-error" : undefined
          }
          className={`h-11 w-full border bg-(--bg-root) px-3 font-mono text-sm text-(--text-primary) placeholder:text-(--text-muted) transition-colors disabled:cursor-not-allowed disabled:opacity-60 shadow-none!
          focus:outline-none!
          focus:ring-0!
          focus:shadow-none!
          focus-visible:outline-none!
          focus-visible:ring-0!
          focus-visible:shadow-none! ${
            errors.fullName
              ? "border-(--danger)"
              : "border-(--border-strong) focus:border-(--brand)"
          }`}
        />

        {errors.fullName && (
          <p
            id="register-fullName-error"
            className="font-mono text-xs leading-5 text-(--danger)"
          >
            <span className="mr-2">&gt;</span>
            {errors.fullName}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="register-email"
          className="block font-mono text-xs text-(--text-secondary)"
        >
          Email
        </label>

        <input
          id="register-email"
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
          aria-describedby={errors.email ? "register-email-error" : undefined}
          className={`h-11 w-full border bg-(--bg-root) px-3 font-mono text-sm text-(--text-primary) placeholder:text-(--text-muted) transition-colors disabled:cursor-not-allowed disabled:opacity-60 shadow-none!
          focus:outline-none!
          focus:ring-0!
          focus:shadow-none!
          focus-visible:outline-none!
          focus-visible:ring-0!
          focus-visible:shadow-none! ${
            errors.email
              ? "border-(--danger)"
              : "border-(--border-strong) focus:border-(--brand)"
          }`}
        />

        {errors.email && (
          <p
            id="register-email-error"
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
          htmlFor="register-password"
          className="block font-mono text-xs text-(--text-secondary)"
        >
          Password
        </label>

        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            clearFieldError("password");
          }}
          placeholder="••••••••"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "register-password-error" : undefined
          }
          className={`h-11 w-full border bg-(--bg-root) px-3 font-mono text-sm text-(--text-primary) placeholder:text-(--text-muted) transition-colors disabled:cursor-not-allowed disabled:opacity-60 shadow-none!
          focus:outline-none!
          focus:ring-0!
          focus:shadow-none!
          focus-visible:outline-none!
          focus-visible:ring-0!
          focus-visible:shadow-none! ${
            errors.password
              ? "border-(--danger)"
              : "border-(--border-strong) focus:border-(--brand)"
          }`}
        />

        {errors.password && (
          <p
            id="register-password-error"
            className="font-mono text-xs leading-5 text-(--danger)"
          >
            <span className="mr-2">&gt;</span>
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label
          htmlFor="register-confirm-password"
          className="block font-mono text-xs text-(--text-secondary)"
        >
          Confirm Password
        </label>

        <input
          id="register-confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            clearFieldError("confirmPassword");
          }}
          placeholder="••••••••"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={
            errors.confirmPassword
              ? "register-confirm-password-error"
              : undefined
          }
          className={`h-11 w-full border bg-(--bg-root) px-3 font-mono text-sm text-(--text-primary) placeholder:text-(--text-muted) transition-colors disabled:cursor-not-allowed disabled:opacity-60 shadow-none!
          focus:outline-none!
          focus:ring-0!
          focus:shadow-none!
          focus-visible:outline-none!
          focus-visible:ring-0!
          focus-visible:shadow-none! ${
            errors.confirmPassword
              ? "border-(--danger)"
              : "border-(--border-strong) focus:border-(--brand)"
          }`}
        />

        {errors.confirmPassword && (
          <p
            id="register-confirm-password-error"
            className="font-mono text-xs leading-5 text-(--danger)"
          >
            <span className="mr-2">&gt;</span>
            {errors.confirmPassword}
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
          transition-all
          hover:bg-(--brand)/15
          hover:text-(--brand)
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-50
          shadow-none!
          focus:outline-none!
          focus:ring-0!
          focus:shadow-none!
          focus-visible:outline-none!
          focus-visible:ring-0!
          focus-visible:shadow-none!
        "
      >
        {isSubmitting ? "[ Creating account... ]" : "[ Create Account ]"}
      </button>
    </form>
  );
}
