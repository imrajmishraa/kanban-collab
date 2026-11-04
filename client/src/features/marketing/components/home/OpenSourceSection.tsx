import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon } from "@hugeicons/core-free-icons";

import { Reveal } from "./Tilt";

/**
 * The open source slab, on the marketing stage.
 *
 * Same shape as before, a wide rounded panel with everything centred, but lit
 * rather than dark: the panel is pinned light, carries a warm wash that starts
 * at the top edge and falls away, and its border is brand at 28 percent into
 * white rather than a grey hairline.
 *
 * The two buttons are the pair from WhyKanbanSection, so the page has one
 * button language: outline first, solid second, both 44px at an 8px radius.
 */

const REPO_URL = "https://github.com/imrajmishraa/kanban-collab";

export default function OpenSourceSection() {
  return (
    <section
      id="open-source"
      className="light bg-(--bg-root) text-(--text-primary)"
    >
      <div className="mx-auto w-full max-w-384 border-x border-(--hairline) py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <div
            className="
              relative theme-dark max-w-6xl m-auto overflow-hidden rounded-3xl px-8 py-16 sm:py-20
              border border-[color-mix(in_srgb,var(--brand)_28%,white)]
            "
            style={{
              background:
                "radial-gradient(ellipse 70% 90% at 50% 0%, color-mix(in srgb, var(--brand) 10%, transparent) 0%, transparent 62%), var(--bg-surface)",
            }}
          >
            <div className="flex flex-col items-center gap-5">
              <h2 className="max-w-3xl text-balance text-center font-sans text-[32px] font-bold leading-[1.2] tracking-[-1px] text-(--text-primary) sm:text-[36px] md:text-[40px] md:tracking-[-1.4px]">
                Open source,{" "}
                <span className="text-(--text-subtle)">all the way down.</span>
              </h2>

              <p className="max-w-146.75 text-center font-sans text-[18px] leading-relaxed tracking-[-0.3px] text-(--text-secondary) sm:text-[20px] md:text-[22px] md:tracking-[-0.5px]">
                Every line is on GitHub. Read it, fork it, or run the whole
                thing yourself: the client, the API, Mongo and Redis all come up
                with one command.
              </p>

              <div className="mt-3 flex flex-wrap justify-center gap-3 max-md:w-full max-md:flex-col max-md:items-stretch">
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex h-11 items-center justify-center gap-1.5 rounded-lg px-4
                    border border-[color-mix(in_srgb,var(--brand)_55%,white)]
                    bg-[color-mix(in_srgb,var(--brand)_7%,white)]
                    font-sans text-[14px] font-bold
                    text-[color-mix(in_srgb,var(--brand)_32%,black)]
                    transition-colors duration-200 motion-reduce:transition-none
                    hover:bg-[color-mix(in_srgb,var(--brand)_13%,white)]
                    hover:border-[color-mix(in_srgb,var(--brand)_72%,white)]
                    focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-surface) focus-visible:outline-none
                  "
                >
                  <HugeiconsIcon
                    icon={GithubIcon}
                    size={14}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="shrink-0"
                  />
                  Read the source
                </a>

                <Link
                  to="/workspaces"
                  className="
                    inline-flex h-11 items-center justify-center rounded-lg px-4
                    border border-(--brand) bg-(--brand)/80
                    font-sans text-[14px] font-bold text-(--solid-text)
                    transition-colors duration-200 motion-reduce:transition-none
                    hover:border-(--brand-hover) hover:bg-(--brand)/85
                    focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-surface) focus-visible:outline-none
                  "
                >
                  Open a board
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
