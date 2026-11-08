import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  BellIcon,
  ChartBarLineIcon,
  CubeIcon,
  Cupcake01Icon,
  File01Icon,
  GlobeIcon,
  HierarchyIcon,
  Home01Icon,
  Medal01Icon,
  PackageIcon,
} from "@hugeicons/core-free-icons";

/**
 * The depth behind the pricing hero.
 *
 * Same idiom as the glyphs behind the cards in "Build the way you need": a
 * handful of large, brand-tinted Hugeicons sitting at 30% opacity, placed by
 * class so they hold their position as the band resizes — plus a warm bloom in
 * each corner, because a flat wash is what makes a hero look like a panel.
 *
 * The marks are big on purpose. A grid of small grey icons reads as texture; a
 * few large brand-coloured ones read as the product's own vocabulary.
 */

interface Glyph {
  icon: IconSvgElement;
  at: string;
  size: number;
  /** Below `sm` the field gets in the way of the copy, so most of it steps out. */
  always?: boolean;
}

const GLYPHS: Glyph[] = [
  { icon: Home01Icon, at: "left-[3%] top-[18%]", size: 76, always: true },
  { icon: BellIcon, at: "right-[5%] top-[14%]", size: 68, always: true },
  { icon: GlobeIcon, at: "right-[13%] bottom-[16%]", size: 84 },
  { icon: File01Icon, at: "left-[11%] bottom-[13%]", size: 52 },
  { icon: ChartBarLineIcon, at: "left-[24%] top-[7%]", size: 40 },
  { icon: HierarchyIcon, at: "right-[27%] bottom-[7%]", size: 46 },
  { icon: Medal01Icon, at: "left-[1%] bottom-[40%]", size: 34 },
  { icon: CubeIcon, at: "right-[2%] top-[46%]", size: 38 },
  { icon: PackageIcon, at: "left-[38%] bottom-[3%]", size: 30 },
  { icon: Cupcake01Icon, at: "right-[38%] top-[4%]", size: 30 },
];

export default function PricingHeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="theme-dark pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Blooms: the same warm corner light the cards carry. */}
      <div
        className="absolute -left-32 -top-40 size-170 rounded-full blur-[120px]"
        style={{ filter: "blur(150px)" }}
      />
      <div className="absolute -right-28 -top-24 size-115 rounded-full bg-(--accent-soft) blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 size-115 rounded-full bg-(--brand-wash) blur-3xl" />

      {GLYPHS.map(({ icon, at, size, always }, index) => (
        <HugeiconsIcon
          key={index}
          icon={icon}
          size={size}
          strokeWidth={1}
          className={[
            "absolute text-(--brand) opacity-10",
            always ? "" : "hidden sm:block",
            at,
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ))}
    </div>
  );
}
