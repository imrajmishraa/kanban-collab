import { HugeiconsIcon } from "@hugeicons/react";
import {
  CloudServerIcon,
  CodeIcon,
  FlashIcon,
  GithubIcon,
  ServerIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

const REASONS = [
  {
    icon: FlashIcon,
    title: "Real-time by default",
    body: "Two people, one board, no refresh. The board is a shared document, not a poll.",
  },
  {
    icon: ServerIcon,
    title: "Self-hosted",
    body: "Your boards in your MongoDB, on your hostname. No hosted middle layer.",
  },
  {
    icon: GithubIcon,
    title: "Open source",
    body: "MIT licensed. Read it before you run it, fork it if you need to.",
  },
  {
    icon: UserGroupIcon,
    title: "No seat counting",
    body: "Invite the whole team. The ceiling is your hardware, not a licence tier.",
  },
  {
    icon: CloudServerIcon,
    title: "Works offline",
    body: "Edits made without a connection reconcile when it comes back.",
  },
  {
    icon: CodeIcon,
    title: "One command",
    body: "docker compose up -d brings up the client, API, Mongo and Redis.",
  },
];

/**
 * The closing argument, staged dark.
 *
 * Six reasons in two columns, each a mark, a title and one line — the shape the
 * reference uses for "why this thing". Dark because it is the last thing before
 * the call to action, and a light page needs somewhere for the eye to stop.
 */
export default function SolutionsWhy() {
  return (
    <section className="dark-theme border-b border-(--hairline) bg-(--bg-root)">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <h2 className="max-w-2xl font-sans text-[28px] font-bold leading-[1.2] tracking-[-1px] text-(--text-primary) sm:text-[34px] md:text-[38px]">
          Why teams run the board themselves.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-x-16 gap-y-10 sm:grid-cols-2">
          {REASONS.map((reason) => (
            <div key={reason.title} className="flex items-start gap-4">
              <span className="mt-0.5 shrink-0 text-(--brand)">
                <HugeiconsIcon
                  icon={reason.icon}
                  size={28}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </span>

              <div>
                <h3 className="text-[17px] font-semibold leading-[1.3] tracking-[-0.2px] text-(--text-primary) sm:text-[18px]">
                  {reason.title}
                </h3>
                <p className="mt-1 max-w-95 text-[14px] leading-[1.6] text-(--text-secondary) sm:text-[15px]">
                  {reason.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
