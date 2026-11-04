import { useState, type ReactNode } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  BellIcon,
  ChartBarLineIcon,
  Copy01Icon,
  CubeIcon,
  Cupcake01Icon,
  CursorMagicSelection01Icon,
  File01Icon,
  GithubIcon,
  GlobeIcon,
  HierarchyIcon,
  Home01Icon,
  Medal01Icon,
  PackageIcon,
  PlusSignIcon,
  ServerIcon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/utils/cn";
import { Reveal } from "./Tilt";

/* ── Copy ───────────────────────────────────────────────────────────── */

const REPO_URL = "https://github.com/imrajmishraa/kanban-collab";
const DOCKER_CMD = "docker compose up -d";

/* ── Stack marks ────────────────────────────────────────────────────
   Brand paths are inlined from Simple Icons (CC0), so nothing is fetched
   at runtime and each mark keeps its own colour. Simple Icons has no
   Zustand or Yjs entry, so those two are Hugeicons glyphs in a token
   colour. Express and TanStack are drawn without a brand colour on
   purpose: #0A0A0A disappears on a dark tile and #ECE8D1 disappears on a
   light one, so both take the theme ink instead.
   ─────────────────────────────────────────────────────────────────── */

interface StackMark {
  name: string;
  /** Brand colour. Absent when the mark takes the theme ink. */
  hex?: string;
  /** Simple Icons path, in a 24x24 box. */
  path?: string;
  /** Hugeicons fallback for the two the icon set does not carry. */
  icon?: IconSvgElement;
  iconClass?: string;
}

