import { HugeiconsIcon } from "@hugeicons/react";
import { RadarIcon, ServerStack01Icon } from "@hugeicons/core-free-icons";

import { PEERS } from "./flowData";

/* ═══════════════════════════════════════════════════════════════
   PEER FIELD — sync server at the centre, connected peers around it
   ═══════════════════════════════════════════════════════════════ */

export default function PeerField() {
  return (
    <div className="border-b border-white/6 p-4 sm:p-6 lg:border-b-0 lg:border-r">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={RadarIcon}
            size={13}
            className="text-(--brand)"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45 sm:text-[11px]">
            Live peers
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30 sm:text-[10px]">
          4 connected
        </span>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-lg border border-white/6 bg-[#050507]">
        {/* Dotted grid inside */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.10) 0.7px, transparent 0.7px)",
            backgroundSize: "24px 24px",
            maskImage:
              "radial-gradient(ellipse 80% 80% at 50% 50%, #000 0%, transparent 88%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 80% at 50% 50%, #000 0%, transparent 88%)",
          }}
        />

        {/* Centre node — sync server */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-(--brand)/40 bg-(--brand)/10">
            <span className="flow-ping absolute inset-0 rounded-full border border-(--brand)/25" />
            <span className="absolute -inset-2 rounded-full border border-(--brand)/10" />
            <HugeiconsIcon
              icon={ServerStack01Icon}
              size={20}
              className="text-(--brand)"
            />
          </div>
        </div>

        {/* Connectors — dashed lines from the centre to each peer */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {PEERS.map((peer) => (
            <line
              key={peer.initials}
              x1="50"
              y1="50"
              x2={parseFloat(peer.x)}
              y2={parseFloat(peer.y)}
              stroke="var(--brand)"
              strokeWidth="0.25"
              strokeDasharray="1.5 2"
              opacity="0.4"
              className="flow-dash"
            />
          ))}
        </svg>

        {/* Peer chips */}
        {PEERS.map((peer, i) => (
          <div
            key={peer.initials}
            className={`absolute ${PEER_FLOAT[i]}`}
            style={{ left: peer.x, top: peer.y }}
          >
            <div className="-translate-x-1/2 -translate-y-1/2">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#050507] font-mono text-[9px] text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] ${peer.color}`}
                >
                  {peer.initials}
                </span>
                {/* Plain chip — a backdrop-blur here would force a
                    per-frame filter pass for no visible gain */}
                <span className="rounded-full border border-white/10 bg-[#0B0B0F] px-2 py-0.5 font-mono text-[9px] text-white/70">
                  {peer.label}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Each peer drifts on its own offset loop (see collaborationFlow.css) */
const PEER_FLOAT = [
  "peer-float-a",
  "peer-float-b",
  "peer-float-c",
  "peer-float-d",
];
