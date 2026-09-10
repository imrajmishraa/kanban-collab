import { HugeiconsIcon } from "@hugeicons/react";
import {
  LockPasswordIcon,
  Shield01Icon,
  Key01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

const securityPoints = [
  {
    icon: LockPasswordIcon,
    label: "Authenticated access",
    description:
      "Only authenticated users reach protected workspace resources.",
  },
  {
    icon: Key01Icon,
    label: "Controlled sessions",
    description:
      "Session lifecycle and auth state managed explicitly and predictably.",
  },
  {
    icon: Shield01Icon,
    label: "Protected transport",
    description:
      "Every connection runs through authenticated, controlled channels.",
  },
];

const statusRows = [
  { label: "Authentication", value: "Protected" },
  { label: "Session management", value: "Active" },
  { label: "Access control", value: "Verified" },
  { label: "Data transport", value: "Encrypted" },
];

const trustMarkers = [
  "End-to-end encrypted",
  "Session-based auth",
  "Role-based access",
];

export default function SecuritySection() {
  return (
    <section className="relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════
          AMBIENT LIGHT
          ═══════════════════════════════════════════════════════════ */}

      {/* Warm bloom, top-center */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-[420px] h-[760px] w-[1400px] -translate-x-1/2 rounded-[50%] bg-(--brand)/[0.09] blur-[170px]"
      />

      {/* Cool wash, right side — cool tone fits the "security" theme */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-240px] top-[320px] h-[560px] w-[820px] rounded-[50%] bg-sky-500/[0.025] blur-[150px]"
      />

      {/* Soft echo bottom-left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-180px] left-[-200px] h-[500px] w-[700px] rounded-[50%] bg-white/[0.018] blur-[150px]"
      />

      {/* ═══════════════════════════════════════════════════════════
          STARFIELD
          ═══════════════════════════════════════════════════════════ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.35) 0.6px, transparent 0.6px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, #000 0%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, #000 0%, transparent 85%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.5) 0.8px, transparent 0.8px)",
          backgroundSize: "44px 44px",
          backgroundPosition: "12px 18px",
          maskImage:
            "radial-gradient(ellipse 65% 55% at 45% 45%, #000 0%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 55% at 45% 45%, #000 0%, transparent 82%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--brand) 1px, transparent 1px)",
          backgroundSize: "110px 110px",
          backgroundPosition: "30px 40px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 55% 40%, #000 0%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 55% 40%, #000 0%, transparent 80%)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════
          CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        {/* ── Centered heading ────────────────────────────────── */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-baseline justify-center gap-3">
            <span className="font-mono text-[11px] tracking-[0.28em] text-(--brand)">
              04
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
              Security
            </span>
          </div>

          <h2 className="mt-6 font-mono text-3xl font-medium leading-[1.08] tracking-[-0.04em] text-(--text-primary) sm:text-4xl lg:text-5xl">
            Your workspace.{" "}
            <span className="bg-linear-to-b from-(--brand-hover) via-(--brand) to-(--brand-hover)/70 bg-clip-text text-transparent">
              Protected by design.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl font-mono text-sm leading-[1.9] text-(--text-secondary) sm:text-[15px]">
            Authentication, controlled sessions, and secure communication —
            built into the application, not bolted on.
          </p>
        </div>

        {/* ── Three security pillars ──────────────────────────── */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-3 sm:gap-5">
          {securityPoints.map((point) => (
            <div
              key={point.label}
              className="
                group/point relative overflow-hidden rounded-2xl
                border border-white/[0.07]
                bg-white/[0.02]
                p-6
                shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
                backdrop-blur-xl backdrop-saturate-150
                transition-all duration-500
                hover:-translate-y-0.5
                hover:border-white/[0.14]
                hover:bg-white/[0.035]
                hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_20px_48px_-24px_rgba(0,0,0,0.7)]
              "
            >
              {/* Radial top wash */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)]"
              />

              {/* Icon chip */}
              <div
                className="
                  relative flex h-10 w-10 items-center justify-center rounded-[10px]
                  border border-white/[0.08]
                  bg-linear-to-b from-white/[0.05] to-white/[0.01]
                  text-(--brand)
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                  transition-all duration-500
                  group-hover/point:border-(--brand)/40
                  group-hover/point:text-(--brand-hover)
                  group-hover/point:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_20px_-6px_var(--brand)]
                "
              >
                <HugeiconsIcon icon={point.icon} size={18} />
              </div>

              {/* Title */}
              <h3 className="relative mt-5 font-mono text-base font-medium tracking-[-0.01em] text-(--text-primary)">
                {point.label}
              </h3>

              {/* Description */}
              <p className="relative mt-2 font-mono text-[12px] leading-[1.75] text-(--text-secondary)/85">
                {point.description}
              </p>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            WIDE STATUS PANEL — dashboard + terminal
            ═══════════════════════════════════════════════════════════ */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          {/* Ambient warm bloom under the frame */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-16 -bottom-12 top-20 rounded-[40%] bg-(--brand)/[0.10] blur-[120px]"
          />

          {/* Glass outer frame */}
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
            {/* Radial top wash */}
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
              {/* ── Window header ─────────────────────────── */}
              <div className="flex h-11 items-center justify-between border-b border-white/[0.04] px-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full border border-rose-500/70 bg-rose-500/10" />
                    <span className="h-2.5 w-2.5 rounded-full border border-yellow-500/70 bg-yellow-500/10" />
                    <span className="h-2.5 w-2.5 rounded-full border border-emerald-500/70 bg-emerald-500/10" />
                  </div>
                  <span className="font-mono text-[11px] tracking-[0.05em] text-(--text-secondary)">
                    kanban / security
                  </span>
                </div>

                <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-emerald-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Secure
                </span>
              </div>

              {/* ── Two-column body: status list + terminal ── */}
              <div className="grid sm:grid-cols-2">
                {/* Left — status checklist */}
                <div className="border-b border-white/[0.04] p-5 sm:border-b-0 sm:border-r sm:p-6">
                  <div className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-(--brand)/70" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-secondary)/65">
                      System Status
                    </span>
                  </div>

                  <ul className="mt-5 space-y-3.5">
                    {statusRows.map((row) => (
                      <li
                        key={row.label}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                          </span>
                          <span className="font-mono text-[11px] text-(--text-secondary)/85">
                            {row.label}
                          </span>
                        </div>

                        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-emerald-400/80">
                          <HugeiconsIcon icon={Tick02Icon} size={10} />
                          {row.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right — terminal log */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-(--brand)/70" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-secondary)/65">
                      Verification
                    </span>
                  </div>

                  <div className="mt-5 space-y-2 font-mono text-[11px] leading-6">
                    <p className="text-(--text-secondary)/65">
                      <span className="text-(--brand)">$</span>{" "}
                      security.check
                    </p>
                    <p className="text-(--text-secondary)/50">
                      validating workspace access...
                    </p>
                    <p className="text-emerald-400/80">
                      ✓ authentication verified
                    </p>
                    <p className="text-emerald-400/80">✓ session validated</p>
                    <p className="text-emerald-400/80">
                      ✓ authorization verified
                    </p>
                    <p className="text-(--text-secondary)/65">
                      status: <span className="text-emerald-400">ready</span>
                      <span className="ml-0.5 inline-block h-3 w-[6px] translate-y-0.5 animate-pulse bg-emerald-400/80" />
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Trust strip ───────────────────────────── */}
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/[0.04] px-4 py-4 sm:justify-between">
                {trustMarkers.map((marker) => (
                  <span
                    key={marker}
                    className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)/55"
                  >
                    <span className="flex h-3 w-3 items-center justify-center rounded-full border border-(--brand)/30 bg-(--brand)/10 text-(--brand)">
                      <HugeiconsIcon icon={Tick02Icon} size={7} />
                    </span>
                    {marker}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Under-frame reflection */}
          <div
            aria-hidden="true"
            className="pointer-events-none mx-auto mt-3 h-8 w-4/5 rounded-[50%] bg-white/[0.025] blur-3xl"
          />
        </div>
      </div>
    </section>
  );
}
