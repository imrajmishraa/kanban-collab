import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Folder01Icon,
  GridViewIcon,
  Home03Icon,
  LogsIcon,
  MessageQuestionIcon,
  Moon02Icon,
  LogoutSquare01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import ExampleShot from "./ExampleShot";
import { MenuRow, Panel, PanelBody, ProfileCard, Sep, Switch } from "./parts";

const icon = (Icon: typeof Home03Icon) => (
  <HugeiconsIcon icon={Icon} size={16} strokeWidth={1.6} />
);

/**
 * The account popover — two surfaces, not one.
 *
 * The profile strip is its own rounded card sitting above the menu with a gap
 * between them, which is what makes the thing read as a stack rather than a
 * list with a heading. One row is lit; the rest are quiet.
 */
export default function AccountMenuExample() {
  return (
    <ExampleShot caption="Drawn with Kanban Collab tokens">
      <div className="absolute left-[27%] top-[8%] w-[46%]">
        <ProfileCard name="Raj Mishra" mail="raj@kanban-collab.dev" />
      </div>

      <Panel className="left-[27%] top-[22%] w-[46%]">
        <PanelBody>
          <MenuRow icon={icon(Home03Icon)} label="Home" />
          <MenuRow icon={icon(DashboardSquare01Icon)} label="Boards" />
          <MenuRow icon={icon(LogsIcon)} label="Active stream" active />
          <MenuRow icon={icon(UserGroupIcon)} label="People" />
        </PanelBody>

        <Sep />

        <PanelBody>
          <MenuRow icon={icon(Folder01Icon)} label="Workspace settings" />
          <MenuRow icon={icon(GridViewIcon)} label="Integrations" />
          <MenuRow
            icon={icon(Moon02Icon)}
            label="Dark mode"
            trailing={<Switch />}
          />
          <MenuRow icon={icon(MessageQuestionIcon)} label="Help centre" />
        </PanelBody>

        <Sep />

        <PanelBody>
          <MenuRow icon={icon(LogoutSquare01Icon)} label="Log out" />
        </PanelBody>
      </Panel>
    </ExampleShot>
  );
}
