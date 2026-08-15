import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";

import RegisterForm from "@components/ui/auth/RegisterForm";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (
    fullName: string,
    email: string,
    password: string,
  ): Promise<void> => {
    setError(null);
    setIsSubmitting(true);

    try {
      await register(fullName, email, password);

      navigate("/auth/login", {
        replace: true,
        state: {
          registered: true,
          email,
        },
      });
    } catch (error: unknown) {
      console.error("Sign up failed:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to create your account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-12 text-neutral-100 sm:px-6 sm:py-16">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md items-center justify-center">
        <section className="w-full">
          {/* Brand */}
          <div className="mb-10 text-center">
            <Link
              to="/"
              className="inline-flex items-center font-mono text-xl font-bold tracking-tight text-neutral-100 transition-colors hover:text-white"
            >
              <span className="mr-2 font-extrabold text-rose-500">&gt;</span>
              Kanban
            </Link>
          </div>

          {/* Authentication Card */}
          <div className="border border-neutral-800 bg-[#101010]">
            {/* Header */}
            <div className="border-b border-neutral-800 px-6 py-5 sm:px-8">
              <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-neutral-600">
                Authentication
              </p>

              <h1 className="font-mono text-2xl font-semibold tracking-tight text-neutral-100">
                Create your account
              </h1>

              <p className="mt-2 font-mono text-xs leading-6 text-neutral-500">
                Start collaborating with your team.
              </p>
            </div>

            {/* Server Error */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="border-b border-rose-500/20 bg-rose-500/5 px-6 py-3 sm:px-8"
              >
                <p className="font-mono text-xs leading-5 text-rose-400">
                  <span className="mr-2 text-rose-500">&gt;</span>
                  {error}
                </p>
              </div>
            )}

            {/* Form */}
            <div className="px-6 py-7 sm:px-8">
              <RegisterForm
                onSubmit={handleRegister}
                isSubmitting={isSubmitting}
              />
            </div>

            {/* Login */}
            <div className="border-t border-neutral-800 px-6 py-5 text-center sm:px-8">
              <p className="font-mono text-xs text-neutral-600">
                Already have an account?
                <Link
                  to="/auth/login"
                  className="ml-2 text-neutral-400 transition-colors hover:text-rose-400"
                >
                  [ Sign in ]
                </Link>
              </p>
            </div>
          </div>

          {/* Back */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="font-mono text-xs text-neutral-700 transition-colors hover:text-neutral-400"
            >
              ← Back to home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
