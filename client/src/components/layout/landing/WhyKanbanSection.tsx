import React from "react";
import FeatureCard from "./FeatureCard";

const features = [
  {
    number: "01",
    title: "Organize",
    description:
      "Turn scattered ideas into structured boards, lists, and tasks that everyone can understand.",
  },
  {
    number: "02",
    title: "Collaborate",
    description:
      "Work together in real time. Changes propagate instantly so everyone stays on the same page.",
  },
  {
    number: "03",
    title: "Move Faster",
    description:
      "Visualize progress, remove bottlenecks, and keep your team focused on what matters next.",
  },
];

export default function WhyKanbanSection() {
  return (
    <section className="border-b border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        {/* Heading */}
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-rose-500">
            // Why Kanban?
          </p>

          <h2 className="mt-4 font-mono text-3xl tracking-tight text-neutral-100 sm:text-4xl">
            Work should move forward.
          </h2>

          <p className="mt-5 max-w-xl font-mono text-sm leading-7 text-neutral-500">
            Keep your work visible, your team aligned, and your next move
            obvious.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.number} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}