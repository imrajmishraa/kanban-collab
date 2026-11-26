import type { ReactNode } from "react";

import {
  ANIMATIONS,
  CLOSE_SHAPES,
  DESC_SIZES,
  FILLS,
  RAIL_EDGES,
  LAB_DEFAULTS,
  POSITIONS,
  PRESETS,
  SHAPES,
  SIZES,
  THEMES,
  TONES,
  applyPreset,
  type LabConfig,
} from "./labConfig";

/**
 * The configuration half of the lab: every axis of `components/toaster`, as a
 * control.
 *
 * The small fields are private to this file — `check-paths` counts *exported*
 * components, and these exist only to keep the panel from being forty repeated
 * labels. The panel itself is the one thing the page renders.
 */

const FIELD =
  "min-h-11 rounded-md border border-(--hairline) bg-(--bg-elevated) px-2 text-base text-(--text-primary) focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--tint-15) sm:min-h-9 sm:text-[12px]";

const FOCUS =
  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--tint-15)";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-wide text-(--text-subtle)">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className={FIELD}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function NumberBox({
  value,
  onChange,
  min = 0,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) {
  return (
    <input
      type="number"
      min={min}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className={FIELD}
    />
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className={`size-5 rounded-sm accent-[var(--brand)] ${FOCUS}`}
    />
  );
}

export function LabControls({
  config,
  onChange,
}: {
  config: LabConfig;
  onChange: (config: LabConfig) => void;
}) {
  const set = <K extends keyof LabConfig>(key: K, value: LabConfig[K]) =>
    onChange({ ...config, [key]: value } as LabConfig);

  return (
    <section className="rounded-xl border border-(--hairline) bg-(--bg-surface) p-4">
      <h2 className="text-[13px] font-semibold">Configuration</h2>
      <p className="mt-1 text-[12px] leading-5 text-(--text-muted)">
        Every axis of the component. A change applies to the next toast, not to
        the ones already up.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Row label="preset">
          <Select
            value={config.preset}
            options={PRESETS}
            onChange={(preset) => onChange(applyPreset(preset, config))}
          />
        </Row>
        <Row label="position">
          <Select
            value={config.position}
            options={POSITIONS}
            onChange={(value) => set("position", value)}
          />
        </Row>
        <Row label="shape">
          <Select
            value={config.shape}
            options={SHAPES}
            onChange={(value) => set("shape", value)}
          />
        </Row>
        <Row label="size">
          <Select
            value={config.size}
            options={SIZES}
            onChange={(value) => set("size", value)}
          />
        </Row>
        <Row label="tone">
          <Select
            value={config.tone}
            options={TONES}
            onChange={(value) => set("tone", value)}
          />
        </Row>
        <Row label="fill">
          <Select
            value={config.fill}
            options={FILLS}
            onChange={(value) => set("fill", value)}
          />
        </Row>
        <Row label="description size">
          <Select
            value={config.descSize}
            options={DESC_SIZES}
            onChange={(value) => set("descSize", value)}
          />
        </Row>
        <Row label="description lines">
          <NumberBox
            value={config.maxLines}
            onChange={(v) => set("maxLines", v)}
          />
        </Row>
        <Row label="animation">
          <Select
            value={config.animation}
            options={ANIMATIONS}
            onChange={(value) => set("animation", value)}
          />
        </Row>
        <Row label="theme">
          <Select
            value={config.theme}
            options={THEMES}
            onChange={(value) => set("theme", value)}
          />
        </Row>
        <Row label="width px">
          <NumberBox value={config.width} onChange={(v) => set("width", v)} />
        </Row>
        <Row label="min width px">
          <NumberBox
            value={config.minWidth}
            onChange={(v) => set("minWidth", v)}
          />
        </Row>
        <Row label="mobile width px">
          <NumberBox
            value={config.mobileWidth}
            onChange={(v) => set("mobileWidth", v)}
          />
        </Row>
        <Row label="gap">
          <NumberBox value={config.gap} onChange={(v) => set("gap", v)} />
        </Row>
        <Row label="offset">
          <NumberBox value={config.offset} onChange={(v) => set("offset", v)} />
        </Row>
        <Row label="visible toasts">
          <NumberBox
            value={config.visibleToasts}
            min={1}
            onChange={(v) => set("visibleToasts", v)}
          />
        </Row>
        <Row label="duration ms">
          <NumberBox
            value={config.duration}
            onChange={(v) => set("duration", v)}
          />
        </Row>
        <Row label="close button">
          <Toggle
            checked={config.closeButton}
            onChange={(v) => set("closeButton", v)}
          />
        </Row>
        <Row label="close shape">
          <Select
            value={config.closeButtonShape}
            options={CLOSE_SHAPES}
            onChange={(value) => set("closeButtonShape", value)}
          />
        </Row>
        <Row label="expand">
          <Toggle checked={config.expand} onChange={(v) => set("expand", v)} />
        </Row>
        <Row label="progress rail">
          <Toggle
            checked={config.progress}
            onChange={(v) => set("progress", v)}
          />
        </Row>
        <Row label="rail edge">
          <Select
            value={config.progressPosition}
            options={RAIL_EDGES}
            onChange={(value) => set("progressPosition", value)}
          />
        </Row>
      </div>

      <button
        type="button"
        onClick={() => onChange(LAB_DEFAULTS)}
        className={`mt-3 min-h-11 w-full rounded-md border border-(--hairline) px-3 text-[12px] font-medium text-(--text-secondary) transition-colors hover:bg-(--tint-8) sm:min-h-9 ${FOCUS}`}
      >
        Reset to defaults
      </button>
    </section>
  );
}
