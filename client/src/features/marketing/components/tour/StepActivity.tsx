import { ClipboardClockIcon } from "@hugeicons/core-free-icons";

import StepSection from "./StepSection";
import { gridFrom } from "./tourIcons";

/**
 * Step 04: read the activity.
 */
export default function StepActivity() {
  return (
    <StepSection
      id="activity"
      title="Read the activity"
      body="Every move is recorded with who made it and when. A board nobody watched still explains itself the next morning, which is the part a stand-up usually does badly. The log is read-only history: it cannot be edited into a different story after the fact."
      primary={{ label: "See the log", to: "/workspaces" }}
      secondary={{ label: "What is recorded", to: "/docs" }}
      glyph={ClipboardClockIcon}
      icons={gridFrom(15)}
    />
  );
}
