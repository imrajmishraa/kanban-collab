/** The plan chip: brand wash, brand line, mono caps — never a solid fill. */
export default function ProTag() {
  return (
    <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full border border-(--brand-line) bg-(--brand-wash) px-2 py-0.75 font-mono text-[9px] font-semibold uppercase tracking-widest text-(--brand)">
      <span className="size-1 rounded-full bg-(--brand)" />
      Pro
    </span>
  );
}
