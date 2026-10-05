import { initials } from "@/features/boards/board.helpers";

interface PresencePeer {
  userId: string;
  name?: string;
  color?: string;
}

interface BoardPresenceProps {
  peers: PresencePeer[];
  status: string;
}

function statusColor(status: string): string {
  if (status === "connected") return "var(--success)";
  if (status === "connecting" || status === "reconnecting")
    return "var(--warning)";
  return "var(--text-muted)";
}

/**
 * Collaboration presence — a live dot, an online count, and the avatars
 * of remote peers. Rendered inside the board header.
 */
export default function BoardPresence({ peers, status }: BoardPresenceProps) {
  const label = status === "connected" ? `${peers.length + 1} online` : status;

  return (
    <div className="flex items-center gap-3">
      <span className="hidden items-center gap-1.5 sm:flex">
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full"
          style={{ background: statusColor(status) }}
        />
        <span className="font-mono text-[9px] uppercase tracking-wider text-(--text-muted)">
          {label}
        </span>
      </span>

      {peers.length > 0 && (
        <div className="flex items-center">
          {peers.slice(0, 4).map((peer, index) => (
            <span
              key={peer.userId}
              title={peer.name ?? peer.userId}
              style={{ marginLeft: index === 0 ? 0 : -6 }}
            >
              <span
                className="inline-flex size-6 items-center justify-center rounded-full font-mono text-[9px] font-semibold text-black"
                style={{
                  background: peer.color ?? "#8a94a6",
                  boxShadow: "0 0 0 2px var(--bg-root)",
                }}
              >
                {initials(peer.name ?? peer.userId)}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
