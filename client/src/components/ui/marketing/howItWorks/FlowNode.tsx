interface FlowNodeProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  active?: boolean;
}

export function FlowNode({
  number,
  icon,
  title,
  description,
  active = false,
}: FlowNodeProps) {
  return (
    <article className="bg-[#080808] p-6 sm:p-7 lg:p-8">
      <div className="flex items-center justify-between">
        <span
          className={
            active
              ? "font-mono text-[10px] text-rose-500"
              : "font-mono text-[10px] text-neutral-700"
          }
        >
          {number}
        </span>

        <div
          className={
            active
              ? "flex h-8 w-8 items-center justify-center border border-rose-500 text-rose-500"
              : "flex h-8 w-8 items-center justify-center border border-neutral-800 text-neutral-500"
          }
        >
          {icon}
        </div>
      </div>

      <h3 className="mt-8 font-mono text-sm font-bold uppercase tracking-[0.12em] text-neutral-200">
        {title}
      </h3>

      <p className="mt-4 font-mono text-[11px] leading-6 text-neutral-600">
        {description}
      </p>
    </article>
  );
}
