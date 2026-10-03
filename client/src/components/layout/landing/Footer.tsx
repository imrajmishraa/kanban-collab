import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import logo from "@/assets/logo.svg?inline";

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
                src={logo}
                alt="Kanban Logo"
                width={28}
                height={28}
                draggable={false}
                className="h-7 w-7 rounded-lg object-cover"
              />
              <span>Kanban</span>
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
            </div>
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
