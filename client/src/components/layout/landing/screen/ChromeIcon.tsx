import { STROKE } from "./Shared";

export default function ChromeIcon({
  d,
  size = 14,
  className,
}: {
  d: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...STROKE}>
      <path d={d} />
    </svg>
  );
}
