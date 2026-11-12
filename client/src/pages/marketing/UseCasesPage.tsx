import { lazy, Suspense, type ComponentType } from "react";

import {
  AccountMenuExample,
  PageShell,
  BoardMenusExample,
  CommandPaletteExample,
  DarkWorkspaceExample,
  ExamplesHero,
  NotificationsExample,
  ShareDialogExample,
  ViewsSection,
} from "@/features/marketing";

const HomeClosingCTA = lazy(() =>
  import("@/features/marketing").then((module) => ({
    default: module.HomeClosingCTA,
  })),
);

/**
 * Examples — the gallery of UI built from the system.
 *
 * Two frames per row, in the order they argue for something: menus, then the
 * dark theme, then the account panel and the palette, then sharing and
 * notifications. The screens are drawn rather than photographed, because a
 * screenshot goes stale the moment a component changes and an empty frame would
 * say nothing.
 */

interface Row {
  id: string;
  Shot: ComponentType;
}

const ROWS: Row[][] = [
  [
    { id: "menus", Shot: BoardMenusExample },
    { id: "dark", Shot: DarkWorkspaceExample },
  ],
  [
    { id: "account", Shot: AccountMenuExample },
    { id: "palette", Shot: CommandPaletteExample },
  ],
  [
    { id: "share", Shot: ShareDialogExample },
    { id: "notifications", Shot: NotificationsExample },
  ],
];

/**
 * The stage behind the hero and the first rows.
 *
 * Three soft washes and one broad diagonal: white light falling from the top
 * left, a second patch top right, and the brand tint underneath both. It is
 * painted here rather than inside `ExamplesHero` so the gallery's first cards
 * land on the same light instead of starting after a divider.
 */
const STAGE = {
  backgroundColor: "rgb(249, 249, 247)",
  backgroundImage: [
    "radial-gradient(760px 520px at 34% 8%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 68%)",
    "radial-gradient(680px 460px at 76% -4%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)",
    "radial-gradient(1100px 560px at 50% -180px, var(--brand-wash) 0%, rgba(255,255,255,0) 62%)",
    "linear-gradient(112deg, rgba(255,255,255,0) 44%, rgba(255,255,255,0.75) 52%, rgba(255,255,255,0) 60%)",
  ].join(", "),
} as const;

export default function UseCasesPage() {
  return (
    <PageShell>
      <div className="relative overflow-hidden max-w-7xl mx-auto" style={STAGE}>
        <ExamplesHero />

        <section aria-label="UI design examples gallery">
          <div className="mx-auto w-full max-w-384 px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
            <div className="flex flex-col gap-6">
              {ROWS.map((row, index) => (
                <div key={index} className="flex flex-col gap-6 sm:flex-row">
                  {row.map(({ id, Shot }) => (
                    <Shot key={id} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <ViewsSection />

      <Suspense fallback={null}>
        <HomeClosingCTA />
      </Suspense>
    </PageShell>
  );
}
