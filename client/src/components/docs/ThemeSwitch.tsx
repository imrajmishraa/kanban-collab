import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ComputerIcon,
  Moon02Icon,
  Sun03Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { useThemeStore } from "@/stores/theme";
import { cn } from "@/lib/cn";

const THEMES = [
  { mode: "light", label: "Light", icon: Sun03Icon },
  { mode: "dark", label: "Dark", icon: Moon02Icon },
  { mode: "system", label: "System", icon: ComputerIcon },
] as const;

export function ThemeSwitch({ compact = false }: { compact?: boolean }) {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const current = THEMES.find((item) => item.mode === mode) ?? THEMES[2];

  useEffect(() => {
    if (!open) return;

    const onDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Theme: ${current.label}`}
        className={cn(
          "flex cursor-pointer items-center gap-2.5 rounded-lg text-[14px]",
          "text-(--text-secondary) transition-colors duration-150",
          "hover:bg-(--tint-8) hover:text-(--text-primary)",
          compact ? "size-9 justify-center" : "w-full px-3 py-2",
        )}
      >
        <HugeiconsIcon
          icon={current.icon}
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
        />
        {compact ? null : current.label}
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute z-50 w-44 overflow-hidden rounded-xl border",
            "border-(--hairline) bg-(--bg-surface) p-1",
            "shadow-[0_18px_50px_-12px_rgba(0,0,0,0.28)]",
            /* Where it opens depends on where the control is. In the column it
               sits at the bottom, so the menu goes upward or it falls off the
               viewport. In the rail the button is only 56px wide and the menu
               is 176, so it opens to the side instead of hanging over the
               article. */
            compact ? "bottom-0 left-full ml-2" : "bottom-full left-0 mb-2",
          )}
        >
          {THEMES.map((item) => (
            <button
              key={item.mode}
              type="button"
              role="menuitemradio"
              aria-checked={item.mode === mode}
              onClick={(event) => {
                setMode(item.mode, event.currentTarget);
                setOpen(false);
              }}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between gap-3",
                "rounded-lg px-3 py-2 text-left text-[14px]",
                "transition-colors duration-150 hover:bg-(--tint-4)",
                item.mode === mode
                  ? "font-medium text-(--brand)"
                  : "text-(--text-secondary)",
              )}
            >
              {item.label}
              {item.mode === mode ? (
                <HugeiconsIcon icon={Tick02Icon} size={15} strokeWidth={2} />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ── The column ─────────────────────────────────────────────────────────── */
