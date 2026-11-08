/** The quiet line under a menu — "last edited", "3 people here". */
export default function Note({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="border-t border-(--hairline) px-2.5 py-2 sm:px-3.5 sm:py-2.5">
      <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--text-subtle)">
        {label}
      </div>
      {value ? (
        <div className="mt-0.5 text-[10px] text-(--text-muted) sm:text-[11.5px]">
          {value}
        </div>
      ) : null}
    </div>
  );
}
