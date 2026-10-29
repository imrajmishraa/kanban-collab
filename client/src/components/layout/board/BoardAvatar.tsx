import { useState } from "react";

import { avatarColor, initials } from "@/features/boards/board.helpers";

import type { BoardMember } from "@/features/boards/board.helpers";

interface AvatarProps {
  member: BoardMember;
  size?: number;
  ring?: boolean;
}

export function Avatar({ member, size = 24, ring = true }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  /* An id is not a name: initials of "6a5e29c4…" render as garbage, so fall
     back to a neutral glyph instead. */
  const label = member.name?.trim() || "Member";
  const image = member.avatarUrl;

  const shared =
    "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold";
  const style = {
    width: size,
    height: size,
    fontSize: Math.round(size * 0.4),
    boxShadow: ring ? "0 0 0 2px var(--bg-root)" : undefined,
  };

  if (image && !imageFailed) {
    return (
      <span title={label} className={shared} style={style}>
        <img
          src={image}
          alt=""
          className="size-full object-cover"
          onError={() => setImageFailed(true)}
        />
      </span>
    );
  }

  return (
    <span
      title={label}
      className={`${shared} text-black`}
      style={{ ...style, background: member.color }}
    >
      {initials(label)}
    </span>
  );
}

interface AvatarStackProps {
  /** Optional — some card payloads omit this field entirely. */
  ids?: string[];
  size?: number;
  max?: number;
}

/** Renders avatars for raw member ids — color/initials derive from the id. */
export function AvatarStack({ ids, size = 24, max = 3 }: AvatarStackProps) {
  const list = ids ?? [];
  if (list.length === 0) return null;

  const shown = list.slice(0, max);
  const extra = list.length - shown.length;

  return (
    <div className="flex items-center">
      {shown.map((id, index) => (
        <span key={id} style={{ marginLeft: index === 0 ? 0 : -6 }}>
          <Avatar member={{ id, color: avatarColor(id) }} size={size} />
        </span>
      ))}

      {extra > 0 && (
        <span
          className="inline-flex items-center justify-center rounded-full border border-orange-50/15 bg-white/6 font-mono text-neutral-400"
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
