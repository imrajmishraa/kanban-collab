import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

import { FAQ } from "./plans";

/**
 * The questions the reference page answers, rewritten for a board that is
 * self-hosted: licence, dependencies, offline, exit and seats.
 *
 * One panel is open at a time — a pricing page is read by scanning, and five
 * open answers is a wall of text rather than a page.
 */
export default function PricingFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="scroll-mt-24 dark-theme border-b border-(--hairline) bg-(--bg-root)"
    >
      <div className="mx-auto w-full max-w-384 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
          <header className="max-w-md">
            <h2 className="mt-4 text-[28px] font-bold leading-[1.2] tracking-[-1px] text-(--text-primary) md:text-[34px]">
              The licence questions,
              <span className="text-(--text-subtle)"> answered</span>
            </h2>
            <p className="mt-3 text-[16px] leading-7 text-(--text-secondary)">
              Five things every team asks before putting a board on their own
              infrastructure.
            </p>
          </header>

          <div className="border-t border-(--hairline)">
            {FAQ.map((entry, index) => {
              const isOpen = open === index;
              const panelId = `faq-panel-${index}`;

              return (
                <div
                  key={entry.question}
                  className="border-b border-(--hairline)"
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : index)}
                      className="flex w-full cursor-pointer items-start gap-4 py-5 text-left transition-colors duration-150 hover:text-(--brand)"
                    >
                      <span className="mt-0.5 shrink-0 font-mono text-[10px] tracking-[0.12em] text-(--text-subtle)">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-[16px] font-semibold tracking-[-0.2px] text-(--text-primary)">
                        {entry.question}
                      </span>
                      <span
                        className={[
                          "mt-0.5 shrink-0 text-(--text-muted) transition-transform duration-200 motion-reduce:transition-none",
                          isOpen ? "rotate-180" : "",
                        ].join(" ")}
                      >
                        <HugeiconsIcon
                          icon={ArrowDown01Icon}
                          size={16}
                          strokeWidth={1.8}
                        />
                      </span>
                    </button>
                  </h3>

                  {isOpen ? (
                    <p
                      id={panelId}
                      className="max-w-[62ch] pb-5 pl-9.5 text-[15px] leading-[1.65] text-(--text-secondary)"
                    >
                      {entry.answer}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
