interface ProductivityPointProps {
  number: string;
  title: string;
  description: string;
}

export function ProductivityPoint({
  number,
  title,
  description,
}: ProductivityPointProps) {
  return (
    <div className="grid grid-cols-[32px_1fr] gap-4 border-b border-(--hairline) py-5 last:border-b-0">
      <span className="font-mono text-[10px] text-(--text-subtle)">
        {number}
      </span>

      <div>
        <h3 className="font-mono text-xs font-semibold text-(--text-soft)">
          {title}
        </h3>

        <p className="mt-2 text-xs leading-6 text-(--text-subtle)">
          {description}
        </p>
      </div>
    </div>
  );
}
