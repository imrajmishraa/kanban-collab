import { useState, type ReactNode } from "react";

import { Tooltip } from "@/components/Tooltips/ToolTip";

/**
 * An error, said where the field is.
 *
 * A form that shows its errors at the top of the page makes the reader hunt for the field. The
 * error belongs on the field, and a tooltip is the smallest way to say it without moving
 * anything else on the page.
 */
export function FieldErrorTooltip({
  error,
  children,
  side = "right",
}: {
  /** `undefined` or `""` means valid — nothing is shown. */
  error?: string;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}) {
  const [touched, setTouched] = useState(false);
  const invalid = Boolean(error);

  return (
    <Tooltip
      label={error ?? ""}
      tone="danger"
      shape="callout"
      side={side}
      trigger="manual"
      open={invalid && touched}
      interactive
    >
      <span
        className="inline-flex"
        onFocus={() => setTouched(true)}
        onBlur={() => setTouched(false)}
      >
        {children}
      </span>
    </Tooltip>
  );
}
