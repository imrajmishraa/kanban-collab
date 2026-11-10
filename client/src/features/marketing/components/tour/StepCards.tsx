import { LayoutListIcon } from "@hugeicons/core-free-icons";

import StepSection from "./StepSection";
import { gridFrom } from "./tourIcons";

/**
 * Step 03: write the cards.
 */
export default function StepCards() {
  return (
    <StepSection
      id="cards"
      title="Write the cards"
      body="A card is a title, a description, a column and the people on it. Drag it and the move lands on every open screen at once, because the board is a shared document rather than a poll. Two people moving the same card is a merge, not a lost change."
      primary={{ label: "Open a board", to: "/workspaces" }}
      secondary={{ label: "Read the docs", to: "/docs" }}
      glyph={LayoutListIcon}
      icons={gridFrom(10)}
    />
  );
}
