import { Folder01Icon } from "@hugeicons/core-free-icons";

import StepSection from "./StepSection";
import { gridFrom } from "./tourIcons";

/**
 * Step 01: create a workspace.
 */
export default function StepWorkspace() {
  return (
    <StepSection
      id="workspace"
      title="Create a workspace"
      body="One workspace per team, or one per client. Everyone who belongs gets an invite, and the board list is the only thing on the page — there is no dashboard to configure before the first card exists. The workspace is also the permission boundary: nothing crosses between two of them, and a client's board cannot see the workspace around it."
      primary={{ label: "Open a workspace", to: "/workspaces" }}
      secondary={{ label: "Read the docs", to: "/docs" }}
      glyph={Folder01Icon}
      icons={gridFrom(0)}
    />
  );
}
