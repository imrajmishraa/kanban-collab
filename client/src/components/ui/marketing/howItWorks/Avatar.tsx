interface AvatarProps {
  label: string;
  active?: boolean;
}

export function Avatar({ label, active = false }: AvatarProps) {
  return (
    <span
      className={
        active
          ? "flex h-6 w-6 items-center justify-center border border-rose-500 bg-[#101010] font-mono text-[9px] text-rose-500"
          : "flex h-6 w-6 items-center justify-center border border-neutral-700 bg-[#101010] font-mono text-[9px] text-neutral-500"
      }
    >
      {label}
    </span>
  );
}
