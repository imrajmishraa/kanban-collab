import PersonAvatar from "./PersonAvatar";
import ProTag from "./ProTag";

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
export default function ProfileCard({
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
