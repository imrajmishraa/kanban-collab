import { useState, type FormEvent } from "react";

interface RegisterFormProps {
  onSubmit: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<void>;

  isSubmitting?: boolean;
  error?: string | null;
}

export default function RegisterForm({
  onSubmit,
  isSubmitting = false,
  error = null,
}: RegisterFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    setValidationError(null);

    const normalizedFullName = fullName.trim();
    const normalizedEmail = email.trim();

    if (!normalizedFullName) {
      setValidationError("Full name is required.");
      return;
    }

    if (!normalizedEmail) {
      setValidationError("Email is required.");
      return;
    }

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    try {
      await onSubmit(normalizedFullName, normalizedEmail, password);
    } catch {
      // Registration errors are handled by RegisterPage.
    }
  };

  const displayedError = validationError ?? error;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Full name */}
      <div className="space-y-2">
        <label
          htmlFor="register-full-name"
          className="block font-mono text-xs text-neutral-400"
        >
          Full Name
        </label>

        <input
          id="register-full-name"
          name="fullName"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Raj Mishra"
          required
          disabled={isSubmitting}
          className="h-11 w-full border border-neutral-700 bg-[#080808] px-3 font-mono text-sm text-neutral-100 outline-none transition-colors placeholder:text-neutral-700 focus:border-rose-500/70 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="register-email"
          className="block font-mono text-xs text-neutral-400"
        >
          Email
        </label>

        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          disabled={isSubmitting}
          className="h-11 w-full border border-neutral-700 bg-[#080808] px-3 font-mono text-sm text-neutral-100 outline-none transition-colors placeholder:text-neutral-700 focus:border-rose-500/70 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label
          htmlFor="register-password"
          className="block font-mono text-xs text-neutral-400"
        >
          Password
        </label>

        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          minLength={8}
          required
          disabled={isSubmitting}
          className="h-11 w-full border border-neutral-700 bg-[#080808] px-3 font-mono text-sm text-neutral-100 outline-none transition-colors placeholder:text-neutral-700 focus:border-rose-500/70 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {/* Confirm password */}
      <div className="space-y-2">
        <label
          htmlFor="register-confirm-password"
          className="block font-mono text-xs text-neutral-400"
        >
          Confirm Password
        </label>

        <input
          id="register-confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="••••••••"
          minLength={8}
          required
          disabled={isSubmitting}
          className="h-11 w-full border border-neutral-700 bg-[#080808] px-3 font-mono text-sm text-neutral-100 outline-none transition-colors placeholder:text-neutral-700 focus:border-rose-500/70 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {/* Error */}
      {displayedError && (
        <div
          role="alert"
          className="border border-red-500/30 bg-red-500/5 px-3 py-3 font-mono text-xs text-red-400"
        >
          {displayedError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center border border-rose-500/80 bg-rose-500/10 px-4 font-mono text-sm text-rose-400 transition-all hover:bg-rose-500/15 hover:text-rose-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "[ Creating account... ]" : "[ Create Account ]"}
      </button>
    </form>
  );
}
