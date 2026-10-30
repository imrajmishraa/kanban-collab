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
    <div className="grid gap-3 border-b border-(--hairline) px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="h-1.5 w-1.5 bg-(--text-subtle)" />

          <p className="truncate text-xs text-(--text-soft)">{title}</p>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-wider text-(--text-subtle)">
            {status}
          </span>

          <span
            className={
              priority === "HIGH"
                ? "font-mono text-[9px] uppercase tracking-wider text-(--danger)"
                : "font-mono text-[9px] uppercase tracking-wider text-(--text-subtle)"
            }
          >
            {priority}
          </span>
        </div>
      </div>

      <span className="font-mono text-[10px] text-(--text-subtle)">{due}</span>
    </div>
  );
}
