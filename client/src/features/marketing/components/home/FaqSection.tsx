import { useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowDownDoubleIcon,
} from "@hugeicons/core-free-icons";

interface Faq {
  q: string;
  a: string;
}

const faqs: Faq[] = [
  {
    q: "Is it really free?",
    a: "Yes. Kanban is open source under the MIT license, free to use, self-host and modify. No seats, no paywalled basics, no trial timers.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. The hosted app works straight from the browser. If you would rather run it yourself, the repository has everything you need to self-host.",
  },
  {
    q: "How does real-time sync work?",
    a: "Boards sync over WebSockets, so every change is pushed to all connected clients instantly, with offline edits reconciled when you reconnect.",
  },
  {
    q: "Can I use it solo?",
    a: "Absolutely. It works well as a personal task manager. The collaboration features stay out of your way until you invite someone.",
  },
  {
    q: "Can I move my data in and out?",
    a: "Yes. Import from common formats and export your boards at any time as JSON or CSV. Your data is never held hostage.",
  },
  {
    q: "Is my data safe?",
    a: "Traffic is encrypted in transit, and you can export or delete everything at any time. For full control, self-host the whole thing on your own infrastructure.",
  },
  {
    q: "Does it work on a phone?",
    a: "Yes. The rail becomes a drawer and the board scrolls column by column, so the same board is usable on a small screen. Dragging works with a long press.",
  },
  {
    q: "How many people can be on a board at once?",
    a: "As many as you invite. Presence shows who is on the board right now, and every change converges without a refresh, even when two people move the same card.",
  },
  {
    q: "What happens when I go offline?",
    a: "You keep working. Edits are queued locally and reconciled when the connection returns, and the board tells you when it is reconnected rather than silently catching up.",
  },
  {
    q: "Can I run it on my own servers?",
    a: "Yes. The repository ships a Docker setup for the client, API, Mongo and Redis. Point it at your own domain and the whole thing runs inside your network.",
  },
  {
    q: "Are there keyboard shortcuts?",
    a: "Every surface has one. F opens Find, N opens notifications, and on a board Command or Control with K opens the card palette. Escape closes whatever is on top.",
  },
  {
    q: "Do you take feature requests?",
    a: "Yes, and they are read. Open an issue with what you were trying to do rather than only what you want added, because the problem is usually more useful than the proposed fix.",
  },
];

/* Two columns of cards on md and up, so a short answer does not leave a long
   empty row beside it. Column-major: the first half runs down the left. */
const HALF = Math.ceil(faqs.length / 2);
const COLUMNS = [faqs.slice(0, HALF), faqs.slice(HALF)];

const answerId = (index: number) => `faq-answer-${index}`;

interface FaqSectionProps {
  /**
   * Pin the section to one theme, whatever the page is doing. Use `dark` on a
   * light page, or `light` on a dark one, when a section needs a fixed stage.
   * Unset, the section follows the app theme like everything else.
   */
  themeLock?: "dark" | "light";
}

export default function FaqSection({ themeLock }: FaqSectionProps) {
  /* A set rather than one index, so "Expand all" is expressible. The first
     answer is open on arrival, which shows the interaction without a click. */
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));

  const allOpen = open.size === faqs.length;

  const toggle = (index: number) =>
    setOpen((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const toggleAll = () =>
    setOpen(allOpen ? new Set() : new Set(faqs.map((_, index) => index)));

  /* `.theme-dark` restates the dark palette as a scope, `.light` is the page
     override reused as one. Both are in index.css, so the subtree gets its own
     tokens and nothing leaks in from the page. */
  const scope =
    themeLock === "dark" ? "theme-dark" : themeLock === "light" ? "light" : "";

  return (
    <section
      id="faq"
      className={["scroll-mt-16", scope, "bg-(--bg-root) text-(--text-primary)"]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto w-full max-w-384">
        {/* Bordered on all four sides, with the column rule inside it, so the
            block reads as one object rather than two loose halves. */}
        <div className="overflow-hidden border-r border-l border-t border-(--hairline)">
          <div className="grid lg:grid-cols-3 lg:divide-x lg:divide-(--hairline)">
            {/* Heading column: a third of the width, and it stays put while the
                answers to the right grow and shrink. */}

            <div className="px-4 py-10 sm:px-8 sm:py-12 md:px-12 md:py-14 lg:px-16 lg:py-16">
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-(--text-primary) md:text-4xl">
                Frequently Asked{" "}
                <span className="text-(--text-muted)">Questions</span>
              </h2>
              <p className="max-w-2xl text-xl font-light leading-relaxed text-(--text-secondary)">
                Everything people ask before their first board, from what it
                costs to what happens to their data.
              </p>
            </div>

            <div className="px-4 pb-10 sm:px-8 sm:pb-12 md:px-12 md:pb-14 lg:col-span-2 lg:px-16 lg:py-16">
              <div className="mb-5 flex justify-start">
                <button
                  type="button"
                  onClick={toggleAll}
                  aria-label={
                    allOpen
                      ? "Collapse all FAQ answers"
                      : "Expand all FAQ answers"
                  }
                  className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-(--text-secondary) transition-colors duration-200 hover:text-(--text-primary) motion-reduce:transition-none"
                >
                  <HugeiconsIcon
                    icon={ArrowDownDoubleIcon}
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                    className={[
                      "transition-transform duration-200 motion-reduce:transition-none",
                      allOpen ? "rotate-180" : "",
                    ].join(" ")}
                  />
                  <span>{allOpen ? "Collapse all" : "Expand all"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {COLUMNS.map((column, columnIndex) => (
                  <div key={columnIndex} className="space-y-3">
                    {column.map((faq, position) => {
                      const index = columnIndex * HALF + position;
                      const isOpen = open.has(index);

                      return (
                        <div
                          key={faq.q}
                          className="overflow-hidden rounded-lg border border-(--hairline) bg-(--bg-root) transition-colors duration-200 hover:bg-(--tint-3) motion-reduce:transition-none"
                        >
                          <button
                            type="button"
                            onClick={() => toggle(index)}
                            aria-expanded={isOpen}
                            aria-controls={answerId(index)}
                            className="flex w-full cursor-pointer items-start justify-between gap-4 px-5 py-4 text-left"
                          >
                            <h3 className="min-w-0 text-base font-medium leading-6 text-(--text-primary)">
                              {faq.q}
                            </h3>
                            <HugeiconsIcon
                              icon={ArrowDown01Icon}
                              size={20}
                              strokeWidth={2}
                              aria-hidden="true"
                              className={[
                                "mt-0.5 shrink-0 text-(--text-muted) transition-transform duration-200 motion-reduce:transition-none",
                                isOpen ? "rotate-180" : "",
                              ].join(" ")}
                            />
                          </button>

                          {/* The answer is always mounted and animated on the
                              grid row, which is what makes the height
                              transition work without measuring anything. */}
                          <div
                            id={answerId(index)}
                            aria-hidden={!isOpen}
                            className={[
                              "grid transition-all duration-200 ease-in-out motion-reduce:transition-none",
                              isOpen
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0",
                            ].join(" ")}
                          >
                            <div className="overflow-hidden">
                              <p className="px-5 pb-5 text-sm leading-6 text-(--text-secondary)">
                                {faq.a}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
