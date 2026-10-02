import { motion, type Variants } from "framer-motion";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import logo from "@/assets/logo.svg?inline";
import {
  ArrowDown01Icon,
  AttachmentIcon,
  BellIcon,
  CheckListIcon,
  Clock01Icon,
  Flag01Icon,
  Message01Icon,
  MoreHorizontalIcon,
  Search01Icon,
  Tick02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

/* Self-contained class joiner so this page drops in anywhere. */
const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

/* ── Motion ────────────────────────────────────────────────────────── */

const riseIn: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const columnsStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const cardIn: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: EASE },
  },
};

/* ── Types & data ──────────────────────────────────────────────────── */

type Priority = "low" | "medium" | "high";
type Tone = "green" | "violet" | "sky" | "rose" | "cyan" | "docs";

interface Task {
  id: string;
  title: string;
  tag: string;
  tone: Tone;
  priority: Priority;
  assignee: string;
  avatarTone: string;
  due?: string;
  comments?: number;
  attachments?: number;
  subtasks?: { done: number; total: number };
  mine?: boolean;
}

interface Column {
  id: string;
  name: string;
  dot: string;
  tasks: Task[];
}

const AVATARS: Record<string, string> = {
  RM: "bg-[#4DE352] text-[#071009]",
  SP: "bg-[#7DD3FC] text-[#082032]",
  AK: "bg-[#FCD34D] text-[#3B2E04]",
  NV: "bg-[#FDA4AF] text-[#3F0D17]",
};

const columns: Column[] = [
  {
    id: "todo",
    name: "To Do",
    dot: "bg-white/25",
    tasks: [
      {
        id: "TASK-101",
        title: "Design landing page hero",
        tag: "design",
        tone: "violet",
        priority: "high",
        assignee: "RM",
        avatarTone: AVATARS.RM,
        due: "Today",
        comments: 3,
        subtasks: { done: 2, total: 5 },
        mine: true,
      },
      {
        id: "TASK-102",
        title: "Create workspace onboarding",
        tag: "frontend",
        tone: "sky",
        priority: "medium",
        assignee: "AK",
        avatarTone: AVATARS.AK,
        due: "Tomorrow",
        attachments: 2,
      },
      {
        id: "TASK-103",
        title: "Write the contributing guide",
        tag: "docs",
        tone: "docs",
        priority: "low",
        assignee: "NV",
        avatarTone: AVATARS.NV,
      },
    ],
  },
  {
    id: "progress",
    name: "In Progress",
    dot: "bg-(--brand)",
    tasks: [
      {
        id: "TASK-201",
        title: "WebSocket sync engine",
        tag: "backend",
        tone: "green",
        priority: "high",
        assignee: "SP",
        avatarTone: AVATARS.SP,
        comments: 7,
        subtasks: { done: 4, total: 6 },
      },
      {
        id: "TASK-202",
        title: "Build analytics dashboard",
        tag: "frontend",
        tone: "sky",
        priority: "medium",
        assignee: "NV",
        avatarTone: AVATARS.NV,
        due: "Fri",
        attachments: 1,
      },
    ],
  },
  {
    id: "review",
    name: "In Review",
    dot: "bg-amber-400",
    tasks: [
      {
        id: "TASK-204",
        title: "Realtime cursors + presence",
        tag: "feature",
        tone: "green",
        priority: "high",
        assignee: "AK",
        avatarTone: AVATARS.AK,
        comments: 2,
      },
      {
        id: "TASK-205",
        title: "Card drag & drop polish",
        tag: "frontend",
        tone: "sky",
        priority: "medium",
        assignee: "RM",
        avatarTone: AVATARS.RM,
        mine: true,
      },
    ],
  },
  {
    id: "done",
    name: "Done",
    dot: "bg-emerald-400",
    tasks: [
      {
        id: "TASK-301",
        title: "JWT authentication flow",
        tag: "security",
        tone: "rose",
        priority: "high",
        assignee: "RM",
        avatarTone: AVATARS.RM,
        mine: true,
      },
      {
        id: "TASK-302",
        title: "MongoDB schema + indexes",
        tag: "database",
        tone: "cyan",
        priority: "medium",
        assignee: "SP",
        avatarTone: AVATARS.SP,
      },
    ],
  },
];

const priorityStyles: Record<Priority, { dot: string; label: string }> = {
  low: { dot: "bg-sky-400", label: "Low" },
  medium: { dot: "bg-amber-400", label: "Med" },
  high: { dot: "bg-rose-400", label: "High" },
};

