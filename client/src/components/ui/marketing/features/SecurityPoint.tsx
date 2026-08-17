interface SecurityPointProps {
  title: string;
  description: string;
}

export function SecurityPoint({ title, description }: SecurityPointProps) {
  return (
    <div className="border-b border-neutral-800 py-5 last:border-b-0">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-rose-500"
        />

        <div>
          <h3 className="font-mono text-xs font-semibold text-neutral-300">
            {title}
          </h3>

          <p className="mt-2 max-w-lg text-xs leading-6 text-neutral-600">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
