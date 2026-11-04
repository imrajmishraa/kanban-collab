import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon, Mail01Icon } from "@hugeicons/core-free-icons";

import { Reveal } from "./Tilt";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="light scroll-mt-16 bg-(--bg-root) text-(--text-primary)"
    >
      <div className="mx-auto w-full max-w-384">
        <div
          className="border-x border-b border-(--hairline)"
          style={{
            background:
              "radial-gradient(ellipse 70% 90% at 50% 0%, color-mix(in srgb, var(--brand) 10%, transparent) 0%, transparent 62%), var(--bg-surface)",
          }}
        >
          <div className="flex flex-col items-center px-4 py-16 text-center sm:px-8 sm:py-20 md:px-12 md:py-24 lg:px-16 lg:py-28">
            <Reveal>
              <h2 className="max-w-3xl text-balance text-center font-sans text-[32px] font-bold leading-[1.2] tracking-[-1px] text-(--text-primary) sm:text-[36px] md:text-[40px] md:tracking-[-1.4px]">
                Still have questions?{" "}
                <span className="text-(--text-subtle)">We have answers.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-4 max-w-146.75 text-center font-sans text-[18px] leading-relaxed tracking-[-0.3px] text-(--text-secondary) sm:text-[20px] md:text-[22px] md:tracking-[-0.5px]">
                Tell us what you were trying to do and we will point you at the
                answer. Bug reports, feature requests and setup questions all
                land in the same place.
              </p>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="mt-8 flex flex-wrap justify-center gap-3 max-md:w-full max-md:flex-col max-md:items-stretch">
                <a
                  href={
                    "https://github.com/imrajmishraa/kanban-collab/issues/new"
                  }
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
                  Raise an issue
                </a>

                <a
                  href={"mailto:raj212558@gmail.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex h-11 items-center justify-center gap-1.5 rounded-lg px-4
                    border border-(--brand) bg-(--brand)/80
                    font-sans text-[14px] font-bold text-(--solid-text)
                    transition-colors duration-200 motion-reduce:transition-none
                    hover:border-(--brand-hover) hover:bg-(--brand)/85
                    focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-surface) focus-visible:outline-none
                  "
                >
                  <HugeiconsIcon
                    icon={Mail01Icon}
                    size={14}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="shrink-0"
                  />
                  Contact us
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
