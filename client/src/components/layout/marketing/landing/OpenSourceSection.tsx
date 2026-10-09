import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  GithubIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";

import { Reveal, SectionHeading, TiltCard } from "./Tilt";

const GITHUB_URL = "https://github.com/imrajmishraa/kanban-collab";

/* ── Typewriter for the terminal's payoff line ─────────────────────── */

function useTypewriter(text: string, speed = 26, startDelay = 700) {
  const [output, setOutput] = useState("");

  useEffect(() => {
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      let i = 0;
      interval = window.setInterval(() => {
        i += 1;
        setOutput(text.slice(0, i));
        if (i >= text.length && interval !== undefined) {
          window.clearInterval(interval);
        }
      }, speed);
    }, startDelay);

    return () => {
      window.clearTimeout(timeout);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  return output;
}

const TYPED_LINE = "✓ board live at localhost:5173";

const bullets = [
  {
    icon: StarIcon,
    label: "MIT licensed — fork it, ship it, own it",
  },
  {
    icon: GithubIcon,
    label: "Public roadmap, honest issues, PRs welcome",
  },
  {
    icon: ArrowRight02Icon,
    label: "Self-host the whole stack on your own infra",
  },
];

export default function OpenSourceSection() {
  const typed = useTypewriter(TYPED_LINE);

  return (
    <section className="relative bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <SectionHeading
          eyebrow="Open source"
          title={
            <>
              Built in the{" "}
              <span className="bg-linear-to-b from-(--brand-hover) to-(--brand) bg-clip-text text-transparent">
                open
              </span>
            </>
          }
          description="Every line of Kanban lives on GitHub. Star it, fork it, self-host it — or open a PR and make it yours."
        />

        {/* Both columns stretch to the same height and centre their own
            content, so the left and right blocks line up exactly. */}
        <div className="mt-16 grid items-stretch gap-10 lg:grid-cols-2">
          {/* ── Pitch + actions ──────────────────────────────────── */}
          <Reveal className="h-full">
            <div className="flex h-full flex-col justify-center gap-4">
              {bullets.map((b) => (
                <div
                  key={b.label}
                  className="
                    flex items-center gap-3.5 rounded-xl
                    border border-white/8
                    bg-white/3
                    px-5 py-4
                    backdrop-blur-xl backdrop-saturate-150
                    transition-colors duration-300
                    hover:border-white/16 hover:bg-white/4
                  "
                >
                  <span
                    className="
                      flex size-9 shrink-0 items-center justify-center rounded-lg
                      border border-(--brand)/25 bg-(--brand)/10
                      text-(--brand-hover)
                    "
                  >
                    <HugeiconsIcon icon={b.icon} size={15} strokeWidth={2} />
                  </span>
                  <p className="font-mono text-sm text-(--text-secondary)">
                    {b.label}
                  </p>
                </div>
              ))}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    group/star relative inline-flex items-center justify-center gap-2 overflow-hidden
                    rounded-full border border-(--brand)/45 bg-(--brand)/12 px-6 py-3
                    font-mono text-sm text-(--brand-hover)
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]
                    backdrop-blur-xl backdrop-saturate-150
                    transition-all duration-300
                    hover:border-(--brand)/80 hover:bg-(--brand)/20
                    active:scale-[0.98]
                  "
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)] transition-transform duration-700 group-hover/star:translate-x-full" />
                  <HugeiconsIcon
                    icon={GithubIcon}
                    size={16}
                    strokeWidth={2}
                    className="relative"
                  />
                  <span className="relative">Star on GitHub</span>
                </a>

                <a
                  href={`${GITHUB_URL}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex items-center justify-center gap-2
                    rounded-full border border-white/10 bg-white/3 px-6 py-3
                    font-mono text-sm text-(--text-secondary)
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                    backdrop-blur-xl backdrop-saturate-150
                    transition-all duration-300
                    hover:border-white/20 hover:bg-white/6 hover:text-(--text-primary)
                    active:scale-[0.98]
                  "
                >
                  Browse issues
                </a>
              </div>
            </div>
          </Reveal>

          {/* ── 3D terminal ─────────────────────────────────────── */}
          <Reveal delay={0.12} className="h-full">
            <TiltCard intensity={7} className="h-full">
              <div className="flex h-full flex-col justify-center">
                <div
                  className="
                    relative overflow-hidden rounded-2xl
                    border border-white/10
                    bg-[#0B0B10]/80
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_30px_70px_-20px_rgba(0,0,0,0.7)]
                    backdrop-blur-xl backdrop-saturate-150
                  "
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22)_50%,transparent)]"
                  />

                  {/* Terminal header */}
                  <div className="flex h-11 items-center border-b border-white/6 px-4 sm:px-5">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full border border-rose-500/70 bg-rose-500/10" />
                      <span className="h-2.5 w-2.5 rounded-full border border-yellow-500/70 bg-yellow-500/10" />
                      <span className="h-2.5 w-2.5 rounded-full border border-emerald-500/70 bg-emerald-500/10" />
                    </div>
                    <span className="ml-5 font-mono text-xs text-(--text-secondary)">
                      contributing.md
                    </span>
                  </div>

                  {/* Terminal body */}
                  <div className="space-y-2.5 p-5 font-mono text-xs leading-6 sm:p-6">
                    <p>
                      <span className="text-(--brand-hover)">$</span>{" "}
                      <span className="text-(--text-secondary)">
                        git clone imrajmishraa/kanban-collab
                      </span>
                    </p>
                    <p>
                      <span className="text-(--brand-hover)">$</span>{" "}
                      <span className="text-(--text-secondary)">
                        cd kanban-collab
                      </span>
                    </p>
                    <p>
                      <span className="text-(--brand-hover)">$</span>{" "}
                      <span className="text-(--text-secondary)">
                        npm install
                      </span>
                    </p>
                    <p>
                      <span className="text-(--brand-hover)">$</span>{" "}
                      <span className="text-(--text-secondary)">
                        npm run dev
                      </span>
                    </p>
                    <p className="text-emerald-400/90">
                      {typed}
                      <motion.span
                        aria-hidden
                        animate={{ opacity: [1, 0] }}
                        transition={{
                          duration: 0.9,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-(--brand)/70"
                      />
                    </p>
                    <p className="pt-1 text-(--text-secondary)/40">
                      # pick a “good first issue” → ship it
                    </p>
                  </div>
                </div>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
