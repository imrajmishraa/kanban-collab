/**
 * The identity palette. Eight values, the same in both themes, hashed from a
 * seed in the app — a fixed colour here, because an example has no user id.
 */
const IDENTITY = {
  brand: "#ff6b35",
  blue: "#4f9cf9",
  green: "#35d399",
  violet: "#b07cff",
  amber: "#f5b84b",
} as const;

interface AvatarProps {
  initials: string;
  tone?: keyof typeof IDENTITY;
  className?: string;
}

export default function Avatar({
  initials,
  tone = "brand",
  className = "",
}: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      style={{ background: IDENTITY[tone] }}
      className={`grid size-5 place-items-center rounded-full text-[8px] font-bold text-(--on-color) ${className}`}
    >
      {initials}
    </span>
  );
}
