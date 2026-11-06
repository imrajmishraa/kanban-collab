import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  ChartBarLineIcon,
  CodeIcon,
  CommandIcon,
  CubeIcon,
  GlobeIcon,
  Layers01Icon,
  Rocket01Icon,
  ServerIcon,
} from "@hugeicons/core-free-icons";

/**
 * Brand marks, drawn as inline paths rather than loaded from a CDN.
 *
 * The path data is from Simple Icons (simpleicons.org), which publishes every
 * mark as a single 24x24 path in CC0, alongside the brand colour it is meant to
 * be drawn in. Inlining them keeps the section working offline and keeps four
 * logos out of the network waterfall.
 *
 * These four are the one place in the app where a mark is drawn in its own
 * colour rather than in `currentColor`: a credit row of grey logos says nothing,
 * and these are third-party identities rather than UI. The colour rides on the
 * `fill` attribute of each path, not on a class, so it is outside the token
 * system on purpose.
 */
const MARKS = {
  mongodb:
    "M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0111.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 003.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z",
  redis:
    "M22.71 13.145c-1.66 2.092-3.452 4.483-7.038 4.483-3.203 0-4.397-2.825-4.48-5.12.701 1.484 2.073 2.685 4.214 2.63 4.117-.133 6.94-3.852 6.94-7.239 0-4.05-3.022-6.972-8.268-6.972-3.752 0-8.4 1.428-11.455 3.685C2.59 6.937 3.885 9.958 4.35 9.626c2.648-1.904 4.748-3.13 6.784-3.744C8.12 9.244.886 17.05 0 18.425c.1 1.261 1.66 4.648 2.424 4.648.232 0 .431-.133.664-.365a100.49 100.49 0 0 0 5.54-6.765c.222 3.104 1.748 6.898 6.014 6.898 3.819 0 7.604-2.756 9.33-8.965.2-.764-.73-1.361-1.261-.73zm-4.349-5.013c0 1.959-1.926 2.922-3.685 2.922-.941 0-1.664-.247-2.235-.568 1.051-1.592 2.092-3.225 3.21-4.973 1.972.334 2.71 1.43 2.71 2.619z",
  express:
    "M24 18.588a1.529 1.529 0 01-1.895-.72l-3.45-4.771-.5-.667-4.003 5.444a1.466 1.466 0 01-1.802.708l5.158-6.92-4.798-6.251a1.595 1.595 0 011.9.666l3.576 4.83 3.596-4.81a1.435 1.435 0 011.788-.668L21.708 7.9l-2.522 3.283a.666.666 0 000 .994l4.804 6.412zM.002 11.576l.42-2.075c1.154-4.103 5.858-5.81 9.094-3.27 1.895 1.489 2.368 3.597 2.275 5.973H1.116C.943 16.447 4.005 19.009 7.92 17.7a4.078 4.078 0 002.582-2.876c.207-.666.548-.78 1.174-.588a5.417 5.417 0 01-2.589 3.957 6.272 6.272 0 01-7.306-.933 6.575 6.575 0 01-1.64-3.858c0-.235-.08-.455-.134-.666A88.33 88.33 0 010 11.577zm1.127-.286h9.654c-.06-3.076-2.001-5.258-4.59-5.278-2.882-.04-4.944 2.094-5.071 5.264z",
  vite: "m8.286 10.578.512-8.657a.306.306 0 0 1 .247-.282L17.377.006a.306.306 0 0 1 .353.385l-1.558 5.403a.306.306 0 0 0 .352.385l2.388-.46a.306.306 0 0 1 .332.438l-6.79 13.55-.123.19a.294.294 0 0 1-.252.14c-.177 0-.35-.152-.305-.369l1.095-5.301a.306.306 0 0 0-.388-.355l-1.433.435a.306.306 0 0 1-.389-.354l.69-3.375a.306.306 0 0 0-.37-.36l-2.32.536a.306.306 0 0 1-.374-.316zm14.976-7.926L17.284 3.74l-.544 1.887 2.077-.4a.8.8 0 0 1 .84.369.8.8 0 0 1 .034.783L12.9 19.93l-.013.025-.015.023-.122.19a.801.801 0 0 1-.672.37.826.826 0 0 1-.634-.302.8.8 0 0 1-.16-.67l1.029-4.981-1.12.34a.81.81 0 0 1-.86-.262.802.802 0 0 1-.165-.67l.63-3.08-2.027.468a.808.808 0 0 1-.768-.233.81.81 0 0 1-.217-.6l.389-6.57-7.44-1.33a.612.612 0 0 0-.64.906L11.58 23.691a.612.612 0 0 0 1.066-.004l11.26-20.135a.612.612 0 0 0-.644-.9z",
} as const;

type Mark = keyof typeof MARKS;

interface Supporter {
  name: string;
  description: string;
  href: string;
  mark: Mark;
  /** The brand's own colour, from Simple Icons. */
  hex: string;
  /**
   * Set when the brand colour is too dark to survive a dark surface. Express is
   * #0A0A0A, which disappears on a near-black card, so it is drawn in the theme
   * ink instead: white here, and still correct if this band ever goes light.
   */
  darkInk?: boolean;
}

