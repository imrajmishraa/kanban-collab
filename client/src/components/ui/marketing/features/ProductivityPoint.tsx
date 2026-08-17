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
    <div className="grid grid-cols-[32px_1fr] gap-4 border-b border-neutral-800 py-5 last:border-b-0">
      <span className="font-mono text-[10px] text-neutral-700">{number}</span>

      <div>
        <h3 className="font-mono text-xs font-semibold text-neutral-300">
          {title}
        </h3>

        <p className="mt-2 text-xs leading-6 text-neutral-600">{description}</p>
      </div>
    </div>
  );
}
