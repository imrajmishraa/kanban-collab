import Navbar from "@components/layout/landing/Navbar";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-(--bg-root) mt-8 px-4 py-10 text-(--text-primary) sm:px-3 lg:px-5 lg:py-9">
      <Navbar />

      <div className="mx-auto w-full max-w-6xl">
        {/* MAIN 404 CARD */}
        <section className="relative overflow-hidden rounded-xl border border-(--border-strong) bg-(--bg-surface)">
          {/* Subtle background grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(148,163,184,0.12) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />

          <div className="relative p-6 sm:p-8 md:p-10 lg:p-12">
            {/* Error badge */}
            <div className="mb-10 inline-flex items-center gap-3 rounded-md border border-(--border-strong) bg-(--bg-root)/60 px-4 py-2">
              <span className="font-mono text-sm text-(--danger)">404</span>

              <span className="font-mono text-sm text-(--text-muted)">
                ERROR
              </span>
            </div>

            {/* CONTENT GRID */}
            <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              {/* LEFT CONTENT */}
              <div className="max-w-xl">
                {/* Big 404 */}
                <h1 className="font-mono text-[5.5rem] font-medium leading-none tracking-[-0.06em] text-(--danger) sm:text-[7rem] lg:text-[8rem]">
                  404
                </h1>

                {/* Heading */}
                <h2 className="mt-5 font-mono text-3xl font-medium tracking-tight text-(--text-primary) sm:text-4xl">
                  Page not found
                </h2>

                {/* Divider */}
                <div className="mt-7 h-px w-8 bg-(--border-strong)" />

                {/* Description */}
                <p className="mt-6 max-w-md font-mono text-sm leading-7 text-(--text-muted) sm:text-[15px]">
                  The page you're looking for doesn't exist or may have been
                  moved somewhere else.
                </p>

                {/* ACTION PANEL */}
                <div className="mt-10 w-full max-w-md border border-(--border-strong) bg-(--bg-root)/60">
                  {/* Panel header */}
                  <div className="flex items-center justify-between border-b border-(--border) px-5 py-4">
                    <span className="font-mono text-sm text-(--text-primary)">
                      What can you do?
                    </span>

                    <span className="font-mono text-(--text-muted)">−</span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 p-5 font-mono text-sm">
                    <Link
                      to="/"
                      className="
                        inline-flex
                        w-fit
                        items-center
                        gap-2
                        border
                        border-(--border-strong)
                        px-4
                        py-2.5
                        text-(--brand)
                        transition-all
                        duration-200
                        hover:border-(--brand)
                        hover:bg-(--brand)/10
                      "
                    >
                      <span>[</span>
                      <span>Go back home</span>
                      <span>]</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      className="
                        inline-flex
                        w-fit
                        items-center
                        text-(--text-secondary)
                        transition-colors
                        duration-200
                        hover:text-(--text-primary)
                      "
                    >
                      [ &nbsp;View all boards&nbsp; ]
                    </Link>
                  </div>
                </div>
              </div>

              {/* RIGHT — KANBAN ILLUSTRATION */}
              <div className="hidden min-h-90 items-center justify-center lg:flex">
                <div className="relative w-full max-w-xl">
                  {/* Board */}
                  <div className="relative border border-dashed border-(--border-strong) bg-(--bg-root)/40">
                    {/* Browser title bar */}
                    <div className="flex h-12 items-center gap-2 border-b border-(--border) px-5">
                      <span className="h-2.5 w-2.5 rounded-full border border-(--danger)" />

                      <span className="h-2.5 w-2.5 rounded-full border border-(--warning)" />

                      <span className="h-2.5 w-2.5 rounded-full border border-(--success)" />

                      <span className="ml-4 font-mono text-sm text-(--text-muted)">
                        kanban.board
                      </span>
                    </div>

                    {/* Board columns */}
                    <div className="grid grid-cols-3">
                      <BoardColumn title="To Do" cards={[false, false]} />

                      <BoardColumn title="In Progress" cards={[false, true]} />

                      <BoardColumn title="Done" cards={[false, false]} />
                    </div>
                  </div>

                  {/* LOST CARD */}
                  <div className="absolute -bottom-36 right-10 flex flex-col items-center">
                    {/* Connector */}
                    <div className="h-14 border-l border-dashed border-(--border-strong)" />

                    {/* Question mark */}
                    <span className="mb-2 font-mono text-3xl text-(--danger)">
                      ?
                    </span>

                    {/* Lost card */}
                    <div className="flex h-20 w-24 flex-col items-center justify-center gap-1 border border-dashed border-(--border-strong) bg-(--bg-root)">
                      <div className="flex gap-4 font-mono text-xs text-(--text-secondary)">
                        <span>X</span>
                        <span>X</span>
                      </div>

                      <span className="font-mono text-xs text-(--text-muted)">
                        —
                      </span>
                    </div>
                  </div>

                  {/* Dashed path */}
                  <div className="absolute -bottom-14 right-30 h-14 w-24 border-b border-dashed border-(--border-strong)" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SHORTCUTS */}
        <section className="mt-12 sm:mt-14">
          {/* Section heading */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-10 bg-(--border) sm:w-16" />

            <p className="whitespace-nowrap font-mono text-xs text-(--text-muted) sm:text-sm">
              Lost? Try one of these shortcuts
            </p>

            <div className="h-px w-10 bg-(--border) sm:w-16" />
          </div>

          {/* Links */}
          <div className="mt-7 flex flex-wrap justify-center gap-x-8 gap-y-5 font-mono text-sm text-(--text-secondary) sm:gap-x-10">
            <Shortcut to="/dashboard" icon="⊞" label="All Boards" />

            <Shortcut to="/dashboard" icon="⊕" label="Create Board" />

            <Shortcut to="/profile" icon="♙" label="My Profile" />

            <Shortcut to="/setting" icon="⚙" label="Settings" />
          </div>
        </section>

        {/* TERMINAL */}
        <section className="mt-12 border border-dashed border-(--border) bg-(--bg-surface) p-5 sm:mt-14 sm:p-6">
          <div className="font-mono text-sm">
            <span className="text-(--text-muted)">$</span>{" "}
            <span className="text-(--brand)">kanban</span>{" "}
            <span className="text-(--text-primary)">--help</span>
          </div>

          <p className="mt-3 font-mono text-sm leading-6 text-(--text-muted)">
            Organize tasks. Collaborate in real-time. Get things done.
          </p>

          <span className="mt-4 block h-4 w-2 animate-pulse bg-(--text-muted)" />
        </section>
      </div>
    </main>
  );
}

/* BOARD COLUMN */

interface BoardColumnProps {
  title: string;
  cards: boolean[];
}

function BoardColumn({ title, cards }: BoardColumnProps) {
  return (
    <div className="min-h-55 border-r border-(--border) p-4 last:border-r-0">
      <p className="mb-5 font-mono text-xs text-(--text-muted)">{title}</p>

      <div className="space-y-4">
        {cards.map((rotated, index) => (
          <div
            key={index}
            className={`
              h-8
              w-full
              border
              border-dashed
              border-(--border-strong)
              ${rotated ? "-rotate-6" : ""}
            `}
          />
        ))}
      </div>
    </div>
  );
}

/* SHORTCUT */

interface ShortcutProps {
  to: string;
  icon: string;
  label: string;
}

function Shortcut({ to, icon, label }: ShortcutProps) {
  return (
    <Link
      to={to}
      className="
        inline-flex
        items-center
        gap-2
        transition-colors
        duration-200
        hover:text-(--text-primary)
      "
    >
      <span className="text-base text-(--text-secondary)">{icon}</span>

      <span>{label}</span>
    </Link>
  );
}
