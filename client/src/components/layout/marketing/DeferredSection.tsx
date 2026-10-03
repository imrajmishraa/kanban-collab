import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

interface DeferredSectionProps {
  children: ReactNode;
  /** How far ahead of the viewport to start loading. */
  rootMargin?: string;
}

export default function DeferredSection({
  children,
  rootMargin = "600px 0px",
}: DeferredSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  /* No IntersectionObserver (very old browser) → show immediately.
     Computed as initial state rather than set inside the effect, so
     there's no synchronous setState during the effect pass. */
  const [shown, setShown] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    if (shown) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shown, rootMargin]);

  return (
    <div ref={ref}>
      {shown ? (
        <Suspense fallback={<SectionFallback />}>{children}</Suspense>
      ) : (
        <SectionFallback />
      )}
    </div>
  );
}

/* ── Fallback: a quiet skeleton in the page's own visual language,
   so a loading section reads as "coming" rather than "broken". ── */

export function SectionFallback() {
  return (
    <div
      role="status"
      aria-label="Loading section"
      className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
    >
      <div className="animate-pulse motion-reduce:animate-none">
        {/* eyebrow pill */}
        <div className="mx-auto h-7 w-40 rounded-full border border-white/8 bg-white/3" />

        {/* heading */}
        <div className="mx-auto mt-7 h-9 w-full max-w-xl rounded-lg bg-white/6" />
        <div className="mx-auto mt-3 h-9 w-2/3 max-w-sm rounded-lg bg-white/4" />

        {/* body copy */}
        <div className="mx-auto mt-6 h-3 w-full max-w-md rounded-full bg-white/3" />

        {/* card row */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl border border-white/6 bg-white/3"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
