import type { CSSProperties } from "react";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertSquareIcon, Cancel01Icon } from "@hugeicons/core-free-icons";

/** Where the bubble sits relative to the field it belongs to. */
export type FieldErrorPlacement = "bottom" | "top" | "left" | "right";

/** Three steps, so a long message and a short one can both be tuned. */
export type FieldErrorSize = "sm" | "md" | "lg";

interface FieldErrorProps {
  id: string;
  message?: string;
  /** Which edge of the field the bubble hangs from. Default `bottom`. */
  placement?: FieldErrorPlacement;
  /** Type and padding scale. Default `md`. */
  size?: FieldErrorSize;
  /** Any CSS length, or a number for px. Overrides the placement's default. */
  width?: string | number;
  /** Any CSS length, or a number for px. Content sets the height when unset. */
  height?: string | number;
  /** Called when the close button is pressed. Omit it and no button renders. */
  onDismiss?: () => void;
}

/**
 * Per-placement chrome.
 *
 * Each entry is the anchor, the caret and which two borders the caret keeps —
 * a diamond whose visible sides have to match the edge it is poking out of, or
 * the seam shows as a pale line across the corner.
 */
const PLACEMENT: Record<FieldErrorPlacement, { box: string; caret: string }> = {
  bottom: {
    box: "top-full left-0 right-0 mt-2",
    caret: "top-[-4.5px] left-4 border-t border-l",
  },
  top: {
    box: "bottom-full left-0 right-0 mb-2",
    caret: "bottom-[-4.5px] left-4 border-r border-b",
  },
  right: {
    box: "top-0 left-full ml-2 w-max max-w-[min(18rem,60vw)]",
    caret: "top-4 left-[-4.5px] border-b border-l",
  },
  left: {
    box: "top-0 right-full mr-2 w-max max-w-[min(18rem,60vw)]",
    caret: "top-4 right-[-4.5px] border-t border-r",
  },
};

const SIZES: Record<
  FieldErrorSize,
  { box: string; text: string; icon: number }
> = {
  sm: { box: "gap-1.5 px-2 py-1.5", text: "text-[11.5px]", icon: 13 },
  md: { box: "gap-2 px-2.5 py-2", text: "text-[12.5px]", icon: 15 },
  lg: { box: "gap-2.5 px-3 py-2.5", text: "text-[13.5px]", icon: 17 },
};

/** A number means px; a string is passed through as a CSS length. */
const toLength = (value?: string | number) =>
  typeof value === "number" ? `${value}px` : value;

/**
 * A field's error, as a bubble rather than a line of red text.
 *
 * Dark on a light form, which is the one place in the auth flow where the ink
 * inverts — an error should look like a thing that arrived, not like another
 * paragraph. The caret points back at the field it belongs to, and the mark is
 * the accent from the inverse scale, so the whole bubble stays legible in
 * either theme.
 *
 * Absolutely positioned, so it takes no space in the column: a bubble that
 * pushes the form down resizes the whole card every time an address is
 * mistyped, and the card is centred — so the page jumps. The bubble itself is
 * `pointer-events-none` so the field it covers stays clickable; the close
 * button opts back in, which is the only part that should catch a click.
 *
 * Dismissal is local state, and it resets whenever `message` changes — so a new
 * error reopens the bubble, while the same error stays closed until the field
 * is touched again. Pass `onDismiss` to also clear the error in the form.
 */
export function FieldError({
  id,
  message,
  placement = "bottom",
  size = "md",
  width,
  height,
  onDismiss,
}: FieldErrorProps) {
  const [dismissed, setDismissed] = useState(false);
  const [lastMessage, setLastMessage] = useState(message);

  // A different message is a different complaint: show it again.
  if (message !== lastMessage) {
    setLastMessage(message);
    if (dismissed) setDismissed(false);
  }

  if (!message || dismissed) return null;

  const chrome = PLACEMENT[placement];
  const scale = SIZES[size];

  const sizing: CSSProperties = {
    width: toLength(width),
    height: toLength(height),
  };

  return (
    <div
      id={id}
      role="alert"
      style={sizing}
      className={[
        "pointer-events-none absolute z-20 flex items-start rounded-lg",
        "border border-(--inverse-border) bg-(--inverse-bg) text-(--inverse-text)",
        "shadow-[0_12px_28px_-14px_rgba(0,0,0,0.5)]",
        chrome.box,
        scale.box,
      ].join(" ")}
    >
      <HugeiconsIcon
        icon={AlertSquareIcon}
        size={scale.icon}
        strokeWidth={2.2}
        aria-hidden="true"
        className="mt-px shrink-0 text-(--inverse-accent)"
      />

      <p className={["min-w-0 flex-1", scale.text, "leading-[1.45]"].join(" ")}>
        {message}
      </p>

      {onDismiss ? (
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            onDismiss();
          }}
          aria-label="Dismiss this error"
          className="pointer-events-auto -mt-0.5 -mr-0.5 grid size-5 shrink-0 place-items-center rounded text-(--inverse-text) opacity-55 transition-opacity duration-150 hover:bg-(--inverse-text)/12 hover:opacity-100 focus-visible:ring-1 focus-visible:ring-(--inverse-text) focus-visible:outline-hidden"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={11} strokeWidth={2.6} />
        </button>
      ) : null}

      {/* the caret, back to the field */}
      <span
        aria-hidden="true"
        className={[
          "absolute size-2 rotate-45 border-(--inverse-border) bg-(--inverse-bg)",
          chrome.caret,
        ].join(" ")}
      />
    </div>
  );
}
