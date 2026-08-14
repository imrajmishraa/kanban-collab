import React, { useState } from "react";

interface SignUpFormProps {
  onSubmit: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<void>;

  isSubmitting?: boolean;
}

export default function SignUpForm({
  onSubmit,
  isSubmitting = false,
}: SignUpFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    await onSubmit(fullName.trim(), email.trim(), password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full name */}
      <div className="space-y-2">
        <label
          htmlFor="fullName"
          className="block font-mono text-xs text-neutral-400"
        >
          Full Name
        </label>

        <input
          id="fullName"
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
          htmlFor="signup-email"
          className="block font-mono text-xs text-neutral-400"
        >
          Email
        </label>

        <input
          id="signup-email"
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
          htmlFor="signup-password"
          className="block font-mono text-xs text-neutral-400"
        >
          Password
        </label>

        <input
          id="signup-password"
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
