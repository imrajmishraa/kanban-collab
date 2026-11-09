import { ServerIcon } from "@hugeicons/core-free-icons";

import StepSection from "./StepSection";
import { gridFrom } from "./tourIcons";

/**
 * Step 06: run it yourself.
 */
export default function StepSelfHost() {
  return (
    <StepSection
      id="run-it"
      title="Run it yourself"
      body="One command brings up the client, the API, Mongo and Redis. Nothing here needs a hosted service behind it, and nothing phones home once it is up. It is MIT licensed, so the ceiling on seats is your own hardware and the answer to a data-residency question is your own database."
      primary={{ label: "Read the setup", to: "/docs" }}
      secondary={{ label: "Source", to: "/use-cases" }}
      glyph={ServerIcon}
      icons={gridFrom(25)}
    />
  );
}
