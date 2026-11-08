import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon } from "@hugeicons/core-free-icons";

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
export default function PersonAvatar({
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
