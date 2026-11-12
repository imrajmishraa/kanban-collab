import { AuthBrandPanel, ForgotPasswordForm } from "@/features/auth";

/**
 * /auth/forgot-password — the same card as `/auth/login` and `/auth/register`.
 *
 * It used to be its own thing: a mono-glow panel with a security illustration
 * and stat blocks on the left, a bespoke column on the right. Three auth pages
 * that each invented a frame meant three frames to keep in step. The card and
 * `AuthBrandPanel` are shared now, and only the column inside changes.
 *
 * A `<section>`, not a `<main>`: `AuthLayout` already renders the page's `main`.
 */
export default function ForgotPasswordPage() {
  return (
    <section className="flex h-full min-h-0 w-full flex-1 justify-center bg-(--bg-root)">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-384 items-center justify-center border-x border-b border-(--hairline) px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="grid h-full max-h-180 min-h-0 w-full max-w-295 select-none overflow-hidden rounded-3xl border border-(--hairline) bg-(--bg-surface) lg:grid-cols-2">
          <AuthBrandPanel />

          <section className="flex min-h-0 flex-col justify-center overflow-hidden p-6 sm:p-8 xl:p-12">
            <ForgotPasswordForm />
          </section>
        </div>
      </div>
    </section>
  );
}
