import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tick02Icon,
  Clock01Icon,
  Alert02Icon,
  Message01Icon,
  AttachmentIcon,
} from "@hugeicons/core-free-icons";

type Priority = "low" | "medium" | "high";

interface Card {
  id: string;
  title: string;
  tag: string;
  priority: Priority;
  assignee: string;
  dueDate?: string;
  comments?: number;
  attachments?: number;
  done?: boolean;
}

interface Column {
  title: string;
  cards: Card[];
}

const columns: Column[] = [
  {
    title: "To Do",
    cards: [
      {
        id: "TASK-101",
        title: "Design landing page hero",
        tag: "design",
        priority: "high",
        assignee: "RM",
        dueDate: "Today",
        comments: 3,
      },
      {
        id: "TASK-102",
        title: "Create workspace onboarding",
        tag: "frontend",
        priority: "medium",
        assignee: "AK",
        dueDate: "Tomorrow",
        attachments: 2,
      },
    ],
  },
  {
    title: "In Progress",
    cards: [
      {
        id: "TASK-201",
        title: "WebSocket sync engine",
        tag: "backend",
        priority: "high",
        assignee: "SP",
        comments: 7,
      },
      {
        id: "TASK-202",
        title: "Build analytics dashboard",
        tag: "frontend",
        priority: "medium",
        assignee: "NV",
        dueDate: "Fri",
        attachments: 1,
      },
    ],
  },
  {
    title: "Done",
    cards: [
      {
        id: "TASK-301",
        title: "JWT authentication flow",
        tag: "security",
        priority: "high",
        assignee: "RM",
        done: true,
      },
      {
        id: "TASK-302",
        title: "MongoDB schema + indexes",
        tag: "database",
        priority: "medium",
        assignee: "SP",
        done: true,
      },
    ],
  },
];

const priorityStyles: Record<
  Priority,
  { dot: string; text: string; label: string }
> = {
  low: {
    dot: "bg-sky-400",
    text: "text-sky-400/80",
    label: "Low",
  },
  medium: {
    dot: "bg-amber-400",
    text: "text-amber-400/80",
    label: "Med",
  },
  high: {
    dot: "bg-rose-400",
    text: "text-rose-400/80",
    label: "High",
  },
};

const tagStyles: Record<string, string> = {
  design: "border-purple-400/25 bg-purple-400/10 text-purple-300",
  frontend: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  backend: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  security: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  database: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
};

export default function BoardPreview() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[14px] border border-white/8 bg-[#0F0F12] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        {/* ── Window header ─────────────────────────────────── */}
        <div className="flex h-11 items-center border-b border-white/6 px-4 sm:px-5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-rose-500/70 bg-rose-500/10" />
            <span className="h-2.5 w-2.5 rounded-full border border-yellow-500/70 bg-yellow-500/10" />
            <span className="h-2.5 w-2.5 rounded-full border border-emerald-500/70 bg-emerald-500/10" />
          </div>

          <div className="ml-5 font-mono text-xs text-(--text-secondary)">
            kanban.board
          </div>

          <div className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-emerald-400/80">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Live
          </div>
        </div>

        {/* ── Board ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 sm:min-h-75">
          {columns.map((column, columnIndex) => (
            <div
              key={column.title}
              className={`
                p-4 sm:p-5
                ${
                  columnIndex !== columns.length - 1
                    ? "border-b border-white/5 sm:border-b-0 sm:border-r"
                    : ""
                }
              `}
            >
              {/* Column header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-(--text-secondary)">
                    {column.title}
                  </span>
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full border border-white/8 bg-white/3 px-1.5 font-mono text-[9px] text-(--text-secondary)/70">
                    {column.cards.length}
                  </span>
                </div>

                <span className="font-mono text-[10px] text-(--text-secondary)/40">
                  ⋯
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2.5">
                {column.cards.map((card) => {
                  const priority = priorityStyles[card.priority];
                  const tagClass =
                    tagStyles[card.tag] ??
                    "border-white/[0.08] bg-white/[0.03] text-(--text-secondary)";

                  return (
                    <div
                      key={card.id}
                      className={`
                        group/card relative rounded-md border border-white/6
                        bg-white/2 p-3
                        transition-all duration-200
                        hover:border-white/14 hover:bg-white/4
                        ${card.done ? "opacity-55" : ""}
                      `}
                    >
                      {/* Priority dot + tag row */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${priority.dot}`}
                          aria-label={priority.label}
                        />
                        <span
                          className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] ${tagClass}`}
                        >
                          {card.tag}
                        </span>
                      </div>

                      {/* Title */}
                      <p
                        className={`mt-2.5 font-mono text-xs leading-5 ${
                          card.done
                            ? "text-(--text-primary)/60 line-through decoration-white/20"
                            : "text-(--text-primary)/90"
                        }`}
                      >
                        {card.title}
                      </p>

                      {/* Meta row */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {/* Task ID */}
                          <span className="font-mono text-[9px] tracking-[0.08em] text-(--text-secondary)/50">
                            {card.id}
                          </span>

                          {/* Comments */}
                          {card.comments !== undefined && (
                            <span className="flex items-center gap-1 font-mono text-[9px] text-(--text-secondary)/55">
                              <HugeiconsIcon icon={Message01Icon} size={9} />
                              {card.comments}
                            </span>
                          )}

                          {/* Attachments */}
                          {card.attachments !== undefined && (
                            <span className="flex items-center gap-1 font-mono text-[9px] text-(--text-secondary)/55">
                              <HugeiconsIcon icon={AttachmentIcon} size={9} />
                              {card.attachments}
                            </span>
                          )}

                          {/* Due date */}
                          {card.dueDate && (
                            <span
                              className={`flex items-center gap-1 font-mono text-[9px] ${
                                card.dueDate === "Today"
                                  ? "text-rose-400/85"
                                  : "text-(--text-secondary)/55"
                              }`}
                            >
                              <HugeiconsIcon icon={Clock01Icon} size={9} />
                              {card.dueDate}
                            </span>
                          )}
                        </div>

                        {/* Right side: avatar or done tick */}
                        <div className="flex items-center gap-1.5">
                          {card.done && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/15 text-emerald-400">
                              <HugeiconsIcon icon={Tick02Icon} size={8} />
                            </span>
                          )}

                          {/* Assignee avatar */}
                          <span
                            className={`
                              flex h-5 w-5 items-center justify-center rounded-full
                              border border-white/10 bg-white/4
                              font-mono text-[8px] font-medium tracking-tight text-(--text-secondary)
                            `}
                          >
                            {card.assignee}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Window footer ─────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-white/6 px-4 py-2.5 sm:px-5">
          <span className="font-mono text-[10px] tracking-widest text-(--text-secondary)/55">
            workspace://kanban
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-(--text-secondary)/55">
            <HugeiconsIcon icon={Alert02Icon} size={10} />6 tasks · 2 done
          </span>
        </div>
      </div>
    </div>
  );
}
