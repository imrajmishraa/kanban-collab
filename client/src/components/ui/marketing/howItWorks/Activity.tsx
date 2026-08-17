interface ActivityProps {
  user: string;
  action: string;
  task: string;
  from?: string;
  to?: string;
  active?: boolean;
}

export function Activity({
  user,
  action,
  task,
  from,
  to,
  active = false,
}: ActivityProps) {
  return (
    <div
      className={
        active
          ? "border border-neutral-800 bg-[#101010] px-3 py-3"
          : "px-3 py-3"
      }
    >
      <div className="flex items-start gap-3">
        <span
          className={
            active
              ? "mt-1.5 h-1.5 w-1.5 shrink-0 bg-rose-500"
              : "mt-1.5 h-1.5 w-1.5 shrink-0 bg-neutral-700"
          }
        />

        <div className="min-w-0">
          <p className="font-mono text-[10px] leading-5 text-neutral-400">
            <span className="text-neutral-200">{user}</span> {action}{" "}
            <span className="text-neutral-300">{task}</span>
          </p>

          {from && to ? (
            <p className="mt-1 font-mono text-[9px] text-neutral-700">
              {from} → {to}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
