import type { Board } from "@/types/api/dashboard/board";

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function parseDate(
  value: string | Date | null | undefined,
): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export interface BoardGroup {
  label: string;
  boards: Board[];
}

export function groupBoardsByTime(boards: Board[]): BoardGroup[] {
  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = new Date(todayStart.getTime() - MS_PER_DAY);
  const sevenDaysAgo = new Date(todayStart.getTime() - 7 * MS_PER_DAY);
  const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * MS_PER_DAY);

  const buckets: Record<string, Board[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 days": [],
    "Previous 30 days": [],
    Older: [],
  };

  for (const board of boards) {
    const parsed = parseDate(board.updatedAt ?? board.createdAt);
    if (!parsed) {
      buckets.Older.push(board);
      continue;
    }
    const t = parsed.getTime();
    if (t >= todayStart.getTime()) buckets.Today.push(board);
    else if (t >= yesterdayStart.getTime()) buckets.Yesterday.push(board);
    else if (t >= sevenDaysAgo.getTime())
      buckets["Previous 7 days"].push(board);
    else if (t >= thirtyDaysAgo.getTime())
      buckets["Previous 30 days"].push(board);
    else buckets.Older.push(board);
  }

  return Object.entries(buckets)
    .filter(([, list]) => list.length > 0)
    .map(([label, list]) => ({ label, boards: list }));
}
