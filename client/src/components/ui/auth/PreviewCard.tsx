export function PreviewCard({
  active,
  ghost,
}: {
  active?: boolean;
  ghost?: boolean;
}) {
  if (ghost) {
    return (
      <div className="flex h-9 items-center justify-center rounded border border-dashed border-(--brand)/30 bg-(--brand)/3">
        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-(--brand)/60">
          + card
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded border p-1.5 ${
        active
          ? "border-(--brand)/40 bg-(--brand)/6"
          : "border-white/6 bg-white/2"
      }`}
    >
      <div className="flex items-center gap-1">
        <span
          className={`h-1 w-1 rounded-full ${
            active ? "bg-(--brand)" : "bg-white/25"
          }`}
        />
        <span
          className={`h-1 rounded-full ${
            active ? "w-12 bg-(--brand)/50" : "w-10 bg-white/15"
          }`}
        />
      </div>
      <div className="mt-1.5 h-1 w-3/4 rounded-full bg-white/10" />
    </div>
  );
}
