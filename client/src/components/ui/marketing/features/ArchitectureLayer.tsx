interface ArchitectureLayerProps {
  number: string;
  title: string;
  technologies: string[];
}

export function ArchitectureLayer({
  number,
  title,
  technologies,
}: ArchitectureLayerProps) {
  return (
    <div className="bg-[#0c0c0e] p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-neutral-700">{number}</span>

        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-emerald-500"
        />
      </div>

      <h3 className="mt-8 font-mono text-sm font-semibold text-neutral-300">
        {title}
      </h3>

      <div className="mt-4 flex flex-wrap gap-2">
        {technologies.map((technology) => (
          <span
            key={technology}
            className="border border-neutral-800 bg-[#101012] px-2.5 py-1.5 font-mono text-[10px] text-neutral-500"
          >
            {technology}
          </span>
        ))}
      </div>
    </div>
  );
}
