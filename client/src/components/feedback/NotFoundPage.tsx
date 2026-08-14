import Navbar from "#components/layout/landing/Navbar";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#151515] px-4 py-8 text-zinc-100 sm:px-6 lg:px-8 lg:py-12">
      <Navbar />
      <div className="mx-auto w-full max-w-6xl">
        {/* MAIN 404 CARD */}
        <section className="relative overflow-hidden rounded-xl border border-zinc-700/80 bg-[#171717]">
          {/* Subtle background grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />

          <div className="relative p-6 sm:p-8 md:p-10 lg:p-12">
            {/* Error badge */}
            <div className="mb-10 inline-flex items-center gap-3 rounded-md border border-zinc-600/80 bg-[#151515]/60 px-4 py-2">
              <span className="font-mono text-sm text-[#ff625c]">404</span>

              <span className="font-mono text-sm text-zinc-400">ERROR</span>
            </div>

            {/* CONTENT GRID */}
            <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              {/* LEFT CONTENT */}
              <div className="max-w-xl">
                {/* Big 404 */}
                <h1 className="font-mono text-[5.5rem] font-medium leading-none tracking-[-0.06em] text-[#ff625c] sm:text-[7rem] lg:text-[8rem]">
                  404
                </h1>

                {/* Heading */}
                <h2 className="mt-5 font-mono text-3xl font-medium tracking-tight text-zinc-100 sm:text-4xl">
                  Page not found
                </h2>

                {/* Divider */}
                <div className="mt-7 h-px w-8 bg-zinc-500" />

                {/* Description */}
                <p className="mt-6 max-w-md font-mono text-sm leading-7 text-zinc-500 sm:text-[15px]">
                  The page you're looking for doesn't exist or may have been
                  moved somewhere else.
                </p>

                {/* ACTION PANEL */}
                <div className="mt-10 w-full max-w-md border border-zinc-600/80 bg-[#151515]/60">
                  {/* Panel header */}
                  <div className="flex items-center justify-between border-b border-zinc-700/80 px-5 py-4">
                    <span className="font-mono text-sm text-zinc-200">
                      What can you do?
                    </span>

                    <span className="font-mono text-zinc-500">−</span>
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
                        border-[#7d4b48]
                        px-4
                        py-2.5
                        text-[#ff625c]
                        transition-all
                        duration-200
                        hover:border-[#ff625c]
                        hover:bg-[#ff625c]/10
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
                        text-zinc-300
                        transition-colors
                        duration-200
                        hover:text-white
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
                  <div className="relative border border-dashed border-zinc-600/90 bg-[#151515]/40">
                    {/* Browser title bar */}
                    <div className="flex h-12 items-center gap-2 border-b border-zinc-700/80 px-5">
                      <span className="h-2.5 w-2.5 rounded-full border border-[#ff625c]" />
                      <span className="h-2.5 w-2.5 rounded-full border border-yellow-500" />
                      <span className="h-2.5 w-2.5 rounded-full border border-green-500" />

                      <span className="ml-4 font-mono text-sm text-zinc-500">
                        kanban.board
                      </span>
                    </div>

                    {/* Board columns */}
                    <div className="grid grid-cols-3">
                      {/* To Do */}
                      <BoardColumn title="To Do" cards={[false, false]} />

                      {/* In Progress */}
                      <BoardColumn title="In Progress" cards={[false, true]} />

                      {/* Done */}
                      <BoardColumn title="Done" cards={[false, false]} />
                    </div>
                  </div>

                  {/* LOST CARD */}
                  <div className="absolute -bottom-36 right-10 flex flex-col items-center">
                    {/* Connector */}
                    <div className="h-14 border-l border-dashed border-zinc-600" />

                    {/* Question mark */}
                    <span className="mb-2 font-mono text-3xl text-[#ff625c]">
                      ?
                    </span>

                    {/* Lost card */}
                    <div className="flex h-20 w-24 flex-col items-center justify-center gap-1 border border-dashed border-zinc-600 bg-[#151515]">
                      <div className="flex gap-4 font-mono text-xs text-zinc-400">
                        <span>X</span>
                        <span>X</span>
                      </div>

                      <span className="font-mono text-xs text-zinc-500">—</span>
                    </div>
                  </div>

                  {/* Dashed path */}
                  <div className="absolute -bottom-14 right-30 h-14 w-24 border-b border-dashed border-zinc-600" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SHORTCUTS */}
        <section className="mt-12 sm:mt-14">
          {/* Section heading */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-10 bg-zinc-700 sm:w-16" />

            <p className="whitespace-nowrap font-mono text-xs text-zinc-500 sm:text-sm">
              Lost? Try one of these shortcuts
            </p>

            <div className="h-px w-10 bg-zinc-700 sm:w-16" />
          </div>

          {/* Links */}
          <div className="mt-7 flex flex-wrap justify-center gap-x-8 gap-y-5 font-mono text-sm text-zinc-400 sm:gap-x-10">
            <Shortcut to="/dashboard" icon="⊞" label="All Boards" />

            <Shortcut to="/dashboard" icon="⊕" label="Create Board" />

            <Shortcut to="/profile" icon="♙" label="My Profile" />

            <Shortcut to="/settings" icon="⚙" label="Settings" />
          </div>
        </section>

        {/* TERMINAL */}
        <section className="mt-12 border border-dashed border-zinc-700/80 bg-[#151515] p-5 sm:mt-14 sm:p-6">
          <div className="font-mono text-sm">
            <span className="text-zinc-600">$</span>{" "}
            <span className="text-lime-400">kanban</span>{" "}
            <span className="text-zinc-300">--help</span>
          </div>

          <p className="mt-3 font-mono text-sm leading-6 text-zinc-500">
            Organize tasks. Collaborate in real-time. Get things done.
          </p>

          <span className="mt-4 block h-4 w-2 animate-pulse bg-zinc-500" />
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
    <div className="min-h-55 border-r border-zinc-700/80 p-4 last:border-r-0">
      <p className="mb-5 font-mono text-xs text-zinc-500">{title}</p>

      <div className="space-y-4">
        {cards.map((rotated, index) => (
          <div
            key={index}
            className={`
              h-8
              w-full
              border
              border-dashed
              border-zinc-600
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
        hover:text-white
      "
    >
      <span className="text-base text-zinc-300">{icon}</span>

      <span>{label}</span>
    </Link>
  );
}

