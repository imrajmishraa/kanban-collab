import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

import { PersonAvatar } from "@/features/marketing/components/examples/parts";

/**
 * The letter.
 *
 * A pricing page asks someone to trust a table; this section is the one place
 * that answers as a person instead. Two columns — the face and the stamp on the
 * left, the letter on the right — and a hairline frame around the pair, because
 * the whole thing is a single object rather than a section of a page.
 *
 * It is written in the first person because it is signed. Edit the copy before
 * publishing: a letter that says "I" has to sound like the person whose name is
 * at the bottom.
 */
interface HelloThereSectionProps {
  /** The face at the top of the letter. A URL; without one, the placeholder. */
  photo?: string;
}

export default function HelloThereSection({ photo }: HelloThereSectionProps) {
  return (
    <section
      id="hello"
      className="scroll-mt-24 border-t border-(--hairline) bg-(--bg-surface)"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-5xl rounded-sm border border-(--hairline)">
          <div className="mx-auto max-w-4xl px-5 py-16">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-[240px_minmax(0,1fr)] md:gap-14">
              {/* the face, and the stamp */}
              <div className="flex flex-col items-center gap-10 md:items-start">
                <span className="inline-flex rounded-full border-2 border-(--brand)/30 p-2">
                  <PersonAvatar
                    src={photo}
                    bordered={false}
                    className="size-40 md:size-50"
                  />
                </span>

                <div className="hidden mt-50 md:block" aria-hidden="true">
                  <div className="inline-flex -rotate-12 items-center gap-2 rounded-md border border-(--brand-line) px-3 py-2 text-(--brand)">
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      size={14}
                      strokeWidth={3}
                    />
                    <span className="font-mono text-[10px] font-semibold tracking-[0.18em]">
                      Approved
                    </span>
                  </div>
                </div>
              </div>

              {/* the letter */}
              <div className="max-w-[62ch]">
                <p className="text-[16px] font-semibold text-(--text-primary)">
                  Hello There,
                </p>

                <p className="mt-4 text-[15px] leading-[1.75] text-(--text-secondary) md:text-[16px]">
                  I’m Raj, and I build Kanban Collab.
                </p>

                <p className="mt-5 text-[15px] leading-[1.75] text-(--text-secondary) md:text-[16px]">
                  Buying software is a decision, so I wanted to say hello
                  personally rather than leave it to a pricing table.
                </p>

                <p className="mt-6 text-[15px] font-semibold leading-[1.75] text-(--text-primary) md:text-[16px]">
                  I’m confident about what you’re getting, because the whole
                  thing is in front of you.
                </p>

                <p className="mt-2 text-[15px] leading-[1.75] text-(--text-secondary) md:text-[16px]">
                  It comes down to two promises:
                </p>

                <ol className="mt-5 flex flex-col gap-5">
                  <li className="text-[15px] leading-[1.75] text-(--text-secondary) md:text-[16px]">
                    <span className="font-semibold text-(--text-primary)">
                      1. The board is yours.
                    </span>{" "}
                    Your boards live in your MongoDB, on your hostname. There is
                    no hosted middle layer, and nothing to migrate away from
                    later.
                  </li>
                  <li className="text-[15px] leading-[1.75] text-(--text-secondary) md:text-[16px]">
                    <span className="font-semibold text-(--text-primary)">
                      2. The sync is real.
                    </span>{" "}
                    Two people moving the same card is a merge, not a lost
                    change — that is the part I would want to see working before
                    paying for a board.
                  </li>
                </ol>

                <p className="mt-6 text-[15px] leading-[1.75] text-(--text-secondary) md:text-[16px]">
                  So here is the simple promise: if something ever stands
                  between you and a board that works,{" "}
                  <span className="bg-(--brand-wash) px-1 py-0.5 text-(--text-primary) underline">
                    reach out and I’ll make sure you get the support you need.
                  </span>
                </p>

                <div className="mt-10 border-t border-(--hairline) pt-5">
                  <p className="text-[16px] font-semibold text-(--text-primary)">
                    Raj Mishra
                  </p>
                  <p className="mt-1 text-[14px] text-(--text-muted)">
                    Creator, Kanban Collab
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
