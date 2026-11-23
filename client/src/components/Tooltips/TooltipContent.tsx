import type { CSSProperties } from "react";
import { cn } from "@/utils/cn";
import type { TooltipProps, PlacementState } from "./types"; // Import PlacementState
import {
  SHAPE_CLASS,
  TONE_CLASS,
  SIZE_CLASS,
  THEME_CLASS,
  ARROW_CLASS,
  THEME_ARROW_CLASS,
  INVERTED_SHAPES,
  THEME_HIGHLIGHT_CLASS,
} from "./constants";

interface TooltipContentProps extends Pick<
  TooltipProps,
  | "label"
  | "description"
  | "shortcut"
  | "highlight"
  | "shape"
  | "tone"
  | "theme"
  | "size"
  | "align"
  | "caret"
  | "bubbleClassName"
  | "height"
  | "maxHeight"
> {
  id: string;
  pos: PlacementState | null; // FIXED: Used PlacementState here
  placed: boolean;
  style: CSSProperties;
  followCursor: boolean;
}

export function TooltipContent({
  id,
  label,
  description,
  shortcut,
  highlight,
  shape = "default",
  tone = "neutral",
  theme = "auto",
  size = "md",
  align = "left",
  caret = "auto",
  bubbleClassName,
  height,
  maxHeight,
  pos,
  placed,
  style,
  followCursor,
}: TooltipContentProps) {
  const highlightClass =
    theme !== "auto"
      ? THEME_HIGHLIGHT_CLASS[theme]
      : INVERTED_SHAPES.has(shape)
        ? "text-(--inverse-accent)"
        : "text-(--accent)";

  return (
    <span
      id={id}
      role="tooltip"
      style={{
        ...style,
        ...(placed && pos ? pos.style : { visibility: "hidden" }),
      }}
      className={cn(
        "pointer-events-none fixed z-999",
        "max-w-[min(60vw,18rem)] whitespace-normal",
        height !== undefined && "flex items-center overflow-hidden",
        maxHeight !== undefined && "overflow-hidden",
        "border border-(--inverse-border) bg-(--inverse-bg) text-(--inverse-text)",
        "text-[11px] font-medium tracking-[0.01em]",
        align === "center" && "text-center",
        align === "right" && "text-right",
        SHAPE_CLASS[shape],
        TONE_CLASS[tone],
        SIZE_CLASS[size],
        THEME_CLASS[theme],
        "transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "motion-reduce:transition-none",
        placed
          ? "scale-100 opacity-100"
          : "scale-[0.96] opacity-0 motion-reduce:scale-100",
        bubbleClassName,
      )}
    >
      <span className="flex items-center gap-2.5">
        <span className="flex min-w-0 flex-col">
          <span>
            {label}
            {highlight && (
              <span
                className={cn("ml-1 font-medium capitalize", highlightClass)}
              >
                {highlight}
              </span>
            )}
          </span>
          {description && (
            <span className="mt-0.5 text-[0.9em] font-normal opacity-65">
              {description}
            </span>
          )}
        </span>
        {shortcut && shortcut.length > 0 && (
          <span className="flex shrink-0 gap-1">
            {shortcut.map((k) => (
              <kbd
                key={k}
                className="rounded-sm border border-current/20 px-1 font-mono text-[10px] leading-4 opacity-75"
              >
                {k}
              </kbd>
            ))}
          </span>
        )}
      </span>

      {caret !== "none" && !followCursor && (
        <span
          aria-hidden
          style={placed && pos ? pos.arrow : undefined}
          className={cn(
            "absolute size-2 rotate-45 rounded-[3px]",
            ARROW_CLASS[shape],
            THEME_ARROW_CLASS[theme],
            pos?.side === "bottom" && "border-t border-l",
            pos?.side === "top" && "border-r border-b",
            pos?.side === "right" && "border-b border-l",
            pos?.side === "left" && "border-t border-r",
          )}
        />
      )}
    </span>
  );
}
