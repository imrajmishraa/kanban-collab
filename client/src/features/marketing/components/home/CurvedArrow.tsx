import { cn } from "@/lib/cn";

export function CurvedArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 50"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn(
        "pointer-events-none absolute hidden text-(--text-secondary)/50 lg:block",
        className,
      )}
    >
      <path d="M 5 45 C 22 8, 50 10, 75 25" />
      <path d="M 75 25 L 65 10" />
      <path d="M 75 25 L 66 32" />
    </svg>
  );
}

/* ── Board data ───────────────────────────────────────────────────── */
