import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";

import LoginForm from "@components/ui/auth/LoginForm";

interface LoginLocationState {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
}

function getLoginDestination(state: unknown): string {
  if (!state || typeof state !== "object") {
    return "/dashboard";
  }

  const loginState = state as LoginLocationState;
  const from = loginState.from;

  if (!from?.pathname) {
    return "/dashboard";
  }

  /*
   * Only allow internal application paths.
   *
   * This prevents an external URL from being used as a
   * post-login redirect.
   */
  if (!from.pathname.startsWith("/")) {
    return "/dashboard";
  }

  return `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`;
}

export default function LoginPage() {
  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const destination = getLoginDestination(location.state);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (
    email: string,
    password: string,
  ): Promise<void> => {
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      console.error("Sign in failed:", error);

      setError(
        "Unable to sign in. Please check your credentials and try again.",
      );
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

          {/* Authentication card */}
          <div className="border border-neutral-800 bg-[#101010]">
            {/* Header */}
            <div className="border-b border-neutral-800 px-6 py-5 sm:px-8">
              <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-neutral-600">
                Authentication
              </p>

              <h1 className="font-mono text-2xl font-semibold tracking-tight text-neutral-100">
                Sign in to Kanban
              </h1>

              <p className="mt-2 font-mono text-xs leading-6 text-neutral-500">
                Continue to your collaborative workspace.
              </p>
            </div>

            {/* Authentication error */}
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
              <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} />
            </div>

            {/* Sign up */}
            <div className="border-t border-neutral-800 px-6 py-5 text-center sm:px-8">
              <p className="font-mono text-xs text-neutral-600">
                Don't have an account?
                <Link
                  to="/auth/register"
                  className="ml-2 text-neutral-400 transition-colors hover:text-rose-400"
                >
                  [ Sign up ]
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
