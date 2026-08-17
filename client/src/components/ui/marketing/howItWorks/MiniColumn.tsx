interface MiniColumnProps {
  title: string;
  count: string;
  tasks: string[];
  active?: boolean;
}

export function MiniColumn({
  title,
  count,
  tasks,
  active = false,
}: MiniColumnProps) {
  return (
    <div className="bg-[#0c0c0c] p-4">
      <div className="flex items-center justify-between">
        <span
          className={
            active
              ? "font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-300"
              : "font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-600"
          }
        >
          {title}
        </span>

        <span className="font-mono text-[9px] text-neutral-700">{count}</span>
      </div>

      <div className="mt-3 space-y-2">
        {tasks.map((task, index) => (
          <div
            key={task}
            className={
              active && index === 0
                ? "border border-rose-500/40 bg-[#101010] px-3 py-2.5"
                : "border border-neutral-800 bg-[#101010] px-3 py-2.5"
            }
          >
            <div className="flex items-center gap-2">
              <span
                className={
                  active && index === 0
                    ? "h-1.5 w-1.5 bg-rose-500"
                    : "h-1.5 w-1.5 bg-neutral-700"
                }
              />

              <span className="font-mono text-[9px] text-neutral-500">
                {task}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