const tagStyles: Record<Tone, string> = {
  violet: "border-purple-400/25 bg-purple-400/10 text-purple-300",
  sky: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  rose: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
  docs: "border-white/12 bg-white/6 text-(--text-secondary)",
};

const members = [
  { initials: "RM", online: true },
  { initials: "SP", online: true },
  { initials: "AK", online: true },
];

/* ── Small pieces ──────────────────────────────────────────────────── */

function Avatar({
  initials,
  tone,
  size = "md",
  ring,
}: {
  initials: string;
  tone: string;
  size?: "sm" | "md";
  ring?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full font-mono font-bold",
        size === "sm" ? "size-5 text-[8px]" : "size-7 text-[10px]",
        tone,
        ring && "ring-2 ring-[#0B0B10]",
      )}
    >
      {initials}
    </span>
  );
}

/* Inert icon button — visual only, no behaviour wired up. */
function IconButton({ icon, label }: { icon: IconSvgElement; label: string }) {
  return (
    <span
      role="presentation"
      aria-label={label}
      title={label}
      className="flex size-7 items-center justify-center rounded-md border border-white/8 bg-white/3 text-(--text-secondary)"
    >
      <HugeiconsIcon icon={icon} size={13} strokeWidth={2} />
    </span>
  );
}

/* ── Task card (static preview) ────────────────────────────────────── */

