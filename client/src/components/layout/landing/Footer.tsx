import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GithubIcon,
  ArrowUpRight01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";

const productLinks = [
  { label: "Features", href: "/features" },
  { label: "How it Works", href: "/how-it-works" },
  { label: "Dashboard", href: "/dashboard" },
];

const resourceLinks = [
  {
    label: "GitHub",
    href: "https://github.com/imrajmishraa/kanban-collab",
    external: true,
  },
  { label: "Login", href: "/auth/login" },
  { label: "Register", href: "/auth/register" },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const statusPoints = [
  { label: "API", status: "operational" },
  { label: "Sync", status: "operational" },
  { label: "Webhooks", status: "operational" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════
          AMBIENT LIGHT — single warm bloom, nothing else
          ═══════════════════════════════════════════════════════════ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-70 h-140 w-350 -translate-x-1/2 rounded-[50%] bg-(--brand)/6 blur-[160px]"
      />

      {/* ═══════════════════════════════════════════════════════════
          MAIN CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Top row ─────────────────────────────────────────── */}
        <div className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-20">
          {/* Brand column */}
          <div className="max-w-sm">
            <Link
              to="/"
              className="group inline-flex items-center gap-2.5 font-mono text-lg font-bold tracking-tight text-(--text-primary)"
            >
              <img
                src="/appIcon.png"
                alt=""
                width={28}
                height={28}
                draggable={false}
                className="h-7 w-7 rounded-lg border border-white/8 object-cover shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition-all duration-300 group-hover:border-(--brand)/40 group-hover:shadow-[0_0_16px_-2px_var(--brand)]"
              />
              <span>Kanban Collab</span>
            </Link>

            <p className="mt-5 font-mono text-[13px] leading-[1.75] text-(--text-secondary)">
              Real-time collaborative boards for teams that want to organize
              work, ship faster, and stay on the same page.
            </p>

            {/* Status pill — glassy */}
            <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-white/8 bg-white/3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-(--text-secondary) backdrop-blur-xl backdrop-saturate-150">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--success) opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--success)" />
              </span>
              <span>All systems operational</span>
            </div>
          </div>

          {/* Product column */}
          <FooterColumn title="Product" links={productLinks} />

          {/* Resources column */}
          <FooterColumn title="Resources" links={resourceLinks} />

          {/* Legal column */}
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        {/* ── Status strip — glass card with system health ────── */}
        <div className="relative mb-12 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/2 p-5 backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18)_50%,transparent)]"
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: label + dots */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-secondary)/70">
                System Status
              </span>
              <span
                aria-hidden="true"
                className="hidden h-4 w-px bg-white/8 sm:block"
              />
              <div className="flex items-center gap-4">
                {statusPoints.map((point) => (
                  <span
                    key={point.label}
                    className="flex items-center gap-1.5 font-mono text-[10px] text-(--text-secondary)/80"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                    {point.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: uptime metric */}
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-sm font-medium text-(--text-primary)">
                99.98%
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-(--text-secondary)/55">
                Uptime · 30d
              </span>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────── */}
        <div className="relative border-t border-white/6 py-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Copyright */}
            <p className="font-mono text-[11px] text-(--text-secondary)/60">
              © {currentYear} Kanban Collab · Crafted with care
            </p>

            {/* Center: version + status */}
            <div className="flex items-center gap-4 font-mono text-[11px] text-(--text-secondary)/60">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                v0.1.0
              </span>
              <span aria-hidden="true" className="h-3 w-px bg-white/8" />
              <a
                href="https://github.com/imrajmishraa/kanban-collab"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-(--text-primary)"
              >
                <HugeiconsIcon icon={GithubIcon} size={12} />
                <span>Open source</span>
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  size={10}
                  className="opacity-60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </a>
            </div>

            {/* Right: back to top */}
            <a
              href="#top"
              className="group inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/3 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-(--text-secondary) backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 hover:border-(--brand)/40 hover:bg-(--brand)/8 hover:text-(--text-primary)"
            >
              <span>Back to top</span>
              <HugeiconsIcon
                icon={ArrowUp01Icon}
                size={11}
                className="transition-transform duration-300 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────
   Footer column
   ───────────────────────────────────────────────────────────── */
interface FooterColumnProps {
  title: string;
  links: {
    label: string;
    href: string;
    external?: boolean;
  }[];
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-(--text-secondary)/70">
        {title}
      </h2>

      <nav className="mt-5 flex flex-col gap-3">
        {links.map((item) => {
          if (item.external) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-fit items-center gap-1.5 font-mono text-sm text-(--text-secondary) transition-colors duration-200 hover:text-(--text-primary)"
              >
                <span className="relative">
                  {item.label}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-(--brand)/60 transition-transform duration-300 group-hover:scale-x-100"
                  />
                </span>
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  size={11}
                  className="opacity-50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                />
              </a>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href}
              className="group inline-flex w-fit items-center gap-1.5 font-mono text-sm text-(--text-secondary) transition-colors duration-200 hover:text-(--text-primary)"
            >
              <span className="relative">
                {item.label}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-(--brand)/60 transition-transform duration-300 group-hover:scale-x-100"
                />
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
