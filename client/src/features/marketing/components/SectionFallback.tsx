export function SectionFallback() {
  return (
    <div
      role="status"
      aria-label="Loading section"
      className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
    >
      <div className="animate-pulse motion-reduce:animate-none">
        {/* eyebrow pill */}
        <div className="mx-auto h-7 w-40 rounded-full border border-(--border) bg-(--tint-3)" />

        {/* heading */}
        <div className="mx-auto mt-7 h-9 w-full max-w-xl rounded-lg bg-(--tint-6)" />
        <div className="mx-auto mt-3 h-9 w-2/3 max-w-sm rounded-lg bg-(--tint-4)" />

        {/* body copy */}
        <div className="mx-auto mt-6 h-3 w-full max-w-md rounded-full bg-(--tint-3)" />

        {/* card row */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl border border-(--border-subtle) bg-(--tint-3)"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
