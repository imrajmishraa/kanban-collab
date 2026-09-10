import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tick02Icon,
  Message01Icon,
  PencilEdit02Icon,
  CheckmarkCircle02Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons";

type ActivityType = "moved" | "created" | "completed" | "commented";

interface ActivityItem {
  name: string;
  initials: string;
  color: string;
  action: string;
  task: string;
  time: string;
  type: ActivityType;
  isYou?: boolean;
}

const activities: ActivityItem[] = [
  {
    name: "Maya",
    initials: "MA",
    color: "bg-(--brand)",
    action: "moved",
    task: "Design landing page",
    time: "just now",
    type: "moved",
  },
  {
    name: "Rio",
    initials: "RI",
    color: "bg-sky-500",
    action: "commented on",
    task: "WebSocket sync",
    time: "2m ago",
    type: "commented",
  },
  {
    name: "Sam",
    initials: "SA",
    color: "bg-pink-500",
    action: "created",
    task: "API integration",
    time: "5m ago",
    type: "created",
  },
  {
    name: "You",
    initials: "YU",
    color: "bg-emerald-500",
    action: "completed",
    task: "Authentication",
    time: "12m ago",
    type: "completed",
    isYou: true,
  },
];

const activityIcons: Record<ActivityType, typeof Tick02Icon> = {
  moved: PencilEdit02Icon,
  created: Add01Icon,
  completed: CheckmarkCircle02Icon,
  commented: Message01Icon,
};

const activityColors: Record<ActivityType, string> = {
  moved: "text-(--brand) border-(--brand)/30 bg-(--brand)/10",
  created: "text-sky-400 border-sky-400/30 bg-sky-400/10",
  completed: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  commented: "text-pink-400 border-pink-400/30 bg-pink-400/10",
};

const presence = [
  { initials: "MA", color: "bg-(--brand)" },
  { initials: "RI", color: "bg-sky-500" },
  { initials: "SA", color: "bg-pink-500" },
];

