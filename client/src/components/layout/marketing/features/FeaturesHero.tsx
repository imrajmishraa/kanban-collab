import { Link } from "react-router-dom";

interface BoardColumnProps {
  title: string;
  count: string;
  cards: string[];
}

function BoardColumn({ title, count, cards }: BoardColumnProps) {
  return (
    <div className="min-h-56 bg-[#0c0c0e] p-4 sm:min-h-64">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {title}
        </span>

        <span className="font-mono text-[10px] text-neutral-600">{count}</span>
      </div>

      <div className="space-y-2">
        {cards.map((card) => (
          <div
            key={card}
            className="border border-neutral-800 bg-[#101012] px-3 py-3 transition-colors hover:border-neutral-700"
          >
            <p className="text-xs text-neutral-300">{card}</p>

            <div className="mt-3 flex items-center justify-between">
              <span className="h-px w-10 bg-neutral-800" />

              <span className="font-mono text-[9px] text-neutral-700">
                CARD
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FeaturesHero() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-800 bg-[#080808] px-4 py-24 text-neutral-100 sm:px-6 sm:py-32 lg:px-8 lg:py-36">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center text-center">
        {/* Eyebrow */}
        <div className="mb-7 inline-flex items-center gap-2 border border-neutral-800 bg-[#0c0c0e] px-3 py-1.5">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
          />

          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
            Features
          </span>
        </div>

        {/* Heading */}
        <h1 className="max-w-4xl font-mono text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          Everything you need to{" "}
          <span className="text-rose-500">move work forward.</span>
        </h1>

        {/* Description */}
        <p className="mt-7 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
          Plan, organize, and collaborate with your team in a real-time Kanban
          workspace built to turn ideas into progress.
        </p>

        {/* Actions */}
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            to="/auth/register"
            className="inline-flex
                min-w-36
                items-center
                justify-center
                border
                border-rose-500/80
                bg-rose-500/10
                px-5
                py-2.5
                font-mono
                text-sm
                text-rose-400
                transition-all
                duration-200
                hover:bg-rose-500/20
                hover:text-rose-300
                active:scale-[0.98]"
          >
            [ Get Started ]
          </Link>

          <a
            href="#core-features"
            className="inline-flex
                min-w-36
                items-center
                justify-center
                border
                border-neutral-700
                px-5
                py-2.5
                font-mono
                text-sm
                text-neutral-400
                transition-all
                duration-200
                hover:border-neutral-500
                hover:text-neutral-100"
          >
            [ Explore Features ]
          </a>
        </div>

        {/* Product preview */}
        <div className="mt-20 w-full max-w-5xl">
          <div className="border border-neutral-800 bg-[#0c0c0e]">
            {/* Browser chrome */}
            <div className="flex h-11 items-center justify-between border-b border-neutral-800 px-4">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full border border-rose-500"
                />

                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full border border-yellow-500"
                />

                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full border border-emerald-500"
                />

                <span className="ml-2 font-mono text-[10px] text-neutral-600">
                  kanban.board
                </span>
              </div>

              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-700">
                Live
              </span>
            </div>

            {/* Board */}
            <div className="grid gap-px bg-neutral-800 sm:grid-cols-3">
              <BoardColumn
                title="Todo"
                count="03"
                cards={["Design board layout", "Create workspace"]}
              />

              <BoardColumn
                title="In Progress"
                count="02"
                cards={["Real-time collaboration", "Authentication flow"]}
              />

              <BoardColumn
                title="Done"
                count="04"
                cards={["API integration", "Project setup"]}
              />
            </div>
          </div>

          {/* Preview caption */}
          <div className="flex flex-col items-center justify-between gap-2 border-x border-b border-neutral-800 px-4 py-3 sm:flex-row">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-700">
              Real-time Kanban workspace
            </span>

            <span className="font-mono text-[10px] text-neutral-800">
              workspace://active
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
