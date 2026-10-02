import { type IconSvgElement } from "@hugeicons/react";
import {
  Cursor02Icon,
  LayersIcon,
  Refresh01Icon,
} from "@hugeicons/core-free-icons";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

export interface FlowStage {
  number: string;
  title: string;
  description: string;
  icon: IconSvgElement;
  active?: boolean;
}

export interface EventItem {
  initials: string;
  name: string;
  color: string;
  action: string;
  task: string;
  time: string;
  status: "sent" | "synced" | "received";
}

export interface PeerChip {
  initials: string;
  color: string;
  x: string;
  y: string;
  label: string;
}

/* ═══════════════════════════════════════════════════════════════
   SEEDED DATA
   ═══════════════════════════════════════════════════════════════ */

export const FLOW_STAGES: FlowStage[] = [
  {
    number: "01",
    title: "User action",
    description: "A teammate moves a card, edits a task, or updates the board.",
    icon: Cursor02Icon,
  },
  {
    number: "02",
    title: "Synchronization",
    description:
      "The change travels through the collaboration layer in milliseconds.",
    icon: Refresh01Icon,
    active: true,
  },
  {
    number: "03",
    title: "Shared state",
    description:
      "Every connected client receives the update — one board, in sync.",
    icon: LayersIcon,
  },
];

export const EVENTS: EventItem[] = [
  {
    initials: "RM",
    name: "Maya",
    color: "bg-(--brand)",
    action: "moved",
    task: "Auth flow → In progress",
    time: "just now",
    status: "received",
  },
  {
    initials: "RI",
    name: "Rio",
    color: "bg-sky-500",
    action: "edited",
    task: "Board layout",
    time: "12ms",
    status: "synced",
  },
  {
    initials: "SA",
    name: "Sam",
    color: "bg-pink-500",
    action: "completed",
    task: "Project init",
    time: "28ms",
    status: "sent",
  },
];

export const PEERS: PeerChip[] = [
  { initials: "RM", color: "bg-(--brand)", x: "18%", y: "26%", label: "Maya" },
  { initials: "RI", color: "bg-sky-500", x: "62%", y: "42%", label: "Rio" },
  { initials: "SA", color: "bg-pink-500", x: "34%", y: "68%", label: "Sam" },
  {
    initials: "NV",
    color: "bg-emerald-500",
    x: "78%",
    y: "72%",
    label: "Noah",
  },
];

export const TRANSPORT_STATS = [
  { label: "Protocol", value: "WS" },
  { label: "Latency", value: "42ms" },
  { label: "Peers", value: "04" },
];
