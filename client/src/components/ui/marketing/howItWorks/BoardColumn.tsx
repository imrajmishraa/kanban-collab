import { GripVertical } from "lucide-react";

interface BoardColumnProps {
  title: string;
  count: string;
  tasks: string[];
  active?: boolean;
}

export function BoardColumn({
  title,
  count,
  tasks,
  active = false,
}: BoardColumnProps) {
  return (
    <div className="border border-neutral-800 bg-[#0c0c0c] p-3">
      {/* Column header */}
      <div className="mb-3 flex items-center justify-between">
        <span
          className={
            active
              ? "font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-300"
              : "font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-500"
          }
        >
          {title}
        </span>

        <span className="font-mono text-[9px] text-neutral-700">{count}</span>
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        {tasks.map((task, index) => (
          <div
            key={task}
            className="group border border-neutral-800 bg-[#101010] p-3"
          >
            <div className="flex items-start gap-2">
              <GripVertical
                size={12}
                strokeWidth={1.5}
                className="mt-0.5 shrink-0 text-neutral-800 transition-colors group-hover:text-neutral-600"
              />

              <div className="min-w-0">
                <p className="font-mono text-[10px] leading-5 text-neutral-400">
                  {task}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={
                      index === 0 && active
                        ? "h-1 w-1 bg-rose-500"
                        : "h-1 w-1 bg-neutral-700"
                    }
                  />

                  <span className="font-mono text-[8px] uppercase tracking-wider text-neutral-700">
                    {active ? "working" : "task"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
