/**
 * The plans, in one place so the cards, the comparison table and the FAQ cannot
 * drift apart.
 *
 * Only the community edition ships today. The two paid tiers are marked as such
 * on the page rather than dressed up as products — a pricing page that invents
 * a checkout is worse than one that says "not yet".
 */

export interface Plan {
  id: "community" | "team" | "enterprise";
  name: string;
  /** The headline figure. Text, not a number: "Free", "Waitlist", "Custom". */
  price: string;
  period: string;
  blurb: string;
  features: string[];
  cta: { label: string; to: string };
  /** The middle card: the one the page argues for. */
  featured?: boolean;
  /** A small mono line under the price — availability, not marketing. */
  note: string;
}

export const PLANS: Plan[] = [
  {
    id: "community",
    name: "Community",
    price: "₹0",
    period: "forever",
    blurb:
      "Run it yourself. Everything the repository ships, with no seat count and no licence key.",
    features: [
      "Unlimited workspaces, boards and members",
      "Real-time sync on a shared Yjs document",
      "Presence, activity log and notifications",
      "Your own MongoDB and Redis",
      "MIT licence — fork it, read it, keep it",
    ],
    cta: { label: "Read the docs", to: "/docs" },
    note: "Available today",
  },
  {
    id: "team",
    name: "Team",
    price: "Waitlist",
    period: "per workspace",
    blurb:
      "The same board with nothing to run. We host it, back it up and upgrade it; you invite the squad.",
    features: [
      "Everything in Community",
      "Hosted — no Mongo, no Redis, no compose file",
      "Backups and upgrades handled for you",
      "Invite by email, no server setup",
      "Shared workspaces per client",
    ],
    cta: { label: "Join the waitlist", to: "/register" },
    featured: true,
    note: "Early access",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "per organisation",
    blurb:
      "For teams whose procurement form is longer than this page. A dedicated instance and a named contact.",
    features: [
      "Everything in Team",
      "A dedicated instance for your organisation",
      "Deployment and migration help",
      "A named contact for fixes",
      "Security review documents on request",
    ],
    cta: { label: "Talk to us", to: "/feedback" },
    note: "Early access",
  },
];

export interface CompareRow {
  label: string;
  community: string;
  team: string;
  enterprise: string;
}

export const COMPARE: CompareRow[] = [
  {
    label: "Boards and members",
    community: "Unlimited",
    team: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    label: "Real-time sync",
    community: "Yjs, over WebSocket",
    team: "Yjs, over WebSocket",
    enterprise: "Yjs, over WebSocket",
  },
  {
    label: "Who runs it",
    community: "You",
    team: "Us",
    enterprise: "A dedicated instance",
  },
  {
    label: "Database",
    community: "Your MongoDB and Redis",
    team: "Managed",
    enterprise: "Managed or yours",
  },
  {
    label: "Backups",
    community: "Your job",
    team: "Included",
    enterprise: "Included",
  },
  {
    label: "Licence",
    community: "MIT",
    team: "MIT, hosted",
    enterprise: "MIT, hosted",
  },
  {
    label: "Support",
    community: "Community",
    team: "Email",
    enterprise: "A named contact",
  },
];

export interface FaqEntry {
  question: string;
  answer: string;
}

export const FAQ: FaqEntry[] = [
  {
    question: "Is the community edition really free?",
    answer:
      "Yes. It is MIT licensed, so the cost is the server you run it on. There is no seat count, no licence key and nothing that phones home — the client build carries its own fonts and talks only to your API.",
  },
  {
    question: "Do we need MongoDB and Redis?",
    answer:
      "The stack expects both. The compose file in the repository brings up MongoDB, Redis, the API and the client together, which is the shortest path to a running board.",
  },
  {
    question: "Can we run it without internet access?",
    answer:
      "The runtime is self-contained: no CDN fonts, no third-party calls. If your network can reach your own MongoDB and Redis, it can run the board.",
  },
  {
    question: "What happens to our data if we stop using it?",
    answer:
      "It stays in your database, and the code that reads it stays in your repository. There is no hosted middle layer to migrate away from, because there was never one.",
  },
  {
    question: "Do backend developers need a seat?",
    answer:
      "There are no seats to count. A member is a person in a workspace; how many people read the board is not a billing question.",
  },
];
