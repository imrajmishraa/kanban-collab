import { DashboardSquare01Icon } from "@hugeicons/core-free-icons";

import StepSection from "./StepSection";
import { gridFrom } from "./tourIcons";

/**
 * Step 02: shape the columns.
 */
export default function StepColumns() {
  return (
    <StepSection
      id="columns"
      title="Shape the columns"
      body="Backlog, doing, review, done — or whatever your process actually looks like. Columns are yours to name, reorder and drop, and nothing ships a template you have to delete first. Three is usually enough; the product does not ask you to justify a fourth."
      primary={{ label: "See a live board", to: "/use-cases" }}
      secondary={{ label: "How columns work", to: "/docs" }}
      glyph={DashboardSquare01Icon}
      icons={gridFrom(5)}
    />
  );
}
