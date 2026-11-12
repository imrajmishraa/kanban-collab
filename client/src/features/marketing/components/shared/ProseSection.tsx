import type { ReactNode } from "react";

import SectionHead from "./SectionHead";

interface ProseSectionProps {
  id?: string;
  title: string;
  lead?: string;
  register?: "sans" | "mono";
  children: ReactNode;
}

/**
 * A section of running text: a head, then whatever the page needs under it.
 *
 * `marketing-prose` supplies the body typography (paragraphs, lists, links,
 * code, tables) so the copy inside is plain semantic HTML — no per-element
 * classes on the page.
 */
export default function ProseSection({
  id,
  title,
  lead,
  register,
  children,
}: ProseSectionProps) {
  return (
    <section
      id={id}
      className="relative scroll-mt-24 border-t border-(--hairline) bg-(--bg-root)"
    >
      <div className="mx-auto w-full max-w-384 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <SectionHead title={title} lead={lead} register={register} />

          <div className="marketing-prose mt-8 max-w-none">{children}</div>
        </div>
      </div>
    </section>
  );
}