const SUPPORTERS: Supporter[] = [
  {
    name: "MongoDB",
    description: "Where boards, cards, comments and members are stored.",
    href: "https://www.mongodb.com",
    mark: "mongodb",
    hex: "#47A248",
  },
  {
    name: "Redis",
    description: "Sessions, presence and the queues behind real-time updates.",
    href: "https://redis.io",
    mark: "redis",
    hex: "#FF4438",
  },
  {
    name: "Express",
    description: "The HTTP layer every request in this app passes through.",
    href: "https://expressjs.com",
    mark: "express",
    hex: "#0A0A0A",
    darkInk: true,
  },
  {
    name: "Vite",
    description: "Builds the client you are reading this in.",
    href: "https://vite.dev",
    mark: "vite",
    hex: "#9135FF",
  },
];

/* ── Backdrop ───────────────────────────────────────────────────────
   The same treatment the How It Works cards use: outlined Hugeicons held
   behind the content in brand at low opacity, so the band has texture without
   anything competing with the logos in front of it.
   ─────────────────────────────────────────────────────────────────── */

interface Glyph {
  icon: IconSvgElement;
  at: string;
  size: number;
}

const GLYPHS: Glyph[] = [
  { icon: ServerIcon, at: "right-[32%] top-[30%]", size: 54 },
  { icon: CodeIcon, at: "left-[38%] top-[12%]", size: 44 },
  { icon: Layers01Icon, at: "left-[-2%] top-[4%]", size: 62 },
  { icon: Rocket01Icon, at: "right-[12%] top-[10%]", size: 58 },
  { icon: CubeIcon, at: "right-[-2%] bottom-[24%]", size: 78 },
  { icon: CommandIcon, at: "left-[52%] bottom-[3%]", size: 35 },
  { icon: GlobeIcon, at: "right-[46%] top-[6%]", size: 38 },
  { icon: ChartBarLineIcon, at: "left-[10%] bottom-[4%]", size: 40 },
];

export default function HomeSupportedBy() {
  return (
    <section className="relative scroll-mt-16">
      {/* The dark surface is the frame itself, not the full-bleed section, so
          the black stops at the vertical rules instead of running edge to edge
          across the page. `dark-theme` lives here too, which keeps every token
          inside this box on the dark palette. */}
      <div
        className="
          dark-theme relative mx-auto w-full max-w-384 overflow-hidden
          border-x border-(--hairline) bg-(--bg-root) text-(--text-primary)
        "
      >
        {/* Outlined marks, clipped to the frame */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
        >
          {GLYPHS.map(({ icon, at, size }, index) => (
            <HugeiconsIcon
              key={index}
              icon={icon}
              size={size}
              strokeWidth={1}
              className={`absolute text-(--brand) opacity-15 ${at}`}
            />
          ))}
        </div>

        {/* The glow, built the way the closing banner builds its own: brand at
            ten percent, a 100px blur and a 40 percent radius, so it reads as an
            ellipse of light bleeding in from the edges rather than a circle
            sitting in the corner. The frame's `overflow-hidden` keeps it inside
            the box, so it lights this band and nothing outside it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 -bottom-6 top-8 z-0 rounded-[40%] bg-(--inverse-accent)/10 blur-[100px]"
        />

        <div className="relative z-10 px-4 py-10 sm:px-8 sm:py-12 md:px-12 md:py-14 lg:px-16">
          <div className="mb-10 max-w-3xl sm:mb-12 md:mb-14">
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-(--text-primary) md:text-4xl">
              Supported by
            </h2>
            <p className="max-w-2xl text-xl font-light leading-relaxed text-(--text-secondary)">
              These projects do the parts this app would be worse at doing
              itself.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {SUPPORTERS.map((supporter) => (
              <a
                key={supporter.name}
                href={supporter.href}
                target="_blank"
                rel="noopener sponsored"
                aria-label={`${supporter.name}, visit website`}
                className="group relative block h-32 perspective-[1000px]"
              >
                <div className="relative h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] transform-3d group-hover:transform-[rotateX(180deg)] group-focus-visible:transform-[rotateX(180deg)] motion-reduce:transition-none">
                  {/* Front. Same surface as a How It Works card: a hairline and
                      a translucent wash top to bottom, so the dark behind it
                      shows through and it reads as glass rather than a panel. */}
                  <div
                    className="
                      absolute inset-0 flex items-center justify-center gap-3 rounded-xl
                      border border-(--hairline) px-6 backface-hidden
                      bg-[linear-gradient(to_bottom,var(--tint-6),var(--tint-2))]
                    "
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill={supporter.darkInk ? "currentColor" : supporter.hex}
                      className={
                        supporter.darkInk
                          ? "size-10 shrink-0 text-(--text-primary)"
                          : "size-10 shrink-0"
                      }
                    >
                      <path d={MARKS[supporter.mark]} />
                    </svg>
                    <span className="text-xl md:text-2xl font-medium tracking-tight text-(--text-primary)">
                      {supporter.name}
                    </span>
                  </div>

                  {/* Back: the same glass, one step lighter so the flip reads */}
                  <div
                    className="
                      absolute inset-0 flex flex-col items-center justify-center gap-2.5
                      rounded-xl border border-(--hairline) px-5 py-4 text-center
                      backface-hidden transform-[rotateX(180deg)]
                      bg-[linear-gradient(to_bottom,var(--tint-5),var(--tint-2))]
                    "
                  >
                    <p className="text-sm leading-snug text-(--text-secondary)">
                      {supporter.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-(--text-primary)">
                      Visit website
                      <HugeiconsIcon
                        icon={ArrowUpRight01Icon}
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
