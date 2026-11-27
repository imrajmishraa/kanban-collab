import { type ReactNode, Suspense, useEffect, useRef, useState } from "react";
import { SectionFallback } from "./SectionFallback";

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
