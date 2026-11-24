import { useRef, useState } from "react";

import { LabSection as Section } from "@/pages/tooltipLab/LabSection";
import { LabChip as Chip } from "@/pages/tooltipLab/LabChip";
import {
  PLACEMENTS,
  SHAPES,
  SIZES,
  THEMES,
  TONES,
} from "@/pages/tooltipLab/data";
import { Tooltip } from "@/components/Tooltips/ToolTip";
import { TooltipGroup } from "@/components/Tooltips/TooltipGroup";
import { suppressTooltips } from "@/lib/tooltipBus";
import type { TooltipHandle } from "@/components/Tooltips/ToolTip";
import { AccessibilitySections } from "@/pages/tooltipLab/AccessibilitySections";

/**
 * The tooltip lab — a local page for deciding what stays.
 *
 * Nothing here ships: the route is registered only when `import.meta.env.DEV` is true
 * (`app/routes/dev.routes.tsx`), and this file is deleted with that route when the list is
 * settled. Every prop is exercised on its own row so a feature can be judged — and cut — one
 * at a time.
 */

export default function TooltipLabPage() {
  const [controlled, setControlled] = useState(false);
  const [dragging, setDragging] = useState(false);
  const imperative = useRef<TooltipHandle>(null);
  const [wide, setWide] = useState(false);

  return (
    <div className="mx-auto w-full max-w-384 px-6 pb-24">
      <header className="py-8">
        <h1 className="text-[22px] font-semibold text-(--text-primary)">
          Tooltip lab
        </h1>
        <p className="mt-1 max-w-[70ch] text-[13px] text-(--text-muted)">
          Local only — dev builds and nowhere else. Hover, focus, click or
          long-press each row and tell me what to keep.
        </p>
      </header>

      <Section
        title="1 · Shapes — 13"
        note="Same label, same tone. Voice, not meaning."
      >
        {SHAPES.map((shape) => (
          <Chip key={shape} shape={shape} label={`shape: ${shape}`}>
            {shape}
          </Chip>
        ))}
      </Section>

      <Section title="2 · Tones — 5" note="Meaning, layered on top of shape.">
        {TONES.map((tone) => (
          <Chip key={tone} tone={tone} shape="solid" label={`tone: ${tone}`}>
            {tone}
          </Chip>
        ))}
      </Section>

      <Section
        title="3 · Themes — 3"
        note="`auto` inverts against the page; `dark` and `light` are pinned."
      >
        {THEMES.map((theme) => (
          <Chip key={theme} theme={theme} label={`theme: ${theme}`}>
            {theme}
          </Chip>
        ))}
      </Section>

      <Section title="4 · Sizes — 3">
        {SIZES.map((size) => (
          <Chip key={size} size={size} label={`size: ${size}`}>
            {size}
          </Chip>
        ))}
      </Section>

      <Section title="5 · Caret">
        <Chip caret="auto" label="caret: auto">
          caret auto
        </Chip>
        <Chip caret="none" label="caret: none">
          caret none
        </Chip>
      </Section>

      <Section title="6 · Highlight phrase">
        <Chip highlight="New" label="Boards">
          with highlight
        </Chip>
        <Chip label="Boards">without highlight</Chip>
      </Section>

      <Section title="7 · Multi-line description">
        <Chip
          label="Delete board"
          description="24 cards and their history will be removed. This cannot be undone."
          tone="danger"
        >
          description (2 lines)
        </Chip>
        <Chip
          label="Delete board"
          description="24 cards and their history will be removed. This cannot be undone. Every member loses access immediately, and the activity feed keeps a tombstone entry."
          maxLines={2}
          tone="danger"
        >
          description + maxLines 2
        </Chip>
      </Section>

      <Section title="8 · Keyboard shortcut">
        <Chip label="Search" shortcut={["⌘", "K"]}>
          shortcut ⌘K
        </Chip>
        <Chip label="Command palette" shortcut={["Ctrl", "⇧", "P"]}>
          shortcut Ctrl ⇧ P
        </Chip>
      </Section>

      <Section
        title="9 · Placement"
        note="The bubble flips when there is no room on the preferred side."
      >
        {PLACEMENTS.map((placement) => (
          <Chip key={placement} placement={placement} label={placement}>
            {placement}
          </Chip>
        ))}
      </Section>

      <Section title="10 · Offset">
        <Chip label="offset 0" offset={{ x: 0, y: 0 }}>
          offset 0
        </Chip>
        <Chip label="offset y −12" offset={{ y: -12 }}>
          offset y −12
        </Chip>
        <Chip label="offset x 24" offset={{ x: 24 }}>
          offset x 24
        </Chip>
      </Section>

      <Section title="11 · Width and wrapping">
        <Chip
          label="A deliberately long tooltip label that has to wrap onto more than one line"
          maxWidth={180}
        >
          maxWidth 180
        </Chip>
        <Chip
          label="A fixed-width bubble, so the label wraps at exactly this width"
          width={220}
        >
          width 220
        </Chip>
      </Section>

      <Section
        title="12 · Triggers"
        note="hover is the default. click pins. focus is keyboard-only. manual is the parent's job."
      >
        <Chip trigger="hover" label="opened on hover">
          hover
        </Chip>
        <Chip trigger="click" label="pinned by a click — click again to close">
          click
        </Chip>
        <Chip trigger="focus" label="opened on keyboard focus">
          focus
        </Chip>
        <Tooltip
          trigger="manual"
          open={controlled}
          onOpenChange={setControlled}
          label="controlled by the button below"
        >
          <button
            type="button"
            className="rounded-lg border border-(--hairline) bg-(--bg-card) px-3 py-1.5 text-[12px] text-(--text-secondary) hover:bg-(--bg-hover)"
          >
            manual (target)
          </button>
        </Tooltip>
        <button
          type="button"
          onClick={() => setControlled((v) => !v)}
          className="rounded-lg bg-(--brand) px-3 py-1.5 text-[12px] text-white"
        >
          {controlled ? "close it" : "open it"}
        </button>
      </Section>

      <Section
        title="13 · autoHide"
        note="Closes itself — for “Copied!” style confirmations."
      >
        <Chip label="Copied!" autoHide={1500}>
          autoHide 1.5s
        </Chip>
        <Chip label="Saved 2s ago" autoHide={3000}>
          autoHide 3s
        </Chip>
      </Section>

      <Section
        title="14 · truncationOnly"
        note="The left button's text fits, the right one is clipped — only the clipped one shows a tooltip."
      >
        <Chip truncationOnly label="this label is fully visible">
          text that fits
        </Chip>
        <Chip
          truncationOnly
          label="the full text, which is cut off in the button"
        >
          <span className="block max-w-[110px] truncate">
            a very long button label that is clipped
          </span>
        </Chip>
      </Section>

      <Section
        title="15 · followCursor"
        note="Move the pointer inside the button — the bubble follows it."
      >
        <Chip followCursor label="follows the pointer">
          followCursor
        </Chip>
        <Chip followCursor="x" label="follows on x only">
          followCursor x
        </Chip>
      </Section>

      <Section
        title="16 · interactive"
        note="The bubble keeps the pointer, so its text can be selected — and it stays while the pointer travels from the button into the bubble (WCAG 1.4.13)."
      >
        <Chip interactive label="You can select this text — try it">
          interactive
        </Chip>
      </Section>

      <Section
        title="17 · Disabled"
        note="No bubble at all, and no aria-describedby."
      >
        <Chip disabled label="never shown">
          disabled
        </Chip>
      </Section>

      <Section
        title="18 · TooltipGroup"
        note="Move between these quickly: the 300ms group window skips the open delay."
      >
        <TooltipGroup>
          {["one", "two", "three", "four", "five"].map((n) => (
            <Chip key={n} label={`group item ${n}`}>
              {n}
            </Chip>
          ))}
        </TooltipGroup>
      </Section>

      <Section
        title="19 · ResizeObserver"
        note="Shrink the anchor while its tooltip is open — the bubble repositions instead of staying behind."
      >
        <button
          type="button"
          onClick={() => setWide((v) => !v)}
          className="rounded-lg bg-(--bg-hover) px-3 py-1.5 text-[12px] text-(--text-primary)"
        >
          {wide ? "narrow the anchor" : "widen the anchor"}
        </button>
        <Tooltip label="I move with my anchor">
          <button
            type="button"
            style={{ width: wide ? 280 : 120 }}
            className="rounded-lg border border-(--hairline) bg-(--bg-card) px-3 py-1.5 text-[12px] text-(--text-secondary) transition-[width] duration-300"
          >
            anchor
          </button>
        </Tooltip>
      </Section>

      <AccessibilitySections imperative={imperative} />

      <Section
        title="23 · Side-aware animation"
        note="The bubble grows out of its anchor. Leaving fades quicker than arriving (120ms vs 200ms); prefers-reduced-motion turns both off."
      >
        {PLACEMENTS.slice(0, 4).map((placement) => (
          <Chip
            key={placement}
            placement={placement}
            label={`arrives from ${placement}`}
          >
            {placement}
          </Chip>
        ))}
      </Section>

      <Section
        title="24 · One at a time"
        note="Sweep the pointer across these quickly. Only one bubble is ever open — the next closes the last instead of stacking on top of it."
      >
        {["alpha", "beta", "gamma", "delta", "epsilon", "zeta"].map((n) => (
          <Chip key={n} label={`only one of us is open — ${n}`}>
            {n}
          </Chip>
        ))}
      </Section>

      <Section
        title="25 · Nothing during a drag"
        note="Press the button, then hover any chip above. The bus watches data-dragging / data-resizing, so a tooltip cannot appear against an anchor that is moving."
      >
        <button
          type="button"
          onClick={() => {
            setDragging(true);
            document.body.dataset.dragging = "true";
            window.setTimeout(() => {
              delete document.body.dataset.dragging;
              setDragging(false);
            }, 2500);
          }}
          className="rounded-lg bg-(--brand) px-3 py-1.5 text-[12px] text-white"
        >
          {dragging ? "dragging… hover something" : "simulate a drag (2.5s)"}
        </button>
        <Chip label="I refuse to open while a drag is running">
          a chip to hover during the drag
        </Chip>
      </Section>

      <Section
        title="26 · suppressTooltips()"
        note="For menus and modals: the caller owns the pointer, so every tooltip stands down until the undo is called."
      >
        <button
          type="button"
          onClick={() => {
            const undo = suppressTooltips();
            window.setTimeout(undo, 2500);
          }}
          className="rounded-lg bg-(--bg-hover) px-3 py-1.5 text-[12px] text-(--text-primary)"
        >
          suppress for 2.5s
        </button>
        <Chip label="also silent during that window">
          hover me during suppression
        </Chip>
      </Section>

      <Section
        title="27 · Touch: tap to toggle"
        note="On a phone a 500ms press opens the bubble and a quick tap closes it again — the tap is no longer swallowed."
      >
        <Chip label="long-press to open, tap to close">touch target</Chip>
      </Section>

      <Section
        title="28 · Kanban use cases (hand-built)"
        note="The list's §7 — nothing is a preset yet; this is what they would look like."
      >
        <Chip label="Overdue by 2 days" tone="danger" shape="solid">
          due date (danger)
        </Chip>
        <Chip label="Due tomorrow" tone="warning" shape="solid">
          due date (warning)
        </Chip>
        <Chip label="Only the owner can archive" tone="neutral">
          disabled action reason
        </Chip>
        <Chip
          label="Delete board"
          description="24 cards will be removed."
          tone="danger"
        >
          destructive hint
        </Chip>
        <Chip label="Saved 2s ago" tone="success" autoHide={2000}>
          sync status
        </Chip>
        <Chip label="5/5 cards — limit reached" tone="warning">
          WIP limit
        </Chip>
      </Section>
    </div>
  );
}