const MARKS: StackMark[] = [
  {
    name: "React",
    hex: "#61DAFB",
    path: "M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z",
  },
  {
    name: "TypeScript",
    hex: "#3178C6",
    path: "M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z",
  },
  {
    name: "Vite",
    hex: "#9135FF",
    path: "M13.056 23.238a.57.57 0 0 1-1.02-.355v-5.202c0-.63-.512-1.143-1.144-1.143H5.148a.57.57 0 0 1-.464-.903l3.777-5.29c.54-.753 0-1.804-.93-1.804H.57a.574.574 0 0 1-.543-.746.6.6 0 0 1 .08-.157L5.008.78a.57.57 0 0 1 .467-.24h14.589a.57.57 0 0 1 .466.903l-3.778 5.29c-.54.755 0 1.806.93 1.806h5.745c.238 0 .424.138.513.322a.56.56 0 0 1-.063.603z",
  },
  {
    name: "Tailwind",
    hex: "#06B6D4",
    path: "M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z",
  },
  {
    name: "TanStack",
    path: "M12 0c6.627 0 9.166 4.102 9.166 12S18.626 24 12 24s-9.166-4.096-9.166-12c0-7.898 2.54-12 9.166-12m3.031 17.485c-.861 0-1.33.234-1.708.423-.327.164-.582.292-1.148.292-.567 0-.822-.128-1.148-.292-.378-.189-.848-.423-1.71-.423-.86 0-1.33.234-1.708.423-.327.164-.581.292-1.148.292v1.251c.862 0 1.331-.234 1.709-.423.326-.163.581-.292 1.148-.292s.821.129 1.148.292c.378.189.847.423 1.709.423.861 0 1.33-.234 1.709-.423.326-.163.58-.292 1.147-.292s.822.129 1.148.292c.378.189.848.423 1.71.423v-1.25c-.565 0-.822-.13-1.149-.293-.377-.189-.847-.423-1.709-.423m.41-12.536c.65-.586 0-1.648-.813-1.328-.45.18-.873.438-1.251.779a4.2 4.2 0 0 0-1.202 1.94 4.2 4.2 0 0 0-1.203-1.94 4.3 4.3 0 0 0-1.25-.779c-.814-.32-1.463.742-.814 1.328l2.385 2.153a4.86 4.86 0 0 0-2.731-.839c-.552 0-1.082.09-1.58.26-.836.284-.604 1.532.275 1.532h3.326a4.2 4.2 0 0 0-2.012.988 4 4 0 0 0-.9 1.165c-.403.776.588 1.529 1.237.948l2.686-2.42-.2 6.656c0 .08-.047.158-.107.223a5 5 0 0 1-.257-.123c-.378-.189-.848-.423-1.71-.423-.861 0-1.33.234-1.708.423-.327.164-.581.292-1.148.292v1.251c.861 0 1.33-.234 1.709-.423.326-.164.58-.292 1.148-.292.566 0 .821.128 1.148.292.377.189.847.423 1.708.423.862 0 1.332-.234 1.71-.423.326-.164.58-.292 1.147-.292s.822.128 1.148.292c.378.189.848.423 1.71.423v-1.25c-.565 0-.822-.13-1.149-.293v-.005c-.378-.19-.847-.424-1.709-.424-.861 0-1.33.235-1.709.424-.097.045-.189.094-.283.131a.34.34 0 0 1-.12-.232l-.2-6.69 2.722 2.457c.65.587 1.64-.166 1.236-.948a4.11 4.11 0 0 0-2.911-2.153h3.326c.882 0 1.108-1.245.275-1.531a4.88 4.88 0 0 0-4.311.578l2.385-2.152z",
  },
  {
    name: "Zustand",
    icon: CubeIcon,
    iconClass: "text-(--warning)",
  },
  {
    name: "Yjs",
    icon: HierarchyIcon,
    iconClass: "text-(--success)",
  },
  {
    name: "Express",
    path: "M12.262 16.666h1.146l6.975-9.325H19.22zm9.778 1.441v.004l-4.334-5.706-.557.74 4.873 6.682H.945V4.173h9.505l5.026 6.7.574-.772-4.374-5.928h.003l-.719-.945H0v17.544h24zM10.917 8.705a3.8 3.8 0 0 0-1.292-1.183q-.796-.45-1.916-.45c-.746 0-1.37.14-1.906.424a3.76 3.76 0 0 0-1.31 1.12 4.9 4.9 0 0 0-.75 1.581 7.17 7.17 0 0 0 0 3.696c.148.567.402 1.101.75 1.573a3.5 3.5 0 0 0 1.31 1.066q.803.39 1.906.389 1.77 0 2.739-.868.966-.867 1.328-2.457h-1.139q-.271 1.084-.977 1.734-.704.651-1.952.65-.812 0-1.392-.342a3.1 3.1 0 0 1-.957-.869 3.5 3.5 0 0 1-.551-1.182 5 5 0 0 1-.17-1.133 9 9 0 0 0-.015-.286 4.5 4.5 0 0 1 .015-.829c.047-.418.147-.83.296-1.223A3.7 3.7 0 0 1 5.54 9.05a2.9 2.9 0 0 1 .922-.742q.541-.28 1.246-.28c.47 0 .869.093 1.23.28q.541.281.922.742.379.461.587 1.057t.225 1.246H5.625l.004.957h6.182a7.3 7.3 0 0 0-.18-1.924 4.9 4.9 0 0 0-.715-1.68z",
  },
  {
    name: "MongoDB",
    hex: "#47A248",
    path: "M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0111.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 003.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z",
  },
  {
    name: "Redis",
    hex: "#FF4438",
    path: "M22.71 13.145c-1.66 2.092-3.452 4.483-7.038 4.483-3.203 0-4.397-2.825-4.48-5.12.701 1.484 2.073 2.685 4.214 2.63 4.117-.133 6.94-3.852 6.94-7.239 0-4.05-3.022-6.972-8.268-6.972-3.752 0-8.4 1.428-11.455 3.685C2.59 6.937 3.885 9.958 4.35 9.626c2.648-1.904 4.748-3.13 6.784-3.744C8.12 9.244.886 17.05 0 18.425c.1 1.261 1.66 4.648 2.424 4.648.232 0 .431-.133.664-.365a100.49 100.49 0 0 0 5.54-6.765c.222 3.104 1.748 6.898 6.014 6.898 3.819 0 7.604-2.756 9.33-8.965.2-.764-.73-1.361-1.261-.73zm-4.349-5.013c0 1.959-1.926 2.922-3.685 2.922-.941 0-1.664-.247-2.235-.568 1.051-1.592 2.092-3.225 3.21-4.973 1.972.334 2.71 1.43 2.71 2.619z",
  },
];

