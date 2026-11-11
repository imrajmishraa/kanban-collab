import { AuthBrandPanel, LoginForm } from "@/features/auth";

/**
 * /auth/login — the card, on one screen.
 *
 * Every box here is told it may shrink (`min-h-0` down the chain) and the card
 * is capped at `max-h-[720px]`: on a tall monitor it stops growing and centres,
 * on a short one it gives height back instead of pushing a scrollbar onto the
 * document. The paddings step down at `sm` and `xl` for the same reason.
 *
 * A `<section>`, not a `<main>`: `AuthLayout` already renders the page's `main`,
 * and two of them nested is invalid — the second is ignored by assistive tech,
 * which quietly loses the landmark on the one page that needs it.
 */
export default function LoginPage() {
  return (
    <section className="flex h-full min-h-0 w-full flex-1 justify-center bg-(--bg-root)">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-384 items-center justify-center border-x border-b border-(--hairline) px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="grid h-full max-h-180 min-h-0 w-full max-w-295 select-none overflow-hidden rounded-3xl border border-(--hairline) bg-(--bg-surface) lg:grid-cols-2">
          <AuthBrandPanel />

          <section className="flex min-h-0 flex-col justify-center overflow-hidden p-6 sm:p-8 xl:p-12">
            <LoginForm />
          </section>
        </div>
      </div>
    </section>
  );
}
