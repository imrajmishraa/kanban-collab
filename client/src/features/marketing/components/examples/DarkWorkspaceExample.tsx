import { HugeiconsIcon } from "@hugeicons/react";
import {
  BarChartIcon,
  DashboardSquare01Icon,
  Home03Icon,
  LogsIcon,
  PackageIcon,
  Settings01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import ExampleShot from "./ExampleShot";

const RAIL = [
  { label: "Dashboard", icon: Home03Icon },
  { label: "Boards", icon: DashboardSquare01Icon, active: true },
  { label: "Activity", icon: LogsIcon },
  { label: "Members", icon: UserGroupIcon },
  { label: "Settings", icon: Settings01Icon },
];

const TABS = ["Overview", "Boards", "Cards", "People"];

const KPIS = [
  { label: "Cards moved", value: "1,284", delta: "+22.2% · last 30 days" },
  { label: "Open cards", value: "186", delta: "−8.4% · last 30 days" },
];

/**
 * Two windows, one light and one dark, the way the reference stacks them: the
 * dark app sits in front, rotated a couple of degrees, and the light one shows
 * behind it at a smaller offset so the frame reads as a pair rather than a
 * single screenshot.
 *
 * `.dark-theme` is on the front window itself, not the frame, so the window
 * behind it keeps the light palette.
 */
export default function DarkWorkspaceExample() {
  return (
    <ExampleShot caption="The dark theme, on its own scope">
      {/* the light window behind */}
      <div className="absolute left-[2%] top-[26%] w-[74%] -rotate-3 overflow-hidden rounded-xl border border-(--hairline) bg-(--bg-surface) text-(--text-primary)">
        <div className="flex items-center gap-1.5 border-b border-(--hairline) px-3 py-2">
          <span className="grid size-4 place-items-center rounded-md bg-(--brand) text-[8px] font-extrabold text-(--solid-text)">
            K
          </span>
          <span className="text-[11px] font-bold tracking-[-0.2px]">
            Kanban
          </span>
        </div>
        <div className="space-y-1 p-2">
          {RAIL.map(({ label, active }) => (
            <div
              key={label}
              className={[
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-[10.5px]",
                active
                  ? "bg-(--tint-4) font-semibold"
                  : "text-(--text-secondary)",
              ].join(" ")}
            >
              <span className="size-2 rounded-sm bg-(--tint-10)" />
              {label}
            </div>
          ))}
          <div className="mt-2 space-y-1 border-t border-(--hairline) pt-2">
            {["Overview", "Merchants", "Platforms"].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-[10.5px] text-(--text-muted)"
              >
                {row}
                <span className="font-mono text-[9px] tracking-[0.08em]">
                  {row === "Merchants" ? "12" : "04"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* the dark window in front */}
      <div className="dark-theme absolute left-[24%] top-[4%] w-[94%] -rotate-2 overflow-hidden rounded-xl border border-(--hairline) bg-(--bg-surface) text-(--text-primary)">
        <div className="grid grid-cols-[104px_minmax(0,1fr)]">
          <div className="border-r border-(--hairline) bg-(--bg-root) px-2 py-2.5">
            <div className="flex items-center gap-1.5 px-1 pb-3 text-[11px] font-bold tracking-[-0.2px]">
              <span className="grid size-4 place-items-center rounded-md bg-(--brand) text-[8px] font-extrabold text-(--solid-text)">
                K
              </span>
              Kanban
            </div>

            {RAIL.map(({ label, icon: Icon, active }) => (
              <div
                key={label}
                className={[
                  "mb-0.5 flex items-center gap-1.5 rounded-md px-1.5 py-1.5 text-[10px]",
                  active
                    ? "bg-(--tint-4) font-semibold text-(--text-primary)"
                    : "text-(--text-secondary)",
                ].join(" ")}
              >
                <HugeiconsIcon icon={Icon} size={11} strokeWidth={1.7} />
                {label}
              </div>
            ))}
          </div>

          <div className="px-3 py-2.5">
            <div className="mb-2 flex items-center gap-1.5">
              <HugeiconsIcon
                icon={PackageIcon}
                size={11}
                strokeWidth={1.7}
                className="text-(--text-muted)"
              />
              <span className="text-[11.5px] font-semibold">Merchants</span>
            </div>

            <div className="mb-3 flex gap-1">
              {TABS.map((tab, index) => (
                <span
                  key={tab}
                  className={[
                    "rounded-md px-1.5 py-1 text-[9.5px]",
                    index === 0
                      ? "bg-(--tint-6) text-(--text-primary)"
                      : "text-(--text-muted)",
                  ].join(" ")}
                >
                  {tab}
                </span>
              ))}
            </div>

            <div className="mb-3 flex gap-4">
              {KPIS.map((kpi) => (
                <div key={kpi.label} className="min-w-0">
                  <span className="mb-1 flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.12em] text-(--text-muted)">
                    {kpi.label}
                    <HugeiconsIcon
                      icon={BarChartIcon}
                      size={8}
                      strokeWidth={2}
                    />
                  </span>
                  <b className="block text-[15px] font-bold tracking-[-0.5px] tabular-nums">
                    {kpi.value}
                  </b>
                  <em
                    className={[
                      "mt-0.5 block text-[8.5px] not-italic",
                      kpi.delta.startsWith("+")
                        ? "text-(--success)"
                        : "text-(--brand)",
                    ].join(" ")}
                  >
                    {kpi.delta}
                  </em>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-between py-0.5">
                {["20k", "15k", "10k", "5k"].map((tick) => (
                  <span
                    key={tick}
                    className="font-mono text-[7.5px] tracking-[0.04em] text-(--text-subtle)"
                  >
                    ₹{tick}
                  </span>
                ))}
              </div>

              <svg
                viewBox="0 0 300 90"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="ml-6 h-21.5 w-[calc(100%-1.5rem)]"
              >
                <g
                  stroke="var(--hairline)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                >
                  {[8, 30, 52, 74].map((y) => (
                    <line key={y} x1="0" y1={y} x2="300" y2={y} />
                  ))}
                </g>
                <polyline
                  points="0,76 36,70 72,72 108,52 144,48 180,32 216,34 252,18 300,12"
                  fill="none"
                  stroke="var(--brand)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="0,82 36,80 72,76 108,72 144,66 180,62 216,56 252,52 300,44"
                  fill="none"
                  stroke="var(--text-subtle)"
                  strokeWidth="1.2"
                  strokeDasharray="3 4"
                />
              </svg>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {[0, 1, 2].map((column) => (
                <div
                  key={column}
                  className="rounded-md border border-(--hairline) bg-(--bg-root) p-1.5"
                >
                  <span className="mb-1 block h-1 w-full rounded-sm bg-(--tint-10)" />
                  <span className="mb-1 block h-1 w-3/5 rounded-sm bg-(--tint-10)" />
                  <span className="block h-1 w-2/5 rounded-sm bg-(--tint-10)" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ExampleShot>
  );
}
