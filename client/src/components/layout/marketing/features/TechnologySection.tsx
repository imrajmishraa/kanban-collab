import React from 'react';
import { ArchitectureLayer } from '@components/ui/marketing/features/ArchitectureLayer';
import { TechnologyItem } from '@components/ui/marketing/features/TechnologyItem';

export interface Technology {
  name: string;
  role: string;
  description: string;
}

const technologies: Technology[] = [
  {
    name: "React",
    role: "Frontend",
    description:
      "A responsive interface for managing boards, workspaces, and everyday project workflows.",
  },
  {
    name: "TypeScript",
    role: "Language",
    description:
      "Strong typing across the application to keep the codebase predictable and maintainable.",
  },
  {
    name: "WebSockets",
    role: "Transport",
    description:
      "Persistent connections that allow connected clients to communicate with the collaboration server.",
  },
  {
    name: "Yjs",
    role: "Collaboration",
    description:
      "CRDT-based shared state that enables concurrent changes to be synchronized between clients.",
  },
  {
    name: "MongoDB",
    role: "Persistence",
    description:
      "Persistent storage for application data and collaboration state that needs to survive beyond a session.",
  },
  {
    name: "Redis",
    role: "Infrastructure",
    description:
      "Fast coordination and messaging infrastructure supporting the real-time collaboration layer.",
  },
];

export default function TechnologySection() {
  return (
    <section className="border-b border-neutral-800 bg-[#080808] px-4 py-24 text-neutral-100 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-7xl">
        {/* Heading */}
        <div className="max-w-3xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="font-mono text-[10px] text-rose-500">05</span>

            <span className="h-px w-6 bg-neutral-800" />

            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
              Technology
            </span>
          </div>

          <h2 className="font-mono text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Built with technology
            <br />
            <span className="text-neutral-500">that scales with the work.</span>
          </h2>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
            Kanban combines a modern frontend with a real-time collaboration
            layer and reliable backend infrastructure to keep work synchronized
            and accessible.
          </p>
        </div>

        {/* Architecture */}
        <div className="mt-14 border border-neutral-800 bg-[#0c0c0e]">
          {/* Architecture header */}
          <div className="flex h-11 items-center justify-between border-b border-neutral-800 px-4">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full border border-rose-500"
              />

              <span className="font-mono text-[10px] text-neutral-500">
                kanban / architecture
              </span>
            </div>

            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-700">
              system://ready
            </span>
          </div>

          {/* Architecture flow */}
          <div className="grid gap-px bg-neutral-800 lg:grid-cols-3">
            <ArchitectureLayer
              number="01"
              title="Client"
              technologies={["React", "TypeScript"]}
            />

            <ArchitectureLayer
              number="02"
              title="Real-time"
              technologies={["WebSockets", "Yjs"]}
            />

            <ArchitectureLayer
              number="03"
              title="Infrastructure"
              technologies={["MongoDB", "Redis"]}
            />
          </div>
        </div>

        {/* Technology list */}
        <div className="mt-8 grid border border-neutral-800 sm:grid-cols-2 lg:grid-cols-3">
          {technologies.map((technology, index) => (
            <TechnologyItem
              key={technology.name}
              technology={technology}
              index={String(index + 1).padStart(2, "0")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
