import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  LogsIcon,
  StarIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import ExampleShot from "./ExampleShot";
import { Avatar, MenuRow, Mono, Panel, PanelBody, Sep } from "./parts";

const FEED = [
  {
    icon: LogsIcon,
    label: "Aditya moved “Idle socket cleanup” to Review",
    time: "2m",
    active: true,
    unread: true,
  },
  {
    icon: UserGroupIcon,
    label: "Meera joined Payments",
    time: "18m",
    unread: true,
  },
  { icon: Clock01Icon, label: "Sprint 24 closes in 2 days", time: "1h" },
  { icon: StarIcon, label: "Kabir starred “Launch board”", time: "3h" },
];

/**
 * The notifications panel over the presence card.
 *
 * The tab row and the "Mark all read" action are what separate a notification
 * panel from a list: one says what you are looking at, the other says you can
 * stop looking. Unread rows carry a dot in the brand, read rows carry none.
 */
export default function NotificationsExample() {
  return (
    <ExampleShot caption="Drawn with Kanban Collab tokens">
      <Panel className="right-[6%] top-[8%] w-[66%] rotate-[1.2deg]">
        <div className="flex items-center gap-2 px-3.5 pt-3 pb-2">
          <span className="text-[14px] font-bold tracking-[-0.3px]">
            Notifications
          </span>
          <span className="flex-1" />
          <Mono className="text-[9px] text-(--brand)">Mark all read</Mono>
        </div>

        <div className="flex gap-1 px-2.5 pb-2">
          {["All", "Mentions", "Assigned"].map((tab, index) => (
            <span
              key={tab}
              className={[
                "rounded-md px-2 py-1 text-[10.5px]",
                index === 0
                  ? "bg-(--tint-4) font-semibold text-(--text-primary)"
                  : "text-(--text-muted)",
              ].join(" ")}
            >
              {tab}
            </span>
          ))}
        </div>

        <Sep />

        <PanelBody>
          {FEED.map(({ icon: Icon, label, time, active, unread }) => (
            <MenuRow
              key={label}
              icon={<HugeiconsIcon icon={Icon} size={16} strokeWidth={1.6} />}
              label={
                <span className="flex items-center gap-1.5">
                  {unread ? (
                    <span className="size-1.5 shrink-0 rounded-full bg-(--brand)" />
                  ) : null}
                  <span className="truncate">{label}</span>
                </span>
              }
              hint={time}
              active={active}
            />
          ))}
        </PanelBody>
      </Panel>

      <Panel className="bottom-[10%] left-[5%] w-[44%] rotate-[-2.4deg]">
        <div className="px-3.5 py-3">
          <Mono className="text-[9px]">Now editing</Mono>
          <div className="mt-2.5 flex items-center gap-2.5">
            <div className="flex">
              <Avatar initials="A" tone="blue" />
              <Avatar initials="M" tone="green" className="-ml-1.5" />
              <Avatar initials="R" tone="brand" className="-ml-1.5" />
            </div>
            <span className="text-[12px] text-(--text-secondary)">
              3 people on this board
            </span>
          </div>
        </div>
      </Panel>
    </ExampleShot>
  );
}
