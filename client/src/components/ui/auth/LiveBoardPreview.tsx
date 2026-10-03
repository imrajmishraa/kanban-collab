import { PreviewCard } from "./PreviewCard";

export function LiveBoardPreview() {
  const columns = [
    { title: "To do", count: 5, active: false },
    { title: "Doing", count: 3, active: true },
    { title: "Done", count: 12, active: false },
  ];

  return (
    <div className="mt-7 max-w-md">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#08080C] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        <div className="flex h-9 items-center justify-between border-b border-white/6 px-3.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-rose-500/70 bg-rose-500/10" />
            <span className="h-2 w-2 rounded-full border border-yellow-500/70 bg-yellow-500/10" />
            <span className="h-2 w-2 rounded-full border border-emerald-500/70 bg-emerald-500/10" />
          </div>
          <span className="font-mono text-[10px] text-white/40">sprint-04</span>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.15em] text-emerald-400">
            <span className="relative flex h-1 w-1">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1 w-1 rounded-full bg-emerald-400" />
            </span>
            5 online
          </span>
        </div>

        <div className="grid grid-cols-3 gap-px bg-white/4">
          {columns.map((col) => (
            <div key={col.title} className="bg-[#08080C] p-3">
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-1 w-1 rounded-full ${
                      col.active ? "bg-(--brand)" : "bg-white/20"
                    }`}
                  />
                  <span
                    className={`font-mono text-[9px] uppercase tracking-[0.18em] ${
                      col.active ? "text-(--brand)" : "text-white/40"
                    }`}
                  >
                    {col.title}
                  </span>
                </div>
                <span className="font-mono text-[8px] tabular-nums text-white/25">
                  {col.count}
                </span>
              </div>

              <div className="space-y-1.5">
                <PreviewCard active={col.active} />
                <PreviewCard />
                {col.active && <PreviewCard ghost />}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-white/6 px-3.5 py-2.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-(--brand) font-mono text-[7px] text-white">
            MA
          </span>
          <span className="truncate font-mono text-[10px] text-white/50">
            <span className="text-white/75">Maya</span> moved{" "}
            <span className="text-white/70">Auth flow</span> to Done
          </span>
          <span className="ml-auto shrink-0 font-mono text-[9px] text-white/30">
            just now
          </span>
        </div>
      </div>
    </div>
  );
}
