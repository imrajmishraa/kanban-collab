import { useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

type Cycle = "monthly" | "yearly";

interface Plan {
  name: string;
  tagline: string;
  monthly: number | null;
  yearly: number | null;
  /** Shown instead of a price, for a plan that is not sold. */
  note?: string;
  cta: string;
  href: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: "Self-host",
    tagline: "Run the whole thing on your own machine or your own box.",
    monthly: 0,
    yearly: 0,
    note: "Free forever",
    cta: "Read the setup",
    href: "https://github.com/imrajmishraa/kanban-collab",
    features: [
      "Unlimited boards and workspaces",
      "Real-time sync over WebSockets",
      "Offline edits reconciled on reconnect",
      "Docker compose for client, API, Mongo and Redis",
      "MIT licensed, no seat counting",
      "Community support through issues",
    ],
  },
  {
    name: "Cloud",
    tagline: "The same app, hosted, with nothing to install or maintain.",
    monthly: 8,
    yearly: 80,
    cta: "Start free",
    href: "/auth/register",
    features: [
      "Everything in Self-host",
      "No setup, no servers to watch",
      "Automatic backups and restores",
      "Invite up to ten people per board",
      "Email support with a two day reply",
      "Custom domains on request",
    ],
  },
  {
    name: "Team",
    tagline: "For teams who need the admin controls and a name to call.",
    monthly: 16,
    yearly: 160,
    cta: "Talk to us",
    href: "/auth/register",
    features: [
      "Everything in Cloud",
      "Unlimited members per board",
      "SSO and an audit log",
      "Roles beyond owner and member",
      "Priority support with a next day reply",
      "A migration hand from your current tool",
    ],
  },
];

interface PricingSectionProps {
  /**
   * Which theme this band is staged in.
   *
   * Defaults to `dark` rather than inheriting, because a price is read the same
   * way by everyone: a plan table that changes colour with the visitor's app
   * preference is a table that looks like two different offers in screenshots,
   * support threads and comparisons. Pass `light` for the other stage, or
   * `inherit` to follow the page like an ordinary section.
   */
  themeLock?: "dark" | "light" | "inherit";
}

const price = (value: number) => (value === 0 ? "$0" : `$${value}`);

export default function PricingSection({
  themeLock = "dark",
}: PricingSectionProps) {
  const [cycle, setCycle] = useState<Cycle>("yearly");

  /* `.theme-dark` restates the dark palette as a scope, `.light` is the page
     override reused as one. Same lock the FAQ uses. */
  const scope =
    themeLock === "dark" ? "theme-dark" : themeLock === "light" ? "light" : "";

  return (
    <section
      id="pricing"
      className={["scroll-mt-16", scope, "bg-(--bg-root) text-(--text-primary)"]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto w-full max-w-384">
        <div className="overflow-hidden border-x border-(--hairline)">
          {/* Header band: the claim, the line under it, and the billing
              choice, all inside the same frame as the plans below. */}
          <div className="border-b border-(--hairline) px-4 py-10 sm:px-8 sm:py-12 md:px-12 md:py-14 lg:px-16 lg:py-16">
            <div className="max-w-5xl">
              <h2 className="text-3xl font-bold tracking-tight text-(--text-primary) md:text-4xl">
                It all comes{" "}
                <span className="text-(--text-subtle)">together</span>
              </h2>
              <p className="mt-4 max-w-4xl text-xl font-light leading-relaxed text-(--text-secondary)">
                Start on your own server for nothing, or let us host it. Either
                way it is the same board, the same real-time sync and the same
                export button.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div
                role="radiogroup"
                aria-label="Billing cycle"
                className="relative inline-flex items-center rounded-xl border border-(--hairline) bg-(--bg-root) p-1"
              >
                {/* The pill slides rather than the buttons swapping fills, so
                    the eye follows one object instead of two. */}
                <span
                  aria-hidden="true"
                  className={[
                    "absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-(--tint-8)",
                    "transition-transform duration-200 ease-out motion-reduce:transition-none",
                    cycle === "yearly" ? "translate-x-full" : "translate-x-0",
                  ].join(" ")}
                />

                {(
                  [
                    { value: "monthly", label: "Monthly" },
                    { value: "yearly", label: "Yearly" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={cycle === option.value}
                    onClick={() => setCycle(option.value)}
                    className={[
                      "relative z-10 inline-flex min-h-10 min-w-24 cursor-pointer items-center justify-center gap-2",
                      "rounded-lg px-4 text-sm font-semibold",
                      "transition-colors duration-200 motion-reduce:transition-none",
                      cycle === option.value
                        ? "text-(--text-primary)"
                        : "text-(--text-muted) hover:text-(--text-primary)",
                    ].join(" ")}
                  >
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Plans: three columns sharing the frame, divided by hairlines
              rather than floated as separate cards. */}
          <div className="grid grid-cols-1 divide-y divide-(--hairline) lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {PLANS.map((plan) => {
              const amount = cycle === "yearly" ? plan.yearly : plan.monthly;

              return (
                <section
                  key={plan.name}
                  className="relative flex h-full min-w-0 flex-col"
                >
                  <div className="flex flex-col px-4 pt-8 pb-5 sm:px-8 sm:pt-10 sm:pb-6 md:px-12 md:pt-12 lg:px-10 lg:pt-12">
                    <h3 className="text-xl font-semibold text-(--text-primary)">
                      {plan.name}
                    </h3>

                    <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-bold tracking-tight tabular-nums text-(--text-primary)">
                          {amount === null ? plan.note : price(amount)}
                        </span>
                        {amount !== null && amount > 0 ? (
                          <span className="text-sm font-medium text-(--text-secondary)">
                            / {cycle === "yearly" ? "year" : "month"}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-(--text-secondary)">
                      {amount === 0 ? plan.note : plan.tagline}
                    </p>
                  </div>

                  <div className="px-4 pb-8 sm:px-8 sm:pb-10 md:px-12 md:pb-12 lg:px-10">
                    <a
                      href={plan.href}
                      className="inline-flex min-h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-none rounded-tl-lg rounded-br-lg border border-(--hairline-strong) px-4 text-center text-sm font-medium text-(--text-soft) transition-colors duration-200 hover:bg-(--tint-4) hover:text-(--text-primary) motion-reduce:transition-none"
                    >
                      {plan.cta}
                    </a>
                  </div>

                  <div className="relative flex flex-1 flex-col border-t border-(--hairline) px-4 py-8 sm:px-8 sm:py-10 md:px-12 md:py-12 lg:px-10">
                    <ul className="grid gap-3 text-sm">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="grid min-w-0 grid-cols-[1rem_minmax(0,1fr)] items-start gap-3"
                        >
                          <span
                            className="flex h-6 items-center"
                            aria-hidden="true"
                          >
                            <HugeiconsIcon
                              icon={Tick02Icon}
                              size={16}
                              strokeWidth={2}
                              className="text-(--text-primary)"
                            />
                          </span>
                          <span className="min-w-0 leading-6 text-(--text-secondary)">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/** The band staged dark, whatever the app theme is. */
export function PricingSectionDark() {
  return <PricingSection themeLock="dark" />;
}

/** The band staged light, for a page that runs dark. */
export function PricingSectionLight() {
  return <PricingSection themeLock="light" />;
}
