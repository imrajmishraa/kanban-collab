import type { BoardCard, BoardColumn } from "@/types/api/dashboard/board";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** A person shown on a card. Only `id` is guaranteed by the API. */
export interface BoardMember {
  id: string;
  name?: string;
  color: string;
}

export type SortKey = "manual" | "dueDate" | "title";
export type ViewMode = "board" | "list";

/* ------------------------------------------------------------------ */
/*  Shared class tokens — mirror the dashboard's panel language        */
/* ------------------------------------------------------------------ */

export const ui = {
  /** Rounded panel with the dashboard's white/opacity surface. */
  panel: "relative overflow-hidden rounded-xl border border-white/8 bg-white/4",
  panelHover:
    "transition-colors duration-200 hover:border-white/14 hover:bg-white/6",
  /** Gradient hairline that sits on the top edge of every panel. */
  hairline:
    "pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent",
  /** Small uppercase mono label used above headings. */
  eyebrow:
    "font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-(--text-muted)",
  /** Pill button — the dashboard's default secondary action. */
  pill: "inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/8 bg-white/6 px-4 py-2 font-mono text-[12px] text-(--text-primary) transition-colors duration-200 hover:bg-white/10",
} as const;

/* ------------------------------------------------------------------ */
/*  Deterministic colors — no hardcoded registries                     */
/* ------------------------------------------------------------------ */

const PALETTE = [
  "#ff6b35",
  "#4f9cf9",
  "#35d399",
  "#b07cff",
  "#f5b84b",
  "#f16b7a",
  "#2dd4bf",
  "#8a94a6",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Stable color for any string seed. */
export function colorFor(seed: string): string {
  return PALETTE[hashString(seed) % PALETTE.length];
}

/** Color for a label chip, derived from the label text. */
export function labelColor(label: string): string {
  return colorFor(`label:${label}`);
}

/** Color for a member avatar, derived from the member id. */
export function avatarColor(id: string): string {
  return colorFor(`user:${id}`);
}

/* ------------------------------------------------------------------ */
/*  Small utilities                                                    */
/* ------------------------------------------------------------------ */

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function uid(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rand}`;
}

export function isOverdue(value?: string): boolean {
  if (!value) return false;
  return new Date(value).getTime() < Date.now();
}

export function formatDue(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/** Compact relative time, e.g. "3h ago", "2d ago". */
export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "—";
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function reindex(cards: BoardCard[]): BoardCard[] {
  return cards.map((card, index) => ({ ...card, orderIndex: index }));
}

export function reindexColumns(columns: BoardColumn[]): BoardColumn[] {
  return columns.map((column, index) => ({ ...column, orderIndex: index }));
}
