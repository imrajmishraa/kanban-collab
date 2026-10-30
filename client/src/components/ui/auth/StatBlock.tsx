export function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-(--border) bg-(--tint-2) p-3">
      <div className="font-mono text-[15px] font-medium tracking-tight text-(--text-primary)">
        {value}
      </div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-(--text-primary)/35">
        {label}
      </div>
    </div>
  );
}
