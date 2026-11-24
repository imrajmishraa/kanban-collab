import { LabChip as Chip } from "@/pages/tooltipLab/LabChip";
import { LabSection as Section } from "@/pages/tooltipLab/LabSection";
import { Tooltip } from "@/components/Tooltips/ToolTip";
import type { TooltipHandle } from "@/components/Tooltips/ToolTip";
import { announce } from "@/lib/announce";

/**
 * The three things a pointer cannot express: an accessible name, no wrapper span, and
 * opening from code.
 */
export function AccessibilitySections({
  imperative,
}: {
  imperative: React.RefObject<TooltipHandle | null>;
}) {
  return (
    <>
      <Section
        title="20 · Accessibility"
        note="labelledBy makes the tooltip the trigger's accessible name — for icon-only buttons. The live region announces actions like “Copied”."
      >
        <Chip
          labelledBy
          label="Search (this is the accessible name)"
          shortcut={["⌘", "K"]}
        >
          labelledBy
        </Chip>
        <button
          type="button"
          onClick={() => announce("Copied to clipboard")}
          className="rounded-lg bg-(--bg-hover) px-3 py-1.5 text-[12px] text-(--text-primary)"
        >
          announce “Copied”
        </button>
      </Section>

      <Section
        title="21 · asChild"
        note="No wrapper span: the handlers go on the child itself, so the button is the only box."
      >
        <Tooltip asChild label="no wrapper span around me">
          <button
            type="button"
            className="rounded-lg border border-(--hairline) bg-(--bg-card) px-3 py-1.5 text-[12px] text-(--text-secondary) hover:bg-(--bg-hover)"
          >
            asChild
          </button>
        </Tooltip>
      </Section>

      <Section
        title="22 · Imperative API"
        note="ref.open() / ref.close() — for a tour step or a validation message that a pointer cannot express."
      >
        <button
          type="button"
          onClick={() => {
            imperative.current?.open();
            window.setTimeout(() => imperative.current?.close(), 1500);
          }}
          className="rounded-lg bg-(--brand) px-3 py-1.5 text-[12px] text-white"
        >
          open it from code (1.5s)
        </button>
        <Tooltip ref={imperative} label="opened by ref.open()">
          <button
            type="button"
            className="rounded-lg border border-(--hairline) bg-(--bg-card) px-3 py-1.5 text-[12px] text-(--text-secondary)"
          >
            imperative target
          </button>
        </Tooltip>
      </Section>
    </>
  );
}
