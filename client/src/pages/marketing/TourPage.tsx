import {
  PageShell,
  StepActivity,
  StepCards,
  StepColumns,
  StepMembers,
  StepSelfHost,
  StepWorkspace,
  TourCta,
  TourHero,
} from "@/features/marketing";

/**
 * Tour — the loop, end to end.
 *
 * Eight components, one per band: a hero that states the loop, six steps that
 * each show one turn of it, and a closing band. The steps follow the reference
 * page's shape — claim, paragraph, two actions, then the evidence beside a grid
 * of the marks it is drawn from — because a tour has to show a screen, not
 * describe one.
 */
export default function TourPage() {
  return (
    <PageShell>
      <TourHero />

      <StepWorkspace />
      <StepColumns />
      <StepCards />
      <StepActivity />
      <StepMembers />
      <StepSelfHost />

      <TourCta />
    </PageShell>
  );
}