export default function CollaborationSection() {
  return (
    <section className="relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════
          AMBIENT BACKGROUND
          ═══════════════════════════════════════════════════════════ */}

      {/* Warm glow anchored above — bleeds into the previous section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-80 h-150 w-300 -translate-x-1/2 rounded-[50%] bg-(--brand)/8 blur-[150px]"
      />

      {/* Cool counter-glow, offset right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-70 h-125 w-175 rounded-[50%] bg-white/2 blur-[130px]"
      />

      {/* ═══════════════════════════════════════════════════════════
          STARFIELD — four dot layers
          ═══════════════════════════════════════════════════════════ */}

      {/* Layer 1 — tiny dots, dense */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.35) 0.6px, transparent 0.6px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 75% 60% at 50% 40%, #000 0%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 60% at 50% 40%, #000 0%, transparent 85%)",
        }}
      />

      {/* Layer 2 — small dots, offset grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.5) 0.8px, transparent 0.8px)",
          backgroundSize: "44px 44px",
          backgroundPosition: "12px 18px",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 48% 42%, #000 0%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 55% at 48% 42%, #000 0%, transparent 82%)",
        }}
      />

      {/* Layer 3 — sparse brand-colored stars */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--brand) 1px, transparent 1px)",
          backgroundSize: "110px 110px",
          backgroundPosition: "30px 40px",
          maskImage:
            "radial-gradient(ellipse 65% 50% at 50% 40%, #000 0%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 50% at 50% 40%, #000 0%, transparent 80%)",
        }}
      />

      {/* Layer 4 — bright accent stars, sparse */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.7) 1.2px, transparent 1.2px)",
          backgroundSize: "180px 180px",
          backgroundPosition: "60px 90px",
          maskImage:
            "radial-gradient(ellipse 60% 45% at 50% 40%, #000 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 45% at 50% 40%, #000 0%, transparent 75%)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════
          CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-28 sm:px-6 sm:py-32 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-8 lg:py-40">
        {/* ── Left: Copy ────────────────────────────────────────── */}
        <div>
          {/* Kicker — orbiting pill matching the rest of the page */}
          <div
            className="
              eyebrow-orbit
              inline-flex items-center gap-2.5
              rounded-full
              bg-[#0B0B10]/70
              px-4 py-2
              font-mono text-[10px] uppercase tracking-[0.22em]
              text-(--text-secondary)
              shadow-[0_4px_20px_-8px_rgba(0,0,0,0.6)]
              backdrop-blur-xl backdrop-saturate-150
            "
          >
            <span className="eyebrow-ring" aria-hidden="true" />

            <span className="relative z-2 flex items-center gap-2.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--brand) opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--brand)" />
              </span>
              <span>Real-time collaboration</span>
            </span>
          </div>

          {/* Headline */}
          <h2 className="mt-8 max-w-lg font-mono text-3xl font-medium leading-[1.1] tracking-[-0.04em] text-(--text-primary) sm:text-4xl lg:text-5xl">
            Everyone sees the{" "}
            <span className="bg-linear-to-b from-(--brand-hover) via-(--brand) to-(--brand-hover)/70 bg-clip-text text-transparent">
              same board.
            </span>
          </h2>

          {/* Description */}
          <p className="mt-6 max-w-lg font-mono text-sm leading-[1.9] text-(--text-secondary) sm:text-[15px]">
            Changes propagate in milliseconds. No refreshing, no merge
            conflicts, no "who has the latest?" — everyone's view is the source
            of truth.
          </p>

          {/* Feature chips */}
          <div className="mt-10 flex flex-wrap gap-2.5">
            {[
              "Instant updates",
              "Multi-user presence",
              "Conflict-free sync",
            ].map((label) => (
              <span
                key={label}
                className="
                  inline-flex items-center gap-2 rounded-full
                  border border-white/8
                  bg-white/3
                  px-3.5 py-1.5
                  font-mono text-[11px]
                  text-(--text-secondary)
                  backdrop-blur-xl backdrop-saturate-150
                  transition-all duration-300
                  hover:border-(--brand)/40
                  hover:bg-(--brand)/8
                  hover:text-(--text-primary)
                "
              >
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-(--brand)/30 bg-(--brand)/10 text-(--brand)">
                  <HugeiconsIcon icon={Tick02Icon} size={8} />
                </span>
                {label}
              </span>
            ))}
          </div>

          {/* Latency stat */}
          <div className="mt-10 flex items-center gap-4 border-t border-white/6 pt-6">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl font-medium tracking-tight text-(--text-primary)">
                &lt;50ms
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)/60">
                Sync latency
              </span>
            </div>
            <span aria-hidden="true" className="h-6 w-px bg-white/8" />
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl font-medium tracking-tight text-(--text-primary)">
                ∞
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)/60">
                Concurrent editors
              </span>
            </div>
          </div>
        </div>

        {/* ── Right: Live activity window ───────────────────────── */}
        <div className="relative">
          {/* Ambient glow behind the window */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 -bottom-6 top-8 rounded-[40%] bg-(--brand)/10 blur-[100px]"
          />

          {/* Glass window frame */}
          <div
            className="
              group/frame relative overflow-hidden rounded-2xl
              border border-white/8
              bg-white/2
              p-2
              shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_30px_80px_-30px_rgba(0,0,0,0.7)]
              backdrop-blur-xl backdrop-saturate-150
              transition-all duration-500
              hover:border-white/[0.14]
              hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_40px_100px_-30px_rgba(0,0,0,0.8)]
            "
          >
            {/* Top sheen */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.24)_50%,transparent)]"
            />

            {/* Inner window */}
            <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#0B0B0F]">
              {/* Window header */}
              <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full border border-rose-500/70 bg-rose-500/10" />
                    <span className="h-2 w-2 rounded-full border border-yellow-500/70 bg-yellow-500/10" />
                    <span className="h-2 w-2 rounded-full border border-emerald-500/70 bg-emerald-500/10" />
                  </div>

                  <span className="font-mono text-[11px] tracking-wider text-(--text-secondary)">
                    team.workspace
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-1.5">
                    {presence.map((person) => (
                      <span
                        key={person.initials}
                        className={`
                          flex h-5 w-5 items-center justify-center rounded-full
                          border border-[#0B0B0F] font-mono text-[8px] font-medium text-white
                          ${person.color}
                        `}
                      >
                        {person.initials}
                      </span>
                    ))}
                  </div>

                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-emerald-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    Live
                  </span>
                </div>
              </div>

              {/* Activity feed */}
              <div className="divide-y divide-white/4">
                {activities.map((activity, index) => {
                  const Icon = activityIcons[activity.type];
                  const colorClass = activityColors[activity.type];

                  return (
                    <div
                      key={`${activity.name}-${index}`}
                      className={`
                        group/row relative flex items-center gap-3.5 px-4 py-3.5
                        transition-colors duration-300
                        hover:bg-white/2
                        ${activity.isYou ? "bg-white/1.5" : ""}
                      `}
                    >
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-0 top-0 h-full w-px scale-y-0 bg-(--brand)/60 transition-transform duration-300 group-hover/row:scale-y-100"
                      />

                      <span
                        className={`
                          relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                          font-mono text-[10px] font-medium text-white
                          border border-white/8
                          ${activity.color}
                        `}
                      >
                        {activity.initials}

                        {activity.isYou && (
                          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-[#0B0B0F] bg-emerald-400" />
                        )}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="truncate font-mono text-[12px] leading-5 text-(--text-secondary)">
                          <span
                            className={`font-medium ${
                              activity.isYou
                                ? "text-emerald-400"
                                : "text-(--text-primary)"
                            }`}
                          >
                            {activity.name}
                          </span>{" "}
                          <span className="text-(--text-secondary)/80">
                            {activity.action}
                          </span>{" "}
                          <span className="text-(--text-primary)/85">
                            {activity.task}
                          </span>
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] text-(--text-secondary)/45">
                          {activity.time}
                        </p>
                      </div>

                      <span
                        className={`
                          flex h-6 w-6 shrink-0 items-center justify-center rounded-md
                          border
                          ${colorClass}
                        `}
                      >
                        <HugeiconsIcon icon={Icon} size={11} />
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Window footer */}
              <div className="flex items-center justify-between border-t border-white/6 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] tracking-widest text-(--text-secondary)/55">
                    Maya is typing
                  </span>
                  <span className="flex items-center gap-0.5">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-(--text-secondary)/60 [animation-delay:0ms]" />
                    <span className="h-1 w-1 animate-pulse rounded-full bg-(--text-secondary)/60 [animation-delay:150ms]" />
                    <span className="h-1 w-1 animate-pulse rounded-full bg-(--text-secondary)/60 [animation-delay:300ms]" />
                  </span>
                </div>

                <span className="font-mono text-[10px] tracking-widest text-(--text-secondary)/45">
                  4 events
                </span>
              </div>
            </div>
          </div>

          {/* Under-frame reflection */}
          <div
            aria-hidden="true"
            className="pointer-events-none mx-auto mt-3 h-6 w-4/5 rounded-[50%] bg-white/2 blur-2xl"
          />

          {/* Floating corner accents */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-3 top-12 hidden h-3 w-3 rounded-full border border-white/[0.14] bg-white/6 backdrop-blur-md sm:block"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-3 bottom-16 hidden h-3 w-3 rounded-full border border-white/[0.14] bg-white/6 backdrop-blur-md sm:block"
          />
        </div>
      </div>
    </section>
  );
}
