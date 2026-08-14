import React from "react";

interface FeatureCardProps {
  number: string;
  title: string;
  description: string;
}

export default function FeatureCard({
  number,
  title,
  description,
}: FeatureCardProps) {
  return (
    <article className="group border border-neutral-800 bg-[#0f0f11] p-6 transition-colors duration-200 hover:border-neutral-700 sm:p-7">
      <div className="flex items-start justify-between">
        <span className="font-mono text-xs text-neutral-700">{number}</span>

        <span className="font-mono text-xs text-neutral-700 transition-colors group-hover:text-rose-500">
          +
        </span>
      </div>

      <h3 className="mt-8 font-mono text-lg text-neutral-200">{title}</h3>

      <p className="mt-3 font-mono text-sm leading-6 text-neutral-600">
        {description}
      </p>
    </article>
  );
}