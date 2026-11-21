import { useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { LayersIcon } from "@hugeicons/core-free-icons";

/** Two-letter monogram, for a workspace that has not uploaded an avatar. */
function monogram(name: string): string {
  return name
    .replace(/[^\p{L}\p{N} ]/gu, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

interface WorkspaceAvatarTileProps {
  name: string | null;
  imageUrl: string | null;
}

/**
 * The workspace a notification came from, at the head of its row.
 *
 * Deliberately the same tile the workspace switcher draws — uploaded avatar,
 * else the monogram — so one workspace looks like itself everywhere in the app.
 * A notification whose workspace is not in the loaded page still gets a tile,
 * the neutral one, rather than a hole in the row.
 */
export function WorkspaceAvatarTile({
  name,
  imageUrl,
}: WorkspaceAvatarTileProps) {
  const [failed, setFailed] = useState(false);

  const base =
    "mt-0.5 flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-(--hairline) bg-(--tint-6) text-[10px] font-semibold uppercase text-(--text-soft)";

  if (imageUrl && !failed) {
    return (
      <span className={base} aria-hidden="true">
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      </span>
    );
  }

  return (
    <span className={base} aria-hidden="true">
      {name ? (
        monogram(name)
      ) : (
        <HugeiconsIcon icon={LayersIcon} size={13} strokeWidth={1.6} />
      )}
    </span>
  );
}
