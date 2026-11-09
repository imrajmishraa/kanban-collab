import { UserGroupIcon } from "@hugeicons/core-free-icons";

import StepSection from "./StepSection";
import { gridFrom } from "./tourIcons";

/**
 * Step 05: invite the rest.
 */
export default function StepMembers() {
  return (
    <StepSection
      id="members"
      title="Invite the rest"
      body="Members join from a link. A role decides whether someone can move a card or only read the board, and changing it later is a menu rather than a support ticket. Presence shows who is on the board while you are looking at it, so nobody messages the person who is already there."
      primary={{ label: "Invite your team", to: "/workspaces" }}
      secondary={{ label: "Roles explained", to: "/docs" }}
      glyph={UserGroupIcon}
      icons={gridFrom(20)}
    />
  );
}