function TaskCard({ task, done }: { task: Task; done: boolean }) {
  const priority = priorityStyles[task.priority];

  return (
    <motion.div
      variants={cardIn}
      className={cn(
        "relative rounded-lg border border-white/6 bg-white/3 p-2.5 backdrop-blur-xl",
        "transition-colors duration-200 hover:border-white/16 hover:bg-white/5",
        done && "opacity-60",
      )}
    >
      {/* top row */}
      <div className="flex items-center gap-2">
        <span
          className={cn("size-1.5 shrink-0 rounded-full", priority.dot)}
          aria-label={priority.label}
        />
        <span
          className={cn(
            "rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em]",
            tagStyles[task.tone],
          )}
        >
          {task.tag}
        </span>
        {task.mine && (
          <span className="rounded border border-(--brand)/25 bg-(--brand)/10 px-1.5 py-0.5 font-mono text-[9px] text-(--brand-hover)">
            you
          </span>
        )}
        <HugeiconsIcon
          icon={Flag01Icon}
          size={11}
          strokeWidth={2}
          className="ml-auto text-(--text-secondary)/40"
        />
      </div>

      {/* title */}
      <p
        className={cn(
          "mt-2 font-mono text-[11px] leading-5",
          done
            ? "text-(--text-primary)/60 line-through decoration-white/20"
            : "text-(--text-primary)/90",
        )}
      >
        {task.title}
      </p>

      {/* subtask progress */}
      {task.subtasks && (
        <div className="mt-2.5">
          <div className="flex items-center justify-between font-mono text-[9px] text-(--text-secondary)/60">
            <span className="flex items-center gap-1">
              <HugeiconsIcon icon={CheckListIcon} size={10} strokeWidth={2} />
              {task.subtasks.done}/{task.subtasks.total}
            </span>
            <span>
              {Math.round((task.subtasks.done / task.subtasks.total) * 100)}%
            </span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/8">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(task.subtasks.done / task.subtasks.total) * 100}%`,
              }}
              transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
              className="h-full rounded-full bg-(--brand)"
            />
          </div>
        </div>
      )}

      {/* meta row */}
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] tracking-[0.08em] text-(--text-secondary)/50">
            {task.id}
          </span>
          {task.comments !== undefined && (
            <span className="flex items-center gap-1 font-mono text-[9px] text-(--text-secondary)/55">
              <HugeiconsIcon icon={Message01Icon} size={9} />
              {task.comments}
            </span>
          )}
          {task.attachments !== undefined && (
            <span className="flex items-center gap-1 font-mono text-[9px] text-(--text-secondary)/55">
              <HugeiconsIcon icon={AttachmentIcon} size={9} />
              {task.attachments}
            </span>
          )}
          {task.due && (
            <span
              className={cn(
                "flex items-center gap-1 font-mono text-[9px]",
                task.due === "Today"
                  ? "text-rose-400/85"
                  : "text-(--text-secondary)/55",
              )}
            >
              <HugeiconsIcon icon={Clock01Icon} size={9} />
              {task.due}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {done && (
            <span className="flex size-4 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/15 text-emerald-400">
              <HugeiconsIcon icon={Tick02Icon} size={8} />
            </span>
          )}
          <Avatar initials={task.assignee} tone={task.avatarTone} size="sm" />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Board preview ─────────────────────────────────────────────────── */

function BoardPreview() {
  return (
    <motion.div
      variants={columnsStagger}
      initial="hidden"
      animate="visible"
      className="flex min-h-0 flex-1 gap-3 overflow-x-auto p-3 scrollbar-none [&::-webkit-scrollbar]:hidden sm:p-4"
    >
      {columns.map((column) => (
        <div key={column.id} className="flex w-52 shrink-0 flex-col @5xl:w-60">
          {/* column header */}
          <div className="mb-2.5 flex items-center gap-2 px-1">
            <span className={cn("h-1.5 w-1.5 rounded-full", column.dot)} />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-(--text-secondary)">
              {column.name}
            </span>
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full border border-white/8 bg-white/3 px-1.5 font-mono text-[9px] text-(--text-secondary)/70">
              {column.tasks.length}
            </span>
            <HugeiconsIcon
              icon={MoreHorizontalIcon}
              size={13}
              strokeWidth={2}
              className="ml-auto text-(--text-secondary)/40"
            />
          </div>

          {/* track */}
          <div className="flex flex-col gap-2 rounded-2xl border border-white/6 bg-white/2 p-2">
            {column.tasks.map((task) => (
              <TaskCard key={task.id} task={task} done={column.id === "done"} />
            ))}

            <span className="rounded-lg border border-dashed border-white/10 px-3 py-2 font-mono text-[10px] text-(--text-secondary)/60">
              + Add task
            </span>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────── */

export default function DashboardDemoPage() {
  return (
    <div className="@container relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#0A0F0D] text-(--text-primary)">
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <motion.header
        variants={riseIn}
        initial="hidden"
        animate="visible"
        className="relative z-30 flex h-12 shrink-0 items-center gap-3 border-b border-white/6 bg-[#0B0B10]/80 px-3 backdrop-blur-xl backdrop-saturate-150 sm:px-4"
      >
        {/* brand — inline app logo */}
        <div className="flex items-center gap-2.5">
          <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/4">
            <img
              src={logo}
              alt=""
              className="size-full object-cover"
              draggable={false}
            />
          </span>
          <span className="hidden font-mono text-xs font-semibold @xl:block">
            Kanban
          </span>
          <span className="hidden items-center gap-1.5 rounded-md border border-white/8 bg-white/3 px-2 py-1 font-mono text-[10px] text-(--text-secondary) @xl:inline-flex">
            Boards
            <HugeiconsIcon icon={ArrowDown01Icon} size={10} strokeWidth={2.2} />
          </span>
        </div>

        {/* search */}
        <div className="mx-auto hidden w-full max-w-md items-center gap-2 rounded-lg border border-white/8 bg-white/3 px-3 py-1.5 @2xl:flex">
          <HugeiconsIcon
            icon={Search01Icon}
            size={13}
            strokeWidth={2}
            className="shrink-0 text-(--text-secondary)/70"
          />
          <span className="font-mono text-[11px] text-(--text-secondary)/60">
            Search boards, tasks…
          </span>
          <kbd className="ml-auto rounded border border-white/10 bg-white/4 px-1.5 py-0.5 font-mono text-[9px] text-(--text-secondary)/70">
            ⌘K
          </kbd>
        </div>

        {/* right cluster */}
        <div className="ml-auto flex items-center gap-2 @2xl:ml-0">
          <div className="hidden items-center -space-x-1.5 @2xl:flex">
            {members.map((m) => (
              <Avatar
                key={m.initials}
                initials={m.initials}
                tone={AVATARS[m.initials]}
                ring
              />
            ))}
            <span className="flex size-7 items-center justify-center rounded-full border-2 border-[#0B0B10] bg-white/8 font-mono text-[9px] text-(--text-secondary)">
              +1
            </span>
          </div>

          <IconButton icon={BellIcon} label="Notifications" />
          <IconButton icon={UserIcon} label="Account" />
        </div>
      </motion.header>

      {/* ── Body — board preview only ────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col">
        <BoardPreview />
      </div>
    </div>
  );
}
