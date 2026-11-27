import { cn } from "@/lib/cn";

export function Annotation({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute hidden select-none lg:block",
        "text-[15px] leading-tight text-(--text-secondary)/80",
        className,
      )}
      style={{ fontFamily: '"Caveat", "Comic Sans MS", cursive' }}
    >
      {children}
    </span>
  );
}

/* ── Curved arrow (desktop only) ──────────────────────────────────── */
