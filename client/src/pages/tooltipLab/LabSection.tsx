export function LabSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-(--hairline) py-6">
      <h2 className="text-[13px] font-semibold tracking-[0.02em] text-(--text-primary)">
        {title}
      </h2>
      {note ? (
        <p className="mt-1 max-w-[70ch] text-[12px] text-(--text-muted)">
          {note}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-2">{children}</div>
    </section>
  );
}
