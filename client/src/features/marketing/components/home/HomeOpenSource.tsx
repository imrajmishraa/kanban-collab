import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon } from "@hugeicons/core-free-icons";

import { Reveal } from "./Reveal";

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

export default function HomeOpenSource() {
  return (
    <section
      id="open-source"
      className="light-theme bg-(--bg-root) text-(--text-primary)"
    >
      <div className="mx-auto w-full max-w-384 border-x border-(--hairline) py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <div
            className="
              relative dark-theme max-w-6xl m-auto overflow-hidden rounded-3xl px-8 py-16 sm:py-20
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
                  className="m-btn-outline gap-1.5"
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

                <Link to="/workspaces" className="m-btn">
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
