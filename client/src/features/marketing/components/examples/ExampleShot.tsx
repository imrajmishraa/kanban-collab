import type { ReactNode } from "react";

interface ExampleShotProps {
  /** The line that rises out of the bottom edge on hover. */
  caption: string;
  /** Stage the frame in the dark palette — one example does. */
  dark?: boolean;
  children: ReactNode;
}

/**
 * One frame in the gallery.
 *
 * The hover affordance is the 3px border: transparent at rest, `--brand` under
 * the pointer, with the caption rising out of the bottom edge at the same time.
 * The frame's own background is a brand wash fading into the page, so a panel
 * placed on it reads as floating without needing a shadow to say so.
 */
export default function ExampleShot({
  caption,
  dark = false,
  children,
}: ExampleShotProps) {
  return (
    <figure className="group relative w-full min-w-0 sm:flex-1">
      <div className="rounded-xl border-[3px] border-transparent transition-colors duration-200 group-hover:border-(--brand) motion-reduce:transition-none">
        <div
          className={[
            "relative aspect-[580/500] overflow-hidden rounded-lg border border-(--hairline) bg-(--bg-root)",
            dark ? "dark-theme" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={
            dark
              ? undefined
              : {
                  backgroundImage:
                    "linear-gradient(180deg, var(--brand-wash) 0%, rgba(255, 255, 255, 0) 62%)",
                }
          }
        >
          {children}
        </div>
      </div>

      <figcaption className="pointer-events-none absolute bottom-5 left-1/2 z-10 max-w-[calc(100%-24px)] -translate-x-1/2 translate-y-1/2 truncate rounded-t-md bg-(--brand) px-3 py-1.5 text-[12px] font-semibold text-(--solid-text) opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none sm:text-[14px]">
        {caption}
      </figcaption>
    </figure>
  );
}
