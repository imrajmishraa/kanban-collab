import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

import { GithubLogo } from "./GithubLogo";
import { GoogleLogo } from "./GoogleLogo";

/** What the provider is called in a sentence. */
const LABEL = { google: "Google", github: "GitHub" } as const;

const LOGO = { google: GoogleLogo, github: GithubLogo } as const;

/**
 * How much room the button takes, not what it looks like.
 *
 *   sm     the sign-in pair, side by side: 12px, a hairline of padding.
 *   block  one provider per row, full width: 56px tall, 15px label, and the
 *          label reads "Continue with …" because it is the only thing on the row.
 *
 * The two share every other decision — border, ink, hover, focus, the disabled
 * state — so they cannot drift. Radius, height and type size belong to the
 * variant, never to both: two `rounded-*` classes on one element resolve by the
 * order Tailwind emits them, which is not the order they are written in.
 */
export type OAuthButtonVariant = "sm" | "block";

export function OAuthButton({
  provider,
  loading,
  disabled,
  onClick,
  variant = "sm",
}: {
  provider: "google" | "github";
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  variant?: OAuthButtonVariant;
}) {
  const label = LABEL[provider];
  const Logo = LOGO[provider];
  const block = variant === "block";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Continue with ${label}`}
      className={[
        "group/oauth relative flex items-center justify-center",
        "border border-(--border-strong) bg-(--bg-root)",
        "font-sans font-semibold text-(--text-primary)",
        "transition-all duration-200",
        "hover:border-(--border) hover:bg-(--bg-hover)/20",
        "focus-visible:ring-2 focus-visible:ring-(--brand)/40 focus-visible:outline-hidden",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "active:scale-[0.99] motion-reduce:active:scale-100",
        block
          ? "h-14 w-full gap-3 rounded-xl text-[15px]"
          : "gap-2.5 rounded-lg px-3 py-2.5 text-[12px]",
      ].join(" ")}
    >
      {loading ? (
        <HugeiconsIcon
          icon={Loading03Icon}
          size={block ? 19 : 16}
          className="animate-spin motion-reduce:animate-none"
        />
      ) : (
        <Logo className={block ? "h-5 w-5" : "h-4 w-4"} />
      )}
      <span>{block ? `Continue with ${label}` : label}</span>
    </button>
  );
}
