import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon } from "@hugeicons/core-free-icons";

/* The contact route. Swap for a mailto once there is a support address. */
const CONTACT_URL = "https://github.com/imrajmishraa/kanban-collab/issues/new";

interface ContactSectionProps {
  /**
   * Pin the section to one theme, whatever the page is doing. Same contract as
   * FaqSection, so the two can be locked together.
   */
  themeLock?: "dark" | "light";
}

export default function ContactSection({ themeLock }: ContactSectionProps) {
  /* `.theme-dark` restates the dark palette as a scope, `.light` is the page
     override reused as one. */
  const scope =
    themeLock === "dark" ? "theme-dark" : themeLock === "light" ? "light" : "";

  return (
    <section
      id="contact"
      className={["scroll-mt-16", scope, "bg-(--bg-root) text-(--text-primary)"]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto w-full max-w-384">
        {/* The frame closes here: FaqSection draws top, left and right and
            leaves the bottom open, so this block supplies the dividing line and
            the closing edge. */}
        <div className="border-r border-b border-l border-t border-(--hairline)">
          <div className="flex flex-col items-center px-4 py-16 text-center sm:px-8 sm:py-20 md:px-12 md:py-24 lg:px-16 lg:py-28">
            <h2 className="text-3xl font-bold tracking-tight text-(--text-primary) md:text-4xl">
              Still have questions?
            </h2>

            <p className="mt-4 max-w-xl text-lg font-light leading-relaxed text-(--text-secondary) md:text-xl">
              Tell us what you were trying to do and we will point you at the
              answer.
            </p>

            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="
                mt-8 inline-flex items-center justify-center gap-2.5 rounded-lg
                bg-(--solid-bg) px-5 py-3
                text-sm font-bold text-(--solid-text)
                transition-colors duration-200 motion-reduce:transition-none
                hover:bg-(--solid-bg-hover)
                focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none
              "
            >
              <HugeiconsIcon
                icon={Mail01Icon}
                size={18}
                strokeWidth={1.8}
                aria-hidden="true"
              />
              Contact us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
