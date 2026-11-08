import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

import type { Plan } from "./plans";

interface PlanCardProps {
  plan: Plan;
}

/**
 * One plan.
 *
 * The card is a hairline box with a wash, not a shadowed panel — the featured
 * one is marked with the brand line and a stronger wash rather than by being
 * lifted off the page. One primary button per screen, so only the featured card
 * gets `.m-btn`; the other two are outlines.
 */
export default function PlanCard({ plan }: PlanCardProps) {
  const featured = plan.featured === true;

  return (
    <article
      className={[
        "flex min-w-0 flex-col rounded-xl border p-6",
        featured
          ? "border-(--brand-line) bg-linear-to-b from-(--brand-wash) to-transparent"
          : "border-(--hairline) bg-(--bg-surface)",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-[24px] font-bold tracking-[-1px] text-(--text-primary)">
          {plan.name}
        </h2>
        <span className="ml-auto rounded-sm border border-(--hairline) px-1.5 py-[3px] font-mono text-[9px] uppercase tracking-[0.1em] text-(--text-muted)">
          {plan.note}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-2">
        <span className="text-[34px] font-bold leading-none tracking-[-1.4px] text-(--text-primary)">
          {plan.price}
        </span>
        <span className="text-[14px] text-(--text-muted)">{plan.period}</span>
      </div>

      <p className="mt-3 text-[15px] leading-6 tracking-[-0.2px] text-(--text-secondary)">
        {plan.blurb}
      </p>

      <ul className="mt-6 flex flex-col gap-3 border-t border-(--hairline) pt-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0 text-(--brand)">
              <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2.4} />
            </span>
            <span className="text-[14px] leading-[1.5] text-(--text-secondary)">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <Link
          to={plan.cta.to}
          className={["w-full", featured ? "m-btn" : "m-btn-outline"].join(" ")}
        >
          {plan.cta.label}
        </Link>
      </div>
    </article>
  );
}
