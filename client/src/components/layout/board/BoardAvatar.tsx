import { useMemo, useState } from "react";

import { useActiveWorkspaceMembers } from "@/features/boards/hooks/useActiveWorkspaceMembers";

import { avatarColor, initials } from "@/features/boards/board.helpers";

import type { BoardMember } from "@/features/boards/board.helpers";

interface AvatarProps {
  member: BoardMember;
  size?: number;
  ring?: boolean;
}

export function Avatar({ member, size = 24, ring = true }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  /* Some callers only have a user id (card tiles, presence, card watchers).
     Resolving here means every avatar in the app shows the same name, image
     and initials as the comment thread, instead of only the places that
     happen to receive a full member object. */
  const directory = useActiveWorkspaceMembers();

  const resolved = useMemo(() => {
    if (member.name && member.avatarUrl) return member;

    const found = directory.find((item) => item.id === member.id);

    return found ? { ...found, color: member.color } : member;
  }, [directory, member]);

  /* An id is not a name: initials of "6a5e29c4…" render as garbage, and the
     word "Member" rendered as "ME", which read like a real person. An unknown
     member gets a question mark instead. */
  const label = resolved.name?.trim() || "?";
  const image = resolved.avatarUrl;

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
      <span
        title={label}
        className={`${shared} border border-orange-50/20 transition-transform duration-200 hover:scale-[1.04]`}
        style={style}
      >
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
      style={{ ...style, background: resolved.color }}
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
