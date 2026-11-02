import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon } from "@hugeicons/core-free-icons";

import { Reveal } from "./Tilt";

/* ── Content ────────────────────────────────────────────────────────── */

const REPO_URL = "https://github.com/imrajmishraa/kanban-collab";

/* ── Section ────────────────────────────────────────────────────────── */

export default function OpenSourceSection() {
  return (
    <section id="open-source" className="scroll-mt-16 text-(--text-primary)">
      <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-(--hairline) bg-(--bg-surface) px-6 py-20 sm:py-28">
            <h2 className="max-w-3xl text-center text-[40px] font-bold leading-[1.1] tracking-tight text-balance text-(--text-primary) sm:text-[48px] md:text-[56px]">
              Open source, all the way down
            </h2>

            <p className="max-w-3xl text-center text-base leading-relaxed text-(--text-secondary) sm:text-lg">
              Every line is on GitHub. Read it, fork it, or run the whole thing
              yourself: the client, the API, Mongo and Redis all come up with
              one command.
            </p>

            <div className="flex flex-row flex-wrap justify-center gap-4 max-md:flex-col max-md:items-center">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex h-12 items-center justify-center gap-2 rounded-full
                  bg-(--solid-bg) px-6 text-base font-medium text-(--solid-text)
                  transition-colors duration-200 motion-reduce:transition-none
                  hover:bg-(--solid-bg-hover)
                  focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none
                  max-sm:w-full
                "
              >
                <HugeiconsIcon
                  icon={GithubIcon}
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                Read the source
              </a>

              <a
                href={`${REPO_URL}/issues/new`}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex h-12 items-center justify-center rounded-full
                  border border-(--hairline) bg-(--tint-6) px-6
                  text-base font-medium text-(--text-primary)
                  transition-colors duration-200 motion-reduce:transition-none
                  hover:bg-(--tint-10)
                  focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none
                  max-sm:w-full
                "
              >
                Open an issue
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
