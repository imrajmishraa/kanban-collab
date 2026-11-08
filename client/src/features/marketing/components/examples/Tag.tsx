interface TagProps {
  label: string;
  brand?: boolean;
}

/** A card's category chip, in the mono register. */
export default function Tag({ label, brand }: TagProps) {
  return (
    <span
      className={[
        "rounded-sm px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em]",
        brand
          ? "bg-(--brand-wash) text-(--brand)"
          : "bg-(--tint-4) text-(--text-secondary)",
      ].join(" ")}
    >
      {label}
    </span>
  );
}
