import { useState, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LayersIcon,
  Layout01Icon,
  ListChecksIcon,
  LogsIcon,
  Tick02Icon,
  UserGroupIcon,
  View,
} from "@hugeicons/core-free-icons";

import { ActivityPreview, BoardPreview, ListPreview } from "./BoardPreview";

type View = "board" | "list" | "activity";

const VIEWS: { id: View; label: string; icon: typeof UserGroupIcon }[] = [
  { id: "board", label: "Board", icon: LayersIcon },
  { id: "list", label: "List", icon: ListChecksIcon },
  { id: "activity", label: "Activity", icon: LogsIcon },
];

const EXTRAS: { id: string; label: string; icon: typeof Layout01Icon }[] = [
  { id: "compact", label: "Compact cards", icon: Layout01Icon },
  { id: "presence", label: "Presence dots", icon: UserGroupIcon },
  { id: "log", label: "Activity trail", icon: LogsIcon },
];

const THEMES = [
  { label: "Dark mode", value: true },
  { label: "Light mode", value: false },
] as const;

/**
 * The one interactive band: a rail that chooses the view, chips that choose the
 * palette, and one large panel that shows the result.
 *
 * The rail is a white card holding the three views as checkbox rows — the
 * selected row takes a brand wash and a tick at its right end, which is the
 * "you are here" cue the rest of the product uses for a selected segment. The
 * switches that only change how the preview is drawn sit *outside* the card, so
 * the card stays a list of mutually exclusive choices.
 */
export default function ViewsSection() {
  const [view, setView] = useState<View>("board");
  const [dark, setDark] = useState(true);
  const [compact, setCompact] = useState(false);
  const [presence, setPresence] = useState(true);

  const extras: Record<string, { on: boolean; toggle: () => void }> = {
    compact: { on: compact, toggle: () => setCompact((value) => !value) },
    presence: { on: presence, toggle: () => setPresence((value) => !value) },
    log: { on: true, toggle: () => undefined },
  };

  return (
    <section className="relative border-t border-(--hairline) bg-(--bg-surface)">
      <div className="mx-auto w-full max-w-7xl px-4 mt-16 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <header className="mx-auto max-w-3xl text-center">
          <h2 className="font-sans text-[30px] font-bold leading-[1.15] tracking-[-1px] text-(--text-primary) sm:text-[38px] md:text-[44px] md:tracking-[-1.4px]">
            Explore the board{" "}
            <span className="text-(--text-muted)">in three views</span>
          </h2>
          <p className="mt-3 text-[17px] leading-[1.4] tracking-[-0.3px] text-(--text-secondary) sm:text-[20px] md:text-[22px]">
            The same cards, read three ways — pick the one the meeting needs.
          </p>
        </header>

        <div className="mt-10 flex flex-col gap-6 lg:mt-12 lg:flex-row lg:gap-8">
          {/* rail */}
          <div className="shrink-0 lg:w-60">
            <div
              role="tablist"
              aria-label="Board views"
              className="rounded-2xl border border-(--hairline) bg-(--bg-surface) p-2.5"
            >
              {VIEWS.map(({ id, label, icon }) => {
                const selected = view === id;

                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setView(id)}
                    className={[
                      "mb-1 flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-[15px] transition-colors duration-150 last:mb-0",
                      selected
                        ? "bg-(--brand-wash) font-medium text-(--text-primary)"
                        : "text-(--text-secondary) hover:bg-(--tint-3) hover:text-(--text-primary)",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid size-6 shrink-0 place-items-center",
                        selected
                          ? "border-(--brand-line-strong) bg-(--primary)"
                          : "border-(--hairline-strong)",
                      ].join(" ")}
                    >
                      <HugeiconsIcon icon={icon} size={15} strokeWidth={2} />
                    </span>
                    <span className="flex-1">{label}</span>
                    {selected ? (
                      <span className="shrink-0 text-(--brand)">
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          size={15}
                          strokeWidth={2.4}
                        />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col gap-1">
              {EXTRAS.map(({ id, label, icon: Icon }) => (
                <SwitchRow
                  key={id}
                  label={label}
                  icon={
                    <HugeiconsIcon icon={Icon} size={16} strokeWidth={1.6} />
                  }
                  on={extras[id]?.on ?? false}
                  onToggle={extras[id]?.toggle ?? (() => undefined)}
                />
              ))}
            </div>
          </div>

          {/* preview */}
          <div className="min-w-0 flex-1">
            <div
              className="mb-4 flex flex-wrap gap-2"
              role="group"
              aria-label="Preview palette"
            >
              {THEMES.map((theme) => {
                const selected = dark === theme.value;

                return (
                  <button
                    key={theme.label}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setDark(theme.value)}
                    className={[
                      "h-9 cursor-pointer rounded-full border px-4 text-[14px] transition-colors duration-150",
                      selected
                        ? "border-(--hairline-strong) bg-(--bg-surface) font-medium text-(--text-primary)"
                        : "border-transparent bg-(--tint-3) text-(--text-muted) hover:text-(--text-primary)",
                    ].join(" ")}
                  >
                    {theme.label}
                  </button>
                );
              })}
            </div>

            <div
              className={[
                "grid min-h-90 place-items-center rounded-2xl border border-(--hairline) bg-(--bg-root) p-6 sm:p-10",
                dark ? "dark-theme" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div
                className={[
                  "w-full max-w-180 transition-opacity duration-200",
                  presence ? "" : "[&_.faces]:opacity-0",
                ].join(" ")}
              >
                {view === "board" ? <BoardPreview compact={compact} /> : null}
                {view === "list" ? <ListPreview /> : null}
                {view === "activity" ? <ActivityPreview /> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface SwitchRowProps {
  label: string;
  icon: ReactNode;
  on: boolean;
  onToggle: () => void;
}

function SwitchRow({ label, icon, on, onToggle }: SwitchRowProps) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-[14.5px] text-(--text-secondary) transition-colors duration-150 hover:bg-(--tint-3) hover:text-(--text-primary)"
    >
      <span className="shrink-0 text-(--text-muted)">{icon}</span>
      <span className="flex-1">{label}</span>
      <span
        aria-hidden="true"
        className={[
          "h-4.5 w-7.5 shrink-0 rounded-full transition-colors duration-150",
          on ? "bg-(--brand)" : "bg-(--tint-10)",
        ].join(" ")}
      >
        <span
          className={[
            "mt-0.5 block size-3.5 rounded-full border border-(--hairline) bg-(--bg-surface) transition-transform duration-150",
            on ? "translate-x-3.5" : "translate-x-0.5",
          ].join(" ")}
        />
      </span>
    </button>
  );
}