const ASSURANCES = [
  { label: "Real-time by default", icon: CursorMagicSelection01Icon },
  { label: "Self-hostable", icon: ServerIcon },
  { label: "Open source", icon: GithubIcon },
];

/* ── Background glyphs ──────────────────────────────────────────────
   The faint outlined icons that sit behind each card, positioned by
   class so they hold their place as the card flexes.
   ─────────────────────────────────────────────────────────────────── */

interface Glyph {
  icon: IconSvgElement;
  at: string;
  size: number;
}

const CARD_ONE_GLYPHS: Glyph[] = [
  { icon: Home01Icon, at: "right-[7%] top-[41%]", size: 56 },
  { icon: ArrowUpRight01Icon, at: "right-[30%] top-[71%]", size: 26 },
  { icon: BellIcon, at: "left-[7%] bottom-[15%]", size: 54 },
  { icon: File01Icon, at: "left-[52%] bottom-[13%]", size: 38 },
];

const CARD_TWO_GLYPHS: Glyph[] = [
  { icon: GlobeIcon, at: "right-[24%] top-[24%]", size: 58 },
  { icon: ChartBarLineIcon, at: "right-[7%] top-[45%]", size: 48 },
  { icon: Medal01Icon, at: "right-[27%] bottom-[36%]", size: 40 },
  { icon: Home01Icon, at: "left-[13%] bottom-[15%]", size: 54 },
  { icon: Cupcake01Icon, at: "left-[61%] bottom-[13%]", size: 44 },
];

function Glyphs({ items }: { items: Glyph[] }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
    >
      {items.map(({ icon, at, size }, index) => (
        <HugeiconsIcon
          key={index}
          icon={icon}
          size={size}
          strokeWidth={1}
          className={cn(
            /* Brand-tinted, not grey: the marks read as the card's own colour
               rather than as stray UI. They stay behind the content, so the
               wash is the point. */
            "absolute text-(--brand) opacity-30 transition-opacity duration-500 motion-reduce:transition-none",
            /* Once the detail layer is open the marks step back to a ghost, so
               they never compete with the copy on top of them. */
            "group-data-[open=true]:opacity-5",
            at,
          )}
        />
      ))}
    </div>
  );
}

/* ── The two-layer card ─────────────────────────────────────────────
   The detail layer opens from the corner button and nowhere else, so
   the card does not flip under the cursor while someone is reading it.
   ─────────────────────────────────────────────────────────────────── */

interface ExpandableCardProps {
  label: string;
  title: string;
  glyphs: Glyph[];
  collapsed: ReactNode;
  expanded: ReactNode;
}

