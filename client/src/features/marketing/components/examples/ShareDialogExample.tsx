import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Link01Icon } from "@hugeicons/core-free-icons";

import ExampleShot from "./ExampleShot";
import { Avatar, MenuRow, Panel, PanelBody, Sep, Shortcut } from "./parts";

const PEOPLE = [
  { initials: "RM", name: "Raj Mishra", role: "Owner", tone: "brand" as const },
  { initials: "AD", name: "Aditya", role: "Can edit", tone: "blue" as const },
  { initials: "ME", name: "Meera", role: "Can view", tone: "green" as const },
];

/**
 * The share dialog with the toast that follows it.
 *
 * Three zones, the way a share sheet actually works: who can get in (the invite
 * row), who is already in (the member list with roles), and what you can copy
 * instead of inviting (the link row). The toast sits above the panel so the
 * confirmation never covers the action it confirms.
 */
export default function ShareDialogExample() {
  return (
    <ExampleShot caption="Drawn with Kanban Collab tokens">
      <div className="absolute left-[6%] top-[5%] flex items-center gap-2.5 rounded-lg border border-(--hairline) bg-(--solid-bg) px-3.5 py-2.5 text-[12.5px] font-medium text-(--solid-text)">
        <span className="grid size-4 place-items-center rounded-full bg-(--brand) text-[9px] font-extrabold text-(--solid-text)">
          ✓
        </span>
        Board shared with 2 people
      </div>

      <Panel className="left-[9%] top-[16%] w-[72%] rotate-[-1.4deg]">
        <div className="px-4 pt-4 pb-1.5">
          <div className="text-[16px] font-bold tracking-[-0.4px]">
            Share “Payments · Sprint 24”
          </div>
          <div className="mt-0.5 text-[12px] text-(--text-muted)">
            Anyone in the workspace can open it
          </div>
        </div>

        <div className="flex gap-2 px-4 pt-2.5 pb-1">
          <div className="flex-1 rounded-lg border border-(--hairline) px-2.5 py-2 text-[13px] text-(--text-subtle)">
            name@team.com
          </div>
          <div className="rounded-lg border border-(--hairline-strong) px-3 py-2 text-[13px] font-semibold">
            Invite
          </div>
        </div>

        <PanelBody className="pt-2.5">
          {PEOPLE.map((person) => (
            <MenuRow
              key={person.name}
              icon={
                <Avatar
                  initials={person.initials}
                  tone={person.tone}
                  className="size-6 text-[9px]"
                />
              }
              label={person.name}
              hint={person.role}
            />
          ))}
        </PanelBody>

        <Sep />

        <PanelBody className="pt-2">
          <MenuRow
            icon={
              <HugeiconsIcon icon={Link01Icon} size={16} strokeWidth={1.6} />
            }
            label="Anyone with the link"
            hint="Can view"
          />
          <MenuRow
            icon={
              <HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={1.6} />
            }
            label="Copy invite link"
            trailing={<Shortcut>Ctrl C</Shortcut>}
          />
        </PanelBody>

        <Sep />

        <div className="flex items-center gap-2.5 px-3.5 py-2.5">
          <span className="text-[11.5px] text-(--text-muted)">
            Link expires in 7 days
          </span>
          <span className="flex-1" />
          <span className="m-btn h-8 px-3.5 text-[13px]">Done</span>
        </div>
      </Panel>
    </ExampleShot>
  );
}
