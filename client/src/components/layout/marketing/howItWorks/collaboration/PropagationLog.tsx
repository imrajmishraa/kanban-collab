import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon } from "@hugeicons/core-free-icons";

import { EVENTS, type EventItem } from "./flowData";

/* ═══════════════════════════════════════════════════════════════
   PROPAGATION LOG — the live event timeline beside the peer field
   ═══════════════════════════════════════════════════════════════ */

export default function PropagationLog() {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={FlashIcon} size={13} className="text-(--brand)" />
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45 sm:text-[11px]">
            Propagation log
          </span>
        </div>
        <span className="font-mono text-[9px] text-white/30 sm:text-[10px]">
          realtime
        </span>
      </div>

      <ul className="space-y-2">
        {EVENTS.map((event, i) => (
          <EventRow key={i} {...event} />
        ))}
      </ul>

      {/* Live status footer */}
      <div className="mt-4 flex items-center gap-2 rounded-md border border-white/6 bg-white/2 px-3 py-2">
        <span className="flow-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="font-mono text-[10px] text-white/55">
          Listening for changes
        </span>
        <span className="ml-auto flex items-center gap-0.5">
          <span className="flow-blink h-1 w-1 rounded-full bg-white/40" />
          <span
            className="flow-blink h-1 w-1 rounded-full bg-white/40"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="flow-blink h-1 w-1 rounded-full bg-white/40"
            style={{ animationDelay: "300ms" }}
          />
        </span>
      </div>
    </div>
  );
}

/* ── One row in the log ────────────────────────────────────────── */

const STATUS_STYLES: Record<EventItem["status"], string> = {
  sent: "text-amber-400/80 border-amber-400/25 bg-amber-400/8",
  synced: "text-sky-400/80 border-sky-400/25 bg-sky-400/8",
  received: "text-emerald-400/80 border-emerald-400/25 bg-emerald-400/8",
};

const STATUS_LABELS: Record<EventItem["status"], string> = {
  sent: "Sent",
  synced: "Synced",
  received: "Received",
};

function EventRow({
  initials,
  name,
  color,
  action,
  task,
  time,
  status,
}: EventItem) {
  return (
    <li className="flex items-start gap-2.5 rounded-md border border-white/6 bg-white/2 p-2.5">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 font-mono text-[9px] text-white ${color}`}
      >
        {initials}
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-mono text-[11px] leading-[1.4] text-white/85">
          <span className="text-white/60">{name}</span> {action}{" "}
          <span className="text-white/70">{task}</span>
        </span>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-mono text-[9px] text-white/30">{time}</span>
          <span
            className={`rounded border px-1.5 py-px font-mono text-[8px] uppercase tracking-[0.12em] ${STATUS_STYLES[status]}`}
          >
            {STATUS_LABELS[status]}
          </span>
        </div>
      </div>
    </li>
  );
}