function ExpandableCard({
  label,
  title,
  glyphs,
  collapsed,
  expanded,
}: ExpandableCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      data-open={open}
      className="
        group relative flex min-h-100 flex-1 flex-col overflow-hidden
        rounded-xl border border-(--hairline)
        bg-[linear-gradient(to_bottom,var(--tint-6),var(--tint-2))]
        p-6 sm:p-10 lg:min-h-130 lg:px-15 lg:py-10
      "
    >
      {/* Warm bloom in the corner, so the mat is not flat */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -right-24 z-0 size-72 rounded-full bg-(--accent-soft) blur-3xl"
      />

      <Glyphs items={glyphs} />

      {/* ── Collapsed layer ── */}
      <div
        className="
          relative z-10 flex flex-1 flex-col
          transition-all duration-500 ease-in-out motion-reduce:transition-none
          opacity-100
          group-data-[open=true]:opacity-0
        "
      >
        <div className="flex-1">
          <div className="mb-2.5 text-[16px] font-medium text-(--accent)">
            {label}
          </div>
          <h3 className="text-2xl font-bold leading-[1.15] text-(--text-primary) md:text-[36px]">
            {title}
          </h3>
        </div>

        <div className="flex flex-1 items-center">{collapsed}</div>

        <div className="flex-1" />
      </div>

      {/* ── Detail layer: button only ── */}
      <div
        className="
          pointer-events-none absolute inset-0 z-10 flex flex-col
          p-6 sm:p-10 lg:px-15 lg:py-10
          transition-all duration-500 ease-in-out motion-reduce:transition-none
          opacity-0
          group-data-[open=true]:pointer-events-auto group-data-[open=true]:opacity-100
        "
      >
        {expanded}
      </div>

      {/* ── Corner control ── */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Collapse card" : "Expand card"}
        className="
          absolute bottom-10 right-10 z-20 flex size-14 items-center justify-center
          rounded-full border border-(--hairline-strong) bg-(--bg-root)
          text-(--text-primary)
          transition-transform duration-300 motion-reduce:transition-none
          hover:scale-110
          focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none
        "
      >
        <HugeiconsIcon
          icon={PlusSignIcon}
          size={22}
          strokeWidth={1.6}
          className={cn(
            "transition-transform duration-300 motion-reduce:transition-none",
            open && "rotate-45",
          )}
        />
      </button>
    </div>
  );
}

/* ── Stack grid, shared by both layers of the first card ───────────── */

function StackGrid({ dense = false }: { dense?: boolean }) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-5",
        dense ? "gap-1.5" : "gap-2 sm:gap-3",
      )}
    >
      {MARKS.map((mark) => (
        <div
          key={mark.name}
          role="img"
          aria-label={mark.name}
          title={mark.name}
          className="
            flex aspect-square items-center justify-center rounded-[10px]
            border border-(--hairline) bg-(--bg-surface) p-1
          "
        >
          {mark.path ? (
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={cn(
                dense ? "size-5 sm:size-5.5" : "size-6 sm:size-6.5",
                !mark.hex && "text-(--text-primary)",
              )}
              fill={mark.hex ?? "currentColor"}
            >
              <path d={mark.path} />
            </svg>
          ) : mark.icon ? (
            <HugeiconsIcon
              icon={mark.icon}
              size={dense ? 22 : 28}
              strokeWidth={1.6}
              aria-hidden="true"
              className={mark.iconClass}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

/* ── Section ────────────────────────────────────────────────────────── */

export default function HowItWorksSection() {
  const [copied, setCopied] = useState(false);

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(DOCKER_CMD);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard blocked: the command is selectable in the field anyway. */
    }
  };

  return (
    <section className="light relative">
      {/* The frame carries the rules, the content keeps its own width and
          padding: borders sit at max-w-384 like the FAQ, while the copy and
          cards stay on the max-w-7xl measure they had before. */}
      <div className="mx-auto w-full max-w-384 border-x border-t border-(--hairline)">
        <div className="mx-auto max-w-7xl mb-10 px-10 py-30 sm:px-6 sm:py-24 lg:px-8">
          {/* ── Heading ── */}
          <div className="mx-auto w-full max-w-245 text-center">
            <Reveal>
              <h2 className="font-sans text-[32px] font-bold leading-[1.2] tracking-[-1px] text-(--text-primary) md:text-[40px]">
                Build the way{" "}
                <span className="text-(--text-subtle)">you need.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="pt-4 text-center text-[18px] leading-7 text-(--text-secondary) antialiased sm:text-[20px] md:pt-2">
                Fine-tuned for performance and supports many popular dev
                formats.
              </p>
            </Reveal>
          </div>

          {/* ── Cards ── */}
          <div className="mt-20.25 flex w-full flex-col items-stretch justify-center gap-6 md:flex-row md:gap-8">
            <Reveal className="flex flex-1">
              <ExpandableCard
                label="Popular frameworks"
                title="Easy integrations"
                glyphs={CARD_ONE_GLYPHS}
                collapsed={<StackGrid />}
                expanded={
                  <div className="flex h-full flex-col">
                    <div className="w-full max-w-105 rounded-[10px] bg-(--tint-6) p-4">
                      <StackGrid dense />
                    </div>

                    <p className="mt-6 max-w-105 text-[16px] leading-7 text-(--text-secondary) antialiased md:text-[20px]">
                      Kanban Collab runs on React, TypeScript, Vite, Tailwind,
                      TanStack Query, Zustand, Yjs, Express, MongoDB and Redis.
                      Nothing exotic, nothing you have to learn twice.
                    </p>

                    <a
                      href={REPO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-1.5 text-[18px] font-bold text-(--accent) hover:underline"
                    >
                      Read the source
                      <HugeiconsIcon
                        icon={ArrowUpRight01Icon}
                        size={18}
                        strokeWidth={1.8}
                      />
                    </a>
                  </div>
                }
              />
            </Reveal>

            <Reveal delay={0.1} className="flex flex-1">
              <ExpandableCard
                label="Run it yourself"
                title="Docker"
                glyphs={CARD_TWO_GLYPHS}
                collapsed={
                  <div className="relative flex w-full items-center justify-center py-2">
                    {/* Glow behind the lockup */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute size-56 rounded-full bg-(--accent-soft) blur-3xl"
                    />

                    <div className="relative flex size-28 items-center justify-center rounded-[20px] border border-(--hairline) bg-(--bg-surface)">
                      <HugeiconsIcon
                        icon={PackageIcon}
                        size={52}
                        strokeWidth={1.4}
                        className="text-(--accent)"
                      />
                    </div>
                  </div>
                }
                expanded={
                  <div className="flex h-full flex-col">
                    <p className="max-w-110.5 text-[16px] leading-7 text-(--text-secondary) antialiased md:text-[20px]">
                      Bring the whole stack up on your own machine or your own
                      box. One command, no accounts, no hosted dependency.
                    </p>

                    <div className="mt-6 w-full max-w-110">
                      <div className="rounded-xl border-2 border-(--accent) bg-(--bg-root) p-1.5">
                        <div className="flex items-center rounded-[10px] bg-(--tint-4) pl-4">
                          <input
                            readOnly
                            value={DOCKER_CMD}
                            aria-label="Docker compose command"
                            className="h-12.5 flex-1 truncate bg-transparent font-mono text-[13px] text-(--text-secondary) outline-none sm:text-[15px]"
                          />
                          <button
                            type="button"
                            onClick={copyCommand}
                            aria-label="Copy command"
                            className="
                              ml-2 flex h-12.5 items-center gap-2 rounded-[10px]
                              border border-(--hairline-strong) bg-(--tint-6)
                              px-3 text-[13px] font-bold text-(--text-primary)
                              transition-colors duration-200 motion-reduce:transition-none
                              hover:bg-(--tint-10)
                              focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none
                              sm:px-4 sm:text-[15px]
                            "
                          >
                            <HugeiconsIcon
                              icon={Copy01Icon}
                              size={18}
                              strokeWidth={1.8}
                            />
                            {copied ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <a
                      href={REPO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-1.5 text-[18px] font-bold text-(--accent) hover:underline"
                    >
                      Read the setup guide
                      <HugeiconsIcon
                        icon={ArrowUpRight01Icon}
                        size={18}
                        strokeWidth={1.8}
                      />
                    </a>
                  </div>
                }
              />
            </Reveal>
          </div>

          {/* ── Assurance row ── */}
          <Reveal delay={0.16} className="w-full">
            <div className="mt-10 flex flex-col items-center justify-center gap-6 md:mt-12.5 md:flex-row md:gap-31 lg:mt-16">
              {ASSURANCES.map(({ label, icon }) => (
                <div
                  key={label}
                  className="flex w-full items-center gap-2 sm:w-auto"
                >
                  <HugeiconsIcon
                    icon={icon}
                    size={24}
                    strokeWidth={1.6}
                    className="shrink-0 text-(--accent)"
                  />
                  <h3 className="text-[20px] font-medium text-(--text-primary) antialiased">
                    {label}
                  </h3>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
