import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckListIcon,
  DashboardSquare01Icon,
  Search01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import ExampleShot from "./ExampleShot";
import { MenuRow, Mono, Panel, PanelBody, Sep, Shortcut } from "./parts";

const GROUPS = [
  {
    label: "Boards",
    icon: DashboardSquare01Icon,
    rows: [
      { label: "Sprint 24", active: true, hint: "Enter" },
      { label: "Sprint archive", hint: "3" },
    ],
  },
  {
    label: "Cards",
    icon: CheckListIcon,
    rows: [
      { label: "Sprint retro notes", hint: "12" },
      { label: "Sprint planning", hint: "08" },
    ],
  },
  {
    label: "People",
    icon: UserIcon,
    rows: [{ label: "Sprint lead · Aditya", hint: "@" }],
  },
];

/**
 * The command palette: a query row, three groups, and a footer that teaches the
 * keyboard. The key column is the point — a palette without visible chords is
 * just a search box with extra steps.
 */
export default function CommandPaletteExample() {
  return (
    <ExampleShot caption="Drawn with Kanban Collab tokens">
      <Panel className="left-[10%] top-[8%] w-[78%] rotate-[0.6deg]">
        <div className="flex items-center gap-2.5 border-b border-(--hairline) px-3.5 py-3 text-[14px] text-(--text-muted)">
          <HugeiconsIcon icon={Search01Icon} size={15} strokeWidth={1.8} />
          <span>sprint</span>
          <Shortcut>Ctrl K</Shortcut>
        </div>

        {GROUPS.map(({ label, icon: Icon, rows }) => (
          <div key={label}>
            <div className="px-3.5 pt-2.5 pb-1">
              <Mono className="text-[9px] text-(--text-subtle)">{label}</Mono>
            </div>
            <PanelBody className="pt-0">
              {rows.map((row) => (
                <MenuRow
                  key={row.label}
                  icon={
                    <HugeiconsIcon icon={Icon} size={16} strokeWidth={1.6} />
                  }
                  label={row.label}
                  active={row.active}
                  hint={row.hint}
                />
              ))}
            </PanelBody>
          </div>
        ))}

        <Sep />

        <div className="flex items-center gap-3 px-3.5 py-2">
          <Shortcut>Up/Down</Shortcut>
          <span className="text-[10.5px] text-(--text-subtle)">navigate</span>
          <Shortcut>Enter</Shortcut>
          <span className="text-[10.5px] text-(--text-subtle)">open</span>
          <Shortcut>esc</Shortcut>
          <span className="text-[10.5px] text-(--text-subtle)">close</span>
        </div>
      </Panel>
    </ExampleShot>
  );
}
