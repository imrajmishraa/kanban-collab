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
    <article className="group border border-(--border) bg-(--surface-elevated) p-6 transition-colors duration-200 hover:border-(--brand) sm:p-7">
      <div className="flex items-start justify-between">
        <span className="font-mono text-xs text-(--text-muted)">
          {number}
        </span>

        <span className="font-mono text-xs text-(--text-muted) transition-colors group-hover:text-(--brand)">
          +
        </span>
      </div>

      <h3 className="mt-8 font-mono text-lg text-(--text-primary)">
        {title}
      </h3>

      <p className="mt-3 font-mono text-sm leading-6 text-(--text-secondary)">
        {description}
      </p>
    </article>
  );
};
