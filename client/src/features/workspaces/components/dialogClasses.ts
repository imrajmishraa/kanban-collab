/**
 * The dialog form's four class strings.
 *
 * They were written out in both `board-dialogs.tsx` and `workspace-dialogs.tsx`,
 * byte for byte. One copy, so a change to the input ring happens once.
 */
export const inputClass =
  "w-full rounded-lg border border-(--hairline) bg-(--tint-3) px-3 py-2 text-[13px] text-(--text-primary) placeholder:text-(--text-subtle) outline-hidden transition-colors duration-200 hover:border-(--hairline-strong) focus:border-(--border-strong) focus:bg-(--tint-5) focus-visible:outline-hidden";

export const labelClass = "text-[11px] font-medium text-(--text-soft)";

export const cancelClass =
  "flex h-9 cursor-pointer items-center rounded-none rounded-tl-lg rounded-br-lg border border-(--hairline-strong) px-4 text-[12px] text-(--text-soft) transition-colors duration-200 hover:border-(--hairline-strong) hover:bg-(--tint-4) hover:text-(--text-primary)";

export const submitClass =
  "flex h-9 cursor-pointer items-center gap-1.5 rounded-none rounded-tr-lg rounded-bl-lg bg-(--solid-bg) px-4 text-[12px] font-semibold text-(--solid-text) transition-colors duration-200 hover:bg-(--solid-bg-hover) disabled:cursor-not-allowed disabled:opacity-50";
