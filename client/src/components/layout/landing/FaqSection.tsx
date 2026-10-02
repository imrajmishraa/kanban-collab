import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

import { Reveal, SectionHeading } from "./Tilt";
import { useMediaQuery } from "./useMediaQuery";

const faqs = [
  {
    q: "Is it really free?",
    a: "Yes. Kanban is open source under the MIT license — free to use, self-host and modify. No seats, no paywalled basics, no trial timers.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. The hosted app works straight from the browser. If you'd rather run it yourself, the repository has everything you need to self-host.",
  },
  {
    q: "How does real-time sync work?",
    a: "Boards sync over WebSockets, so every change is pushed to all connected clients instantly — with offline edits reconciled when you reconnect.",
  },
  {
    q: "Can I use it solo?",
    a: "Absolutely. It works great as a personal task manager — the collaboration features simply stay out of your way until you invite someone.",
  },
  {
    q: "Can I move my data in and out?",
    a: "Yes. Import from common formats and export your boards any time as JSON or CSV. Your data is never held hostage.",
  },
  {
    q: "Is my data safe?",
    a: "Traffic is encrypted in transit, and you can export or delete everything at any time. For full control, self-host the whole thing on your own infrastructure.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  /* Hover-open only where there's a real pointer — on touch devices
     a "hover" is really a tap, which would fight the click toggle. */
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");

  return (
    <section id="faq" className="relative bg-transparent">
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 sm:py-32">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered"
          description="Everything people ask before their first board."
        />

        <div className="mt-14 flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;

            return (
              <Reveal key={faq.q} delay={i * 0.06}>
                <div
                  /* Hover opens; clicking the open one still closes it */
                  onMouseEnter={canHover ? () => setOpenIndex(i) : undefined}
                  className={`
                    overflow-hidden rounded-xl border
                    backdrop-blur-xl backdrop-saturate-150
                    transition-colors duration-300
                    ${
                      isOpen
                        ? "border-white/14 bg-white/4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_40px_-16px_rgba(0,0,0,0.6)]"
                        : "border-white/8 bg-white/2 hover:border-white/12"
                    }
                  `}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-mono text-sm text-(--text-primary)">
                      {faq.q}
                    </span>

                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.21, 0.47, 0.32, 0.98],
                      }}
                      className={`
                        flex size-6 shrink-0 items-center justify-center rounded-full border
                        transition-colors duration-300
                        ${
                          isOpen
                            ? "border-(--brand)/35 bg-(--brand)/12 text-(--brand-hover)"
                            : "border-white/8 bg-white/3 text-(--text-secondary)"
                        }
                      `}
                    >
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        size={12}
                        strokeWidth={2.4}
                      />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.4,
                          ease: [0.21, 0.47, 0.32, 0.98],
                        }}
                      >
                        <p className="border-t border-white/6 px-5 pb-5 pt-4 font-mono text-xs leading-[1.9] text-(--text-secondary)">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
