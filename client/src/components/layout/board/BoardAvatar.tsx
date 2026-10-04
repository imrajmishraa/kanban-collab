import { avatarColor, initials } from "@/features/boards/board.helpers";

import type { BoardMember } from "@/features/boards/board.helpers";

interface AvatarProps {
  member: BoardMember;
  size?: number;
  ring?: boolean;
}

export function Avatar({ member, size = 24, ring = true }: AvatarProps) {
  return (
    <span
      title={member.name ?? member.id}
      className="inline-flex shrink-0 items-center justify-center rounded-full font-mono font-semibold text-black"
      style={{
        width: size,
        height: size,
        background: member.color,
        fontSize: Math.round(size * 0.4),
        boxShadow: ring ? "0 0 0 2px var(--bg-root)" : undefined,
      }}
    >
      {initials(member.name ?? member.id)}
    </span>
  );
}

interface AvatarStackProps {
  ids: string[];
  size?: number;
  max?: number;
}

/** Renders avatars for raw member ids — color/initials derive from the id. */
export function AvatarStack({ ids, size = 24, max = 3 }: AvatarStackProps) {
  if (ids.length === 0) return null;

  const shown = ids.slice(0, max);
  const extra = ids.length - shown.length;

  return (
    <div className="flex items-center">
      {shown.map((id, index) => (
        <span key={id} style={{ marginLeft: index === 0 ? 0 : -6 }}>
          <Avatar member={{ id, color: avatarColor(id) }} size={size} />
        </span>
      ))}

      {extra > 0 && (
        <span
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/6 font-mono text-(--text-secondary)"
          style={{
            width: size,
            height: size,
            fontSize: Math.round(size * 0.36),
            marginLeft: -6,
            boxShadow: "0 0 0 2px var(--bg-root)",
          }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
