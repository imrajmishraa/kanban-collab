interface SwitchProps {
  on?: boolean;
  className?: string;
}

export default function Switch({ on = false, className = "" }: SwitchProps) {
  return (
    <span
      aria-hidden="true"
      className={[
        "ml-auto h-4.5 w-7.5 shrink-0 rounded-full transition-colors duration-150",
        on ? "bg-(--brand)" : "bg-(--tint-10)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          "mt-0.5 block size-3.5 rounded-full border border-(--hairline) bg-(--bg-surface) transition-transform duration-150",
          on ? "translate-x-3.5" : "translate-x-0.5",
        ].join(" ")}
      />
    </span>
  );
}
