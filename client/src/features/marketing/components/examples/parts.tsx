import { useState, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, UserIcon } from "@hugeicons/core-free-icons";

/**
 * The parts the example panels are drawn from.
 *
 * They are deliberately dumb: a hairline box, a row, a separator. Nothing here
 * carries `shadow-*` — the design system separates a floating panel from the
 * page with an edge, not a drop shadow — and every colour is a token, so the
 * same parts work inside `.dark-theme` without a second set.
 */

interface SlotProps {
  children: ReactNode;
  className?: string;
}

/** An absolutely positioned panel. The caller places it with `className`. */
export function Panel({ children, className = "" }: SlotProps) {
  return (
    <div
      className={[
        "absolute overflow-hidden rounded-xl border border-(--hairline)",
        "bg-(--bg-surface) text-(--text-primary)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

/** A panel that is not positioned — for a card inside another composition. */
export function Surface({ children, className = "" }: SlotProps) {
  return (
    <div
      className={[
        "overflow-hidden rounded-xl border border-(--hairline)",
        "bg-(--bg-surface) text-(--text-primary)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

/** The 8px inset a menu's rows sit in, so a row's tint stops short of the edge. */
export function PanelBody({ children, className = "" }: SlotProps) {
  return <div className={`p-1.5 sm:p-2 ${className}`}>{children}</div>;
}

export function Sep() {
  return <div className="h-px bg-(--hairline)" />;
}

interface MenuRowProps {
  icon?: ReactNode;
  label: ReactNode;
  /** The row the pointer is on: a tint, and one weight heavier. */
  active?: boolean;
  danger?: boolean;
  /** A right chevron, for a row that opens something. */
  chevron?: boolean;
  /** Right-aligned mono: a key chord, a count, a permission. */
  hint?: string;
  /** A control at the end of the row — a switch, usually. */
  trailing?: ReactNode;
  /** A second, quieter line under the label instead of a label in the row. */
  helper?: boolean;
}

export function MenuRow({
  icon,
  label,
  active,
  danger,
  chevron,
  hint,
  trailing,
  helper,
}: MenuRowProps) {
  return (
    <div
      className={[
        "flex gap-2 px-2 py-1.75 text-[12px] leading-[1.45] tracking-[-0.2px]",
        "sm:gap-3 sm:px-2.5 sm:py-2.25 sm:text-[14px]",
        helper ? "items-start" : "items-center",
        active ? "rounded-md bg-(--tint-4) font-semibold" : "",
        danger ? "text-(--danger)" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon ? (
        <span
          className={[
            "mt-px shrink-0 [&_svg]:size-3.5 sm:[&_svg]:size-4",
            danger ? "text-(--danger)" : "text-(--text-muted)",
          ].join(" ")}
        >
          {icon}
        </span>
      ) : null}

      <span
        className={
          helper
            ? "flex-1 whitespace-normal text-[10.5px] leading-[1.4] text-(--text-muted) sm:text-[12px]"
            : "flex-1 truncate"
        }
      >
        {label}
      </span>

      {hint ? <Shortcut>{hint}</Shortcut> : null}

      {chevron ? (
        <span className="shrink-0 text-(--text-subtle)">
          <HugeiconsIcon icon={ArrowRight01Icon} size={13} strokeWidth={1.9} />
        </span>
      ) : null}

      {trailing}
    </div>
  );
}

/** A key chord, set the way the product sets one: mono, small, quiet. */
export function Shortcut({ children }: { children: ReactNode }) {
  return (
    <span className="shrink-0 font-mono text-[9px] tracking-[0.02em] text-(--text-subtle) sm:text-[10px]">
      {children}
    </span>
  );
}

interface ProfileCardProps {
  name: string;
  mail: string;
  /** A profile image URL; without one the placeholder face is drawn. */
  avatar?: string;
  pro?: boolean;
}

/**
 * The profile strip that floats above a menu.
 *
 * It is its own surface — a second panel, not the first row of the menu — which
 * is what makes the account popover read as a card stack rather than a list
 * with a heading.
 */
export function ProfileCard({
  name,
  mail,
  avatar,
  pro = true,
}: ProfileCardProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-(--hairline) bg-(--bg-surface) px-2.5 py-2 text-(--text-primary) sm:gap-2.5 sm:px-3 sm:py-2.5">
      <PersonAvatar src={avatar} className="size-7 sm:size-8" />
      <div className="min-w-0">
        <div className="truncate text-[12px] font-semibold tracking-[-0.2px] sm:text-[14px]">
          {name}
        </div>
        <div className="truncate text-[10.5px] text-(--text-muted) sm:text-[12px]">
          {mail}
        </div>
      </div>
      {pro ? <ProTag /> : null}
    </div>
  );
}

interface PersonAvatarProps {
  /**
   * A profile image URL. With one, the photo fills the circle; without one, the
   * placeholder face is drawn instead — which is what the product shows before
   * someone uploads anything.
   */
  src?: string;
  /** Only needed when the avatar is the only thing naming the person. */
  alt?: string;
  /**
   * The hairline around the placeholder. Turn it off when the caller draws its
   * own ring, so the two edges do not sit one inside the other.
   */
  bordered?: boolean;
  className?: string;
}

/**
 * A round avatar that takes a URL.
 *
 * The image is clipped by the circle rather than being a circle itself, so a
 * square or oversized source still lands correctly. A URL that fails to load
 * falls back to the placeholder face instead of a broken-image glyph, and the
 * failure is remembered against the URL — pass a new `src` and it tries again.
 */
export function PersonAvatar({
  src,
  alt = "",
  bordered = true,
  className = "",
}: PersonAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && src !== failedSrc;

  return (
    <span
      className={[
        "grid size-8 shrink-0 place-items-center overflow-hidden rounded-full",
        "bg-(--tint-4) text-(--text-subtle)",
        // A photo carries its own edge; the placeholder needs the hairline to
        // sit on the page. A ring around a photo belongs to the caller, which is
        // how the letter draws its thin offset circle.
        showImage || !bordered ? "" : "border border-(--hairline)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          // A CDN that restricts by domain answers 403 to a localhost referer,
          // and the browser shows a broken image rather than the placeholder.
          // Sending no referer at all is what makes a hosted photo load in dev.
          referrerPolicy="no-referrer"
          aria-hidden={alt === "" ? "true" : undefined}
          onError={() => setFailedSrc(src ?? null)}
          className="size-full object-cover object-center"
        />
      ) : (
        <HugeiconsIcon
          icon={UserIcon}
          size={16}
          strokeWidth={1.6}
          aria-hidden="true"
        />
      )}
    </span>
  );
}

interface AccountHeaderProps {
  name: string;
  mail: string;
  /** A profile image URL; without one the placeholder face is drawn. */
  avatar?: string;
  /** The plan tag. Off for the plain account rows in the share dialog. */
  pro?: boolean;
}

export function AccountHeader({
  name,
  mail,
  avatar,
  pro = false,
}: AccountHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-2.5 sm:gap-2.5 sm:px-3.5 sm:py-3">
      <PersonAvatar src={avatar} className="size-7 sm:size-8" />
      <div className="min-w-0">
        <div className="truncate text-[12px] font-semibold tracking-[-0.2px] sm:text-[14px]">
          {name}
        </div>
        <div className="truncate text-[10.5px] text-(--text-muted) sm:text-[12px]">
          {mail}
        </div>
      </div>
      {pro ? <ProTag /> : null}
    </div>
  );
}

/** The plan chip: brand wash, brand line, mono caps — never a solid fill. */
export function ProTag() {
  return (
    <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full border border-(--brand-line) bg-(--brand-wash) px-2 py-0.75 font-mono text-[9px] font-semibold uppercase tracking-widest text-(--brand)">
      <span className="size-1 rounded-full bg-(--brand)" />
      Pro
    </span>
  );
}

/** The quiet line under a menu — "last edited", "3 people here". */
export function Note({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border-t border-(--hairline) px-2.5 py-2 sm:px-3.5 sm:py-2.5">
      <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--text-subtle)">
        {label}
      </div>
      {value ? (
        <div className="mt-0.5 text-[10px] text-(--text-muted) sm:text-[11.5px]">
          {value}
        </div>
      ) : null}
    </div>
  );
}

interface SwitchProps {
  on?: boolean;
  className?: string;
}

export function Switch({ on = false, className = "" }: SwitchProps) {
  return (
    <span
      aria-hidden="true"
      className={[
        "ml-auto h-4.5 w-7.5 shrink-0 rounded-full transition-colors duration-150",
        on ? "bg-(--brand)" : "bg-(--tint-10)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          "mt-0.5 block size-3.5 rounded-full border border-(--hairline) bg-(--bg-surface) transition-transform duration-150",
          on ? "translate-x-3.5" : "translate-x-0.5",
        ].join(" ")}
      />
    </span>
  );
}

/** The mono register: labels, counts, keys. */
export function Mono({ children, className = "" }: SlotProps) {
  return (
    <span
      className={`font-mono text-[10px] uppercase leading-3.5 tracking-[0.16em] text-(--text-muted) ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * The identity palette. Eight values, the same in both themes, hashed from a
 * seed in the app — a fixed colour here, because an example has no user id.
 */
const IDENTITY = {
  brand: "#ff6b35",
  blue: "#4f9cf9",
  green: "#35d399",
  violet: "#b07cff",
  amber: "#f5b84b",
} as const;

interface AvatarProps {
  initials: string;
  tone?: keyof typeof IDENTITY;
  className?: string;
}

export function Avatar({
  initials,
  tone = "brand",
  className = "",
}: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      style={{ background: IDENTITY[tone] }}
      className={`grid size-5 place-items-center rounded-full text-[8px] font-bold text-(--on-color) ${className}`}
    >
      {initials}
    </span>
  );
}
