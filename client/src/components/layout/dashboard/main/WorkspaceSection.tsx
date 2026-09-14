import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Folder01Icon } from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";
import type { CSSProperties } from "react";

import { alpha, getWorkspaceColor } from "@/utils/workspaceColor";

import type { DashboardWorkspace } from "@/types/dashboard/dashboard";

interface WorkspaceSectionProps {
  workspaces: DashboardWorkspace[];
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function WorkspaceSection({
  workspaces,
}: WorkspaceSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="mb-3 flex items-end justify-between px-1">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
            Workspaces
          </p>
          <h2 className="mt-1.5 font-mono text-[13px] font-semibold text-(--text-primary)">
            Your workspaces
          </h2>
        </div>

        <button
          type="button"
          onClick={() => navigate("/workspaces")}
          className="
            group/view flex cursor-pointer items-center gap-1.5
            rounded-md px-2 py-1
            font-mono text-[10px] uppercase tracking-[0.14em]
            text-(--text-muted)
            transition-colors duration-200
            hover:bg-white/4 hover:text-(--text-primary)
          "
        >
          <span>View all</span>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={11}
            strokeWidth={1.8}
            className="transition-transform duration-200 group-hover/view:translate-x-0.5"
          />
        </button>
      </div>

      {/* Body */}
      {workspaces.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/2 px-5 py-10 text-center">
          <p className="font-mono text-[12px] text-(--text-muted)">
            No workspaces found.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace, index) => (
            <div key={workspace.id} className="relative">
              <WorkspaceNode
                workspace={workspace}
                index={index}
                onOpen={() => navigate(`/workspaces/${workspace.id}`)}
              />

            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Workspace node ────────────────────────────────────────── */

function WorkspaceNode({
  workspace,
  index,
  onOpen,
}: {
  workspace: DashboardWorkspace;
  index: number;
  onOpen: () => void;
}) {
  const color = getWorkspaceColor(workspace.id || workspace.name);
  const isFirst = index === 0;

  /* First card gets the highlighted border, echoing the reference. */
  const style: CSSProperties | undefined = isFirst
    ? { borderColor: alpha(color, 0.45) }
    : undefined;

  return (
    <button
      type="button"
      onClick={onOpen}
      style={style}
      className={[
        "group relative flex w-full cursor-pointer flex-col overflow-hidden",
        "rounded-xl border bg-white/3",
        "px-3.5 py-3 text-left",
        "transition-all duration-200",
        "hover:-translate-y-px",
        isFirst
          ? "hover:border-white/14 hover:bg-white/5.5"
          : "border-white/10 hover:border-white/14 hover:bg-white/5.5",
      ].join(" ")}
    >
      {/* Top hairline */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-x-0 top-0 h-px
          bg-linear-to-r from-transparent via-white/15 to-transparent
        "
      />

      {/* Row 1 — icon badge + index + subtitle */}
      <div className="flex items-start gap-2.5">
        <span
          className="
            flex size-7 shrink-0 items-center justify-center
            rounded-md border transition-colors duration-200
          "
          style={{
            backgroundColor: alpha(color, 0.14),
            borderColor: alpha(color, 0.32),
            color,
          }}
        >
          <HugeiconsIcon icon={Folder01Icon} size={13} strokeWidth={1.7} />
        </span>

        <div className="min-w-0 pt-0.5">
          <p
            className="font-mono text-[10px] font-semibold tabular-nums leading-none tracking-wider"
            style={{ color }}
          >
            {pad(index + 1)}
          </p>

          <p className="mt-1 font-mono text-[9px] uppercase leading-none tracking-[0.16em] text-(--text-muted)">
            Workspace
          </p>
        </div>
      </div>

      {/* Row 2 — name */}
      <h3 className="mt-3 truncate font-mono text-[13px] font-semibold text-(--text-primary)">
        {workspace.name}
      </h3>

      {/* Row 3 — stat pills */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Pill value={workspace.boardCount} label="Boards" />
        <Pill value={workspace.activeTaskCount} label="Tasks" />
      </div>
    </button>
  );
}

/* ── Pill ──────────────────────────────────────────────────── */

function Pill({ value, label }: { value: number; label: string }) {
  return (
    <span
      className="
        inline-flex items-center gap-1
        rounded-md border border-white/10 bg-white/4
        px-1.5 py-0.5 font-mono text-[10px] leading-none
      "
    >
      <span className="tabular-nums text-(--text-primary)">{value}</span>
      <span className="uppercase tracking-widest text-(--text-muted)">
        {label}
      </span>
    </span>
  );
}
