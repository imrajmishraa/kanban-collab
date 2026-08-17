interface SecurityStatusProps {
  label: string;
  value: string;
  status: "ok" | "warning";
}

export function SecurityStatus({ label, value, status }: SecurityStatusProps) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-4 last:border-b-0">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={
            status === "ok"
              ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
              : "h-1.5 w-1.5 rounded-full bg-yellow-500"
          }
        />

        <span className="font-mono text-xs text-neutral-400">{label}</span>
      </div>

      <span
        className={
          status === "ok"
            ? "font-mono text-[10px] uppercase tracking-wider text-emerald-600"
            : "font-mono text-[10px] uppercase tracking-wider text-yellow-600"
        }
      >
        {value}
      </span>
    </div>
  );
}
