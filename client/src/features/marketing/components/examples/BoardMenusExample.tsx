import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  Copy01Icon,
  Delete02Icon,
  FileArchiveIcon,
  Layout01Icon,
  Note01Icon,
  PencilEdit02Icon,
  PlusSignIcon,
  Settings01Icon,
  Share08Icon,
  StarIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";

import ExampleShot from "./ExampleShot";
import { MenuRow, Note, Panel, PanelBody, Sep } from "./parts";

const icon = (Icon: typeof PencilEdit02Icon) => (
  <HugeiconsIcon icon={Icon} size={16} strokeWidth={1.6} />
);

/**
 * Three menus off one board, laid out the way they are when a user has two of
 * them open at once: overlapping, each rotated a degree or two, and cropped by
 * the frame.
 *
 * The detail that makes them read as real product rather than a sketch is the
 * right-hand column: key chords on the rows that have them, a chevron on the
 * rows that open something, and a quiet "last edited" line at the foot.
 */
export default function BoardMenusExample() {
  return (
    <ExampleShot caption="Drawn with Kanban Collab tokens">
      <Panel className="left-[0%] top-[24%] w-[40%] -rotate-2">
        <PanelBody>
          <MenuRow icon={icon(PencilEdit02Icon)} label="Rename" />
          <MenuRow
            icon={icon(ArrowUpRight01Icon)}
            label="Open board in new tab"
            active
          />
        </PanelBody>

        <Sep />

        <PanelBody>
          <MenuRow icon={icon(PlusSignIcon)} label="Create card" chevron />
          <MenuRow icon={icon(Settings01Icon)} label="Board settings" chevron />
          <MenuRow icon={icon(Layout01Icon)} label="Templates" />
        </PanelBody>

        <Sep />

        <PanelBody>
          <MenuRow icon={icon(StarIcon)} label="Add to favourites" />
          <MenuRow icon={icon(ViewOffIcon)} label="Hide board" />
          <MenuRow
            helper
            label="You’ll keep access to this board, but it won’t show in your sidebar"
          />
        </PanelBody>
      </Panel>

      <Panel className="left-[40%] top-[4%] w-[38%] rotate-2">
        <PanelBody>
          <MenuRow icon={icon(PencilEdit02Icon)} label="Rename" />
          <MenuRow icon={icon(Note01Icon)} label="Get info" />
          <MenuRow icon={icon(Share08Icon)} label="Share" />
          <MenuRow icon={icon(Copy01Icon)} label="Copy link" active />
          <MenuRow icon={icon(Delete02Icon)} label="Move to Trash" danger />
        </PanelBody>
      </Panel>

      <Panel className="left-[57%] top-[34%] w-[42%] -rotate-1">
        <PanelBody>
          <MenuRow icon={icon(StarIcon)} label="Add to favourites" />
          <MenuRow icon={icon(Copy01Icon)} label="Duplicate" hint="Ctrl D" />
          <MenuRow icon={icon(PencilEdit02Icon)} label="Rename" hint="Ctrl R" />
          <MenuRow icon={icon(Layout01Icon)} label="Move to" chevron active />
          <MenuRow
            icon={icon(Share08Icon)}
            label="Export configuration"
            chevron
          />
        </PanelBody>

        <Sep />

        <PanelBody>
          <MenuRow icon={icon(FileArchiveIcon)} label="Move to archive" />
        </PanelBody>

        <Note label="Last edited" value="Jun 5, 2025, 11:30 PM" />
      </Panel>
    </ExampleShot>
  );
}
