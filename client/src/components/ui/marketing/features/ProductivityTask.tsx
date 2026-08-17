interface ProductivityTaskProps {
  title: string;
  status: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  due: string;
}

export function ProductivityTask({
  title,
  status,
  priority,
  due,
}: ProductivityTaskProps) {
  return (
    <div className="grid gap-3 border-b border-neutral-800 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="h-1.5 w-1.5 bg-neutral-700" />

          <p className="truncate text-xs text-neutral-300">{title}</p>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-700">
            {status}
          </span>

          <span
            className={
              priority === "HIGH"
                ? "font-mono text-[9px] uppercase tracking-wider text-rose-500"
                : "font-mono text-[9px] uppercase tracking-wider text-neutral-700"
            }
          >
            {priority}
          </span>
        </div>
      </div>

      <span className="font-mono text-[10px] text-neutral-600">{due}</span>
    </div>
  );
}
