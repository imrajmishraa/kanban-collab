import { HugeiconsIcon } from "@hugeicons/react";
import { GithubLogo } from "./GithubLogo";
import { GoogleLogo } from "./GoogleLogo";
import { Loading03Icon } from "@hugeicons/core-free-icons";

export function OAuthButton({
  provider,
  loading,
  disabled,
  onClick,
}: {
  provider: "google" | "github";
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const label = provider === "google" ? "Google" : "GitHub";
  const Logo = provider === "google" ? GoogleLogo : GithubLogo;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Continue with ${label}`}
      className="
        group/oauth relative flex items-center justify-center gap-2.5
        rounded-lg border border-white/10 bg-white/3
        px-4 py-2.5 font-mono text-[12px] text-white/80
        transition-all duration-200
        hover:border-white/20 hover:bg-white/5 hover:text-white
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand)/40
        disabled:cursor-not-allowed disabled:opacity-50
        active:scale-[0.99]
      "
    >
      {loading ? (
        <HugeiconsIcon
          icon={Loading03Icon}
          size={16}
          className="animate-spin"
        />
      ) : (
        <Logo className="h-4 w-4" />
      )}
      <span>{label}</span>
    </button>
  );
}
