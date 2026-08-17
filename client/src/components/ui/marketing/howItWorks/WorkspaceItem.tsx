interface WorkspaceItemProps {
  label: string;
  value: string;
}

export function WorkspaceItem({ label, value }: WorkspaceItemProps) {
  return (
    <div className="bg-[#0c0c0c] p-4">
      <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-700">
        {label}
      </p>

      <p className="mt-2 font-mono text-xs text-neutral-300">{value}</p>
    </div>
  );
}
