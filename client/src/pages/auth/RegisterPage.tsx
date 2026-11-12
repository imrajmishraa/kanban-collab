import { AuthBrandPanel, RegisterForm } from "@/features/auth";

export default function RegisterPage() {
  return (
    <section className="flex h-full min-h-0 w-full flex-1 justify-center bg-(--bg-root)">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-384 items-center justify-center border-x border-b border-(--hairline) px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="grid h-full max-h-180 min-h-0 w-full max-w-295 select-none overflow-hidden rounded-3xl border border-(--hairline) bg-(--bg-surface) lg:grid-cols-2">
          <AuthBrandPanel />

          <section className="flex min-h-0 flex-col justify-center overflow-hidden p-6 sm:p-8 xl:p-12">
            <RegisterForm />
          </section>
        </div>
      </div>
    </section>
  );
}
