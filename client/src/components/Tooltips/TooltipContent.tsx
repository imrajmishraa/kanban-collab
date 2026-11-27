import { forwardRef, useState, type CSSProperties } from "react";
import { announce } from "@/lib/announce";
import { cn } from "@/lib/cn";
import type { TooltipProps, PlacementState } from "./types"; // Import PlacementState
import {
  CARETLESS_SHAPES,
  shapeClass,
  TONE_CLASS,
  SIZE_CLASS,
  THEME_CLASS,
  TONE_TEXT_CLASS,
  ARROW_CLASS,
  ENTER_OFFSET,
  ARROW_TONE_CLASS,
  THEME_ARROW_CLASS,
  INVERTED_SHAPES,
  THEME_HIGHLIGHT_CLASS,
} from "./constants";

/**
 * Copy, and say so.
 *
 * The announcement is the point: the bubble may close before a screen reader could read a
 * visual change, so `announce()` speaks it instead.
 */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          announce("Copied to clipboard");
          window.setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="rounded border border-current/25 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide opacity-80 hover:opacity-100"
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}

/** The leading slot: a spinner, an avatar or an icon — nothing when none is asked for. */
function Leading({
  icon,
  loading,
  avatar,
}: {
  icon?: React.ReactNode;
  loading?: boolean;
  avatar?: { src: string; alt?: string };
}) {
  if (!icon && !loading && !avatar) return null;

  return (
    <span className="mr-1.5 inline-flex items-center">
      {loading ? (
        <span
          aria-hidden
          className="size-3 animate-spin rounded-full border border-current border-t-transparent"
        />
      ) : avatar ? (
        <img
          src={avatar.src}
          alt={avatar.alt ?? ""}
          className="size-4 rounded-full object-cover"
        />
      ) : (
        icon
      )}
    </span>
  );
}

/** `12` → `12px`, `"12rem"` stays as it is. */
const px = (v: number | string) => (typeof v === "number" ? `${v}px` : v);

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
  | "width"
  | "maxWidth"
  | "maxLines"
  | "descriptionTone"
  | "icon"
  | "loading"
  | "avatar"
  | "actions"
  | "copyValue"
> {
  id: string;
  pos: PlacementState | null; // FIXED: Used PlacementState here
  placed: boolean;
  style: CSSProperties;
  followCursor: boolean;
  /** The bubble is the portalled element itself, so it carries the ref and the id. */
  interactive?: boolean;
  onBubbleEnter?: () => void;
  onBubbleLeave?: () => void;
  /** Render into the top layer with the popover API. */
  topLayer?: boolean;
  /** Glide between positions instead of jumping. */
  morph?: boolean;
  /** A nudge towards the pointer, when the bubble is magnetic. */
  magnet?: { x: number; y: number };
  /** Fading out — kept mounted for the exit, then removed. */
  closing?: boolean;
}

export const TooltipContent = forwardRef<HTMLSpanElement, TooltipContentProps>(
  function TooltipContent(
    {
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
      width,
      maxWidth,
      maxLines,
      descriptionTone,
      icon,
      loading,
      avatar,
      actions,
      copyValue,
      pos,
      placed,
      style,
      followCursor,
      interactive,
      onBubbleEnter,
      onBubbleLeave,
      closing,
      topLayer,
      morph,
      magnet,
    },
    ref,
  ) {
    const hasExtras =
      Boolean(description) || Boolean(shortcut && shortcut.length > 0);

    const highlightClass =
      theme !== "auto"
        ? THEME_HIGHLIGHT_CLASS[theme]
        : INVERTED_SHAPES.has(shape)
          ? "text-(--inverse-accent)"
          : "text-(--accent)";

    return (
      <span
        ref={ref}
        id={id}
        role="tooltip"
        data-interactive={interactive ? "true" : undefined}
        /* The popover attribute puts the bubble in the top layer, above every z-index in the
           app. Supported browsers show it; the others ignore the attribute. */
        {...(topLayer ? { popover: "manual" as const } : {})}
        data-side={pos?.side}
        data-closing={closing ? "true" : undefined}
        onMouseEnter={onBubbleEnter}
        onMouseLeave={onBubbleLeave}
        style={{
          /* A few pixels towards the pointer, when the bubble is magnetic. */
          ...(magnet ? { marginLeft: magnet.x, marginTop: magnet.y } : {}),
          /* Main set these on the bubble; the refactor kept the props and dropped the
             styles, so a `maxWidth` bubble wrapped nowhere. */
          ...(width !== undefined && { width: px(width) }),
          ...(maxWidth !== undefined && { maxWidth: px(maxWidth) }),
          ...style,
          ...(placed && pos ? pos.style : { visibility: "hidden" }),
        }}
        className={cn(
          interactive ? "pointer-events-auto" : "pointer-events-none",
          "fixed z-999",
          "max-w-[min(60vw,18rem)] whitespace-normal",
          height !== undefined && "flex items-center overflow-hidden",
          maxHeight !== undefined && "overflow-hidden",
          "border border-(--inverse-border) bg-(--inverse-bg) text-(--inverse-text)",
          "text-[11px] font-medium tracking-[0.01em]",
          align === "center" && "text-center",
          align === "right" && "text-right",
          shapeClass(shape, pos?.side),
          TONE_CLASS[tone],
          SIZE_CLASS[size],
          THEME_CLASS[theme],
          morph
            ? "transition-[opacity,transform,top,left] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
            : "transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "motion-reduce:transition-none",
          /* Arriving: from the anchor's side. Leaving: same place, quicker. */
          placed && !closing
            ? "translate-x-0 translate-y-0 scale-100 opacity-100"
            : cn(
                "scale-[0.96] opacity-0",
                !closing && pos?.side ? ENTER_OFFSET[pos.side] : null,
                "motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100",
              ),
          bubbleClassName,
        )}
      >
        {/*
         * The ordinary bubble is exactly what it was before this refactor: the label,
         * the accent phrase, nothing else — no wrapper, no flex row, no extra line.
         * The richer layout (description line, shortcut keys) only exists when a call
         * site actually asks for one of them.
         */}
        {hasExtras ? (
          <span className="flex items-center gap-2.5">
            <Leading icon={icon} loading={loading} avatar={avatar} />
            <span className="flex min-w-0 flex-col">
              <span>
                {label}
                {highlight && (
                  <span
                    className={cn(
                      "ml-1 font-medium capitalize",
                      highlightClass,
                    )}
                  >
                    {highlight}
                  </span>
                )}
              </span>
              {description && (
                <span
                  className={cn(
                    "mt-0.5 text-[0.9em] font-normal opacity-65",
                    descriptionTone && TONE_TEXT_CLASS[descriptionTone],
                  )}
                  style={
                    maxLines
                      ? {
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: maxLines,
                          overflow: "hidden",
                        }
                      : undefined
                  }
                >
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
        ) : (
          <>
            {label}
            {highlight && (
              <span
                className={cn("ml-1 font-medium capitalize", highlightClass)}
              >
                {highlight}
              </span>
            )}
          </>
        )}

        {(copyValue || actions) && (
          <span className="mt-1.5 flex items-center gap-1.5 border-t border-current/15 pt-1.5">
            {copyValue && <CopyButton value={copyValue} />}
            {actions}
          </span>
        )}

        {caret !== "none" && !followCursor && !CARETLESS_SHAPES.has(shape) && (
          <span
            aria-hidden
            style={placed && pos ? pos.arrow : undefined}
            className={cn(
              "absolute size-2 rotate-45 rounded-[3px]",
              ARROW_CLASS[shape],
              ARROW_TONE_CLASS[tone],
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
  },
);
