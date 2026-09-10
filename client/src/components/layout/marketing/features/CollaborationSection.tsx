import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { CollaborationColumn } from "@components/ui/marketing/features/CollaborationColumn";

const presence = [
  { initials: "RM", color: "bg-(--brand)", name: "Rahul" },
  { initials: "AK", color: "bg-sky-500", name: "Anjali" },
  { initials: "SP", color: "bg-pink-500", name: "Sam" },
  { initials: "NV", color: "bg-emerald-500", name: "Noah" },
];

const techIndicators = [
  {
    label: "Transport",
    value: "WebSockets",
    hint: "Bidirectional · Persistent",
  },
  {
    label: "State",
    value: "Yjs",
    hint: "CRDT · Conflict-free",
  },
  {
    label: "Presence",
    value: "Awareness",
    hint: "Live cursors · Selections",
  },
];

export default function CollaborationSection() {
  return (
    <section className="relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════
          AMBIENT LIGHT — no grid, just glow
          ═══════════════════════════════════════════════════════════ */}

      {/* Warm bloom anchored above the section — bleeds in from above */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-[420px] h-[760px] w-[1400px] -translate-x-1/2 rounded-[50%] bg-(--brand)/[0.09] blur-[170px]"
      />

      {/* Cool wash on the left, subtle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-260px] top-[280px] h-[520px] w-[720px] rounded-[50%] bg-white/[0.018] blur-[140px]"
      />

      {/* Very soft warm echo bottom-right, gives the section weight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-180px] right-[-200px] h-[500px] w-[700px] rounded-[50%] bg-(--brand)/[0.05] blur-[150px]"
      />

      {/* ═══════════════════════════════════════════════════════════
          CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        {/* ── Section heading ─────────────────────────────────── */}
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16">
          <div className="max-w-2xl">
            {/* Kicker */}
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] tracking-[0.28em] text-(--brand)">
                02
              </span>
              <span
                aria-hidden="true"
                className="h-px w-12 opacity-70"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--brand) 1px, transparent 1px)",
                  backgroundSize: "4px 1px",
                  backgroundRepeat: "repeat-x",
                }}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-(--text-secondary)/60">
                Real-time Collaboration
              </span>
            </div>

            {/* Headline */}
            <h2 className="mt-6 font-mono text-3xl font-medium leading-[1.08] tracking-[-0.04em] text-(--text-primary) sm:text-4xl lg:text-5xl">
              Work together.{" "}
              <span className="bg-linear-to-b from-(--brand-hover) via-(--brand) to-(--brand-hover)/70 bg-clip-text text-transparent">
                See changes instantly.
              </span>
            </h2>

            {/* Description */}
            <p className="mt-6 max-w-xl font-mono text-sm leading-[1.9] text-(--text-secondary) sm:text-[15px]">
              Keep your team working from the same source of truth. Every change
              propagates across connected clients in milliseconds — no refresh,
              no merge conflicts.
            </p>
          </div>

          {/* Right — live presence indicator */}
          <div className="flex flex-col gap-3 lg:items-end lg:pb-2">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {presence.map((person) => (
                  <span
                    key={person.initials}
                    className={`
                      relative flex h-8 w-8 items-center justify-center rounded-full
                      border-2 border-[#0B0B0F] font-mono text-[10px] font-medium text-white
                      shadow-[0_2px_8px_rgba(0,0,0,0.5)]
                      ${person.color}
                    `}
                  >
                    {person.initials}
                  </span>
                ))}
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0B0B0F] bg-white/[0.06] font-mono text-[9px] text-(--text-secondary) backdrop-blur-sm">
                  +9k
                </span>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-secondary) backdrop-blur-xl backdrop-saturate-150">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Live
              </span>
            </div>

            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-secondary)/45">
              Editing together right now
            </span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            COLLABORATION PREVIEW — glass window
            ═══════════════════════════════════════════════════════════ */}
        <div className="relative mt-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-16 -bottom-12 top-20 rounded-[40%] bg-(--brand)/[0.10] blur-[120px]"
          />

          <div
            className="
              group/frame relative rounded-[24px]
              border border-white/[0.10]
              bg-white/[0.03]
              p-2
              shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_30px_80px_-20px_rgba(0,0,0,0.6)]
              backdrop-blur-xl backdrop-saturate-150
              transition-all duration-500
              hover:border-white/[0.16]
              hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_40px_100px_-20px_rgba(0,0,0,0.7)]
            "
          >
            {/* Radial top wash — replaces hairline sheen */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]"
            />

            {/* Inner window */}
            <div
              className="
                relative overflow-hidden rounded-[18px]
                border border-white/[0.05]
                bg-[#0B0B0F]
                shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]
              "
            >
              {/* Window header */}
              <div className="flex h-11 items-center justify-between border-b border-white/[0.04] px-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full border border-rose-500/70 bg-rose-500/10" />
                    <span className="h-2.5 w-2.5 rounded-full border border-yellow-500/70 bg-yellow-500/10" />
                    <span className="h-2.5 w-2.5 rounded-full border border-emerald-500/70 bg-emerald-500/10" />
                  </div>
                  <span className="font-mono text-[11px] tracking-[0.05em] text-(--text-secondary)">
                    kanban / team-board
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden items-center -space-x-1.5 sm:flex">
                    {presence.slice(0, 3).map((person) => (
                      <span
                        key={person.initials}
                        className={`
                          flex h-5 w-5 items-center justify-center rounded-full
                          border border-[#0B0B0F] font-mono text-[8px] text-white
                          ${person.color}
                        `}
                      >
                        {person.initials}
                      </span>
                    ))}
                  </div>

                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-emerald-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    Live
                  </span>
                </div>
              </div>

              {/* Board grid */}
              <div className="relative grid gap-px bg-white/[0.04] sm:grid-cols-3">
                {/* Live cursors overlaid */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10"
                >
                  <div className="absolute left-[18%] top-[24%] flex items-start gap-1">
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                      <path
                        d="M1 1L12 9L7 10L5 15L1 1Z"
                        fill="var(--brand)"
                        stroke="var(--brand)"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="rounded-[3px] bg-(--brand) px-1.5 py-0.5 font-mono text-[8px] font-medium leading-none text-white shadow-[0_2px_6px_-1px_var(--brand)]">
                      Rahul
                    </span>
                  </div>

                  <div className="absolute right-[22%] top-[42%] flex items-start gap-1">
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                      <path
                        d="M1 1L12 9L7 10L5 15L1 1Z"
                        fill="#38BDF8"
                        stroke="#38BDF8"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="rounded-[3px] bg-[#38BDF8] px-1.5 py-0.5 font-mono text-[8px] font-medium leading-none text-[#0A0A0A] shadow-[0_2px_6px_-1px_#38BDF8]">
                      Anjali
                    </span>
                  </div>
                </div>

                <CollaborationColumn
                  title="Todo"
                  count="03"
                  cards={["Design workspace", "Invite teammates"]}
                />
                <CollaborationColumn
                  title="In Progress"
                  count="02"
                  cards={["Build collaboration", "Implement presence"]}
                />
                <CollaborationColumn
                  title="Done"
                  count="04"
                  cards={["Project setup", "Board creation"]}
                />
              </div>

              {/* Presence footer */}
              <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-secondary)/60">
                    Active now
                  </span>

                  <div className="flex items-center -space-x-2">
                    {presence.map((person, i) => (
                      <span
                        key={person.initials}
                        className={`
                          relative flex h-6 w-6 items-center justify-center rounded-full
                          border border-[#0B0B0F] font-mono text-[9px] font-medium text-white
                          ${person.color}
                        `}
                        style={{ zIndex: presence.length - i }}
                      >
                        {person.initials}
                        {i < 2 && (
                          <span className="absolute -inset-0.5 animate-pulse rounded-full border border-emerald-400/50" />
                        )}
                      </span>
                    ))}
                  </div>

                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-(--text-secondary)/65">
                    <span>Anjali is typing</span>
                    <span className="flex items-center gap-0.5">
                      <span className="h-1 w-1 animate-pulse rounded-full bg-(--text-secondary)/60 [animation-delay:0ms]" />
                      <span className="h-1 w-1 animate-pulse rounded-full bg-(--text-secondary)/60 [animation-delay:150ms]" />
                      <span className="h-1 w-1 animate-pulse rounded-full bg-(--text-secondary)/60 [animation-delay:300ms]" />
                    </span>
                  </span>
                </div>

                <span className="font-mono text-[10px] tracking-[0.1em] text-(--text-secondary)/45">
                  state://synchronized
                </span>
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none mx-auto mt-3 h-8 w-4/5 rounded-[50%] bg-white/[0.025] blur-3xl"
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════
            TECHNOLOGY INDICATORS
            ═══════════════════════════════════════════════════════════ */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {techIndicators.map((tech) => (
            <div
              key={tech.label}
              className="
                group/tech relative overflow-hidden rounded-2xl
                border border-white/[0.07]
                bg-white/[0.02]
                p-5
                shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
                backdrop-blur-xl backdrop-saturate-150
                transition-all duration-500
                hover:-translate-y-0.5
                hover:border-white/[0.14]
                hover:bg-white/[0.035]
                hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_20px_48px_-24px_rgba(0,0,0,0.7)]
              "
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)]"
              />

              <div className="relative flex items-center gap-2.5">
                <span className="h-1 w-1 rounded-full bg-(--brand)/70" />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-secondary)/65">
                  {tech.label}
                </span>
              </div>

              <p className="relative mt-3 font-mono text-lg font-medium tracking-[-0.01em] text-(--text-primary)">
                {tech.value}
              </p>

              <p className="relative mt-1.5 font-mono text-[10px] tracking-[0.05em] text-(--text-secondary)/55">
                {tech.hint}
              </p>

              <div className="relative mt-4 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-px flex-1 opacity-50"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
                    backgroundSize: "5px 1px",
                    backgroundRepeat: "repeat-x",
                  }}
                />
                <HugeiconsIcon
                  icon={Tick02Icon}
                  size={10}
                  className="text-(--brand)/70"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
