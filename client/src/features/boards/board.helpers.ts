import type { BoardCard, BoardColumn } from "@/types/api/dashboard/board";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** A person shown on a card. Only `id` is guaranteed by the API. */
export interface BoardMember {
  id: string;
  name?: string;
  /** Profile image URL; the avatar falls back to initials when absent. */
  avatarUrl?: string | null;
  color: string;
}

export type SortKey = "manual" | "dueDate" | "title";
export type ViewMode = "board" | "list";

/* ------------------------------------------------------------------ */
/*  Shared class tokens — mirror the dashboard's panel language        */
/* ------------------------------------------------------------------ */

export const ui = {
  /** Rounded panel on the ChaiUI near-black surface with a warm hairline. */
  panel:
    "relative overflow-hidden rounded-xl border border-(--hairline) bg-(--tint-3)",
  panelHover:
    "transition-colors duration-200 hover:border-(--hairline-strong) hover:bg-(--tint-5)",
  /** Kept for call sites that still render it, but flat: ChaiUI panels carry
      no gradient glint, the hairline border does the work. */
  hairline: "hidden",
  /** Small uppercase mono label used above headings: caps are fine for data. */
  eyebrow:
    "font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-(--text-muted)",
  /** Outline action, mirrored corners, the partner to the solid primary. */
  pill: "inline-flex cursor-pointer items-center gap-2 rounded-none rounded-tl-lg rounded-br-lg border border-(--hairline-strong) px-4 py-2 text-[12px] text-(--text-primary) transition-colors duration-200 hover:border-(--hairline-strong) hover:bg-(--tint-4) hover:text-(--text-primary)",
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
