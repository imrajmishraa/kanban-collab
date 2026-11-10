import {
  Calendar01Icon,
  CheckListIcon,
  ClipboardClockIcon,
  CloudServerIcon,
  CodeIcon,
  CubeIcon,
  DashboardSquare01Icon,
  DatabaseIcon,
  FlashIcon,
  HierarchyIcon,
  Layers01Icon,
  LockPasswordIcon,
  Medal01Icon,
  PencilEdit02Icon,
  ServerIcon,
  Shield01Icon,
  SlackIcon,
  Tag01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

/** Every category path, in tab order. `how-it-works` is a page of its own. */
export const SOLUTIONS_TABS = [
  { label: "By team", to: "/solutions/teams" },
  { label: "By workflow", to: "/solutions/workflow" },
  { label: "By where it runs", to: "/solutions/deployment" },
  { label: "By constraint", to: "/solutions/constraints" },
] as const;

/**
 * The solutions page is a catalogue, not an argument: five categories, each a
 * grid of cards that says who it is for, what it is, and where to read more.
 *
 * That is the shape of the packages page in the reference — sticky category
 * tabs over card grids — because a solutions page is read the same way: scan
 * the categories, open the one that matches, follow one link.
 */

export interface SolutionCard {
  title: string;
  body: string;
  icon: typeof CodeIcon;
  links: { label: string; to: string }[];
}

export interface SolutionCategory {
  id: string;
  /** The path segment: /solutions/<slug>. */
  slug: string;
  label: string;
  title: string;
  icon: typeof CodeIcon;
  /** The one line the hero shows. */
  blurb: string;
  /** The paragraph the section under the tabs opens with — a different sentence. */
  description: string;
  cards: SolutionCard[];
}

export const CATEGORIES: SolutionCategory[] = [
  {
    id: "teams",
    slug: "teams",
    label: "By team",
    title: "By team",
    icon: UserGroupIcon,
    blurb:
      "The same board, read by six different jobs. None of them configure it differently. Each reads a different part of the same columns.",
    description:
      "A board is one object to everyone who opens it, but each job reads a different part of it. Engineering reads the columns as a pipeline and the cards as tickets; product reads them as commitments, including the ones deliberately not made; design reads a card as a screen and the comments as its review history; marketing reads the right-hand columns as a schedule; operations reads an intake queue that has to be triaged while it is still filling; and an agency reads one workspace per client as the permission boundary. None of them configure anything different — the columns, the cards and the log are the same shape — which is why a board started by one team is legible to the next without a handover document.",
    cards: [
      {
        title: "Engineering",
        body: "One card per ticket, one column per stage. The board is the sprint view, so stand-up is reading rather than asking.",
        icon: CodeIcon,
        links: [
          { label: "How sync works", to: "/docs/realtime/quick-start" },
          { label: "Docs", to: "/docs" },
        ],
      },
      {
        title: "Product",
        body: "Discovery and delivery on one board, in separate columns. Nothing is promised by being on the board, and nothing is lost by waiting a quarter.",
        icon: Layers01Icon,
        links: [
          { label: "Examples", to: "/use-cases" },
          { label: "Features", to: "/features" },
        ],
      },
      {
        title: "Design",
        body: "A card per screen, a comment per review round. A second review starts from what was already said.",
        icon: PencilEdit02Icon,
        links: [
          { label: "Examples", to: "/use-cases" },
          { label: "Docs", to: "/docs" },
        ],
      },
      {
        title: "Marketing",
        body: "Draft, in review, scheduled, live. During a launch the board changes faster than anyone can report it.",
        icon: Tag01Icon,
        links: [
          { label: "Examples", to: "/use-cases" },
          { label: "Features", to: "/features" },
        ],
      },
      {
        title: "Operations",
        body: "An intake board per queue, triaged while items are still arriving, with the activity log explaining the morning after.",
        icon: ClipboardClockIcon,
        links: [
          { label: "How it works", to: "/how-it-works" },
          { label: "Docs", to: "/docs" },
        ],
      },
      {
        title: "Agencies",
        body: "A workspace per client is the permission boundary. Clients watch progress live instead of asking for a Friday update.",
        icon: UserGroupIcon,
        links: [
          { label: "Pricing", to: "/pricing" },
          { label: "Features", to: "/features" },
        ],
      },
    ],
  },
  {
    id: "workflows",
    slug: "workflow",
    label: "By workflow",
    title: "By workflow",
    blurb:
      "Four boards, four first-day setups. Each one is the same three columns renamed. A team that outgrows one adds a column, not a tool.",

    icon: SlackIcon,
    description:
      "Four boards cover almost every team, and they are the same three or four columns renamed. A sprint board turns a backlog into a review; a roadmap answers “when” without a meeting; a review queue makes a card visible to the reviewer the moment it enters the column; and a launch calendar is written as the launch happens rather than reconstructed afterwards. None of them needs a plugin, and a team that outgrows one moves to the next by adding a column rather than starting again.",
    cards: [
      {
        title: "Sprint board",
        body: "Backlog, in progress, review, done. Three or four columns is the whole configuration.",
        icon: DashboardSquare01Icon,
        links: [
          { label: "See it", to: "/use-cases" },
          { label: "Docs", to: "/docs" },
        ],
      },
      {
        title: "Roadmap",
        body: "Now, next, later — a board the whole company can read without a status meeting.",
        icon: HierarchyIcon,
        links: [
          { label: "See it", to: "/use-cases" },
          { label: "How it works", to: "/how-it-works" },
        ],
      },
      {
        title: "Review queue",
        body: "A column per discipline, so a card entering review is already visible to the reviewer.",
        icon: CheckListIcon,
        links: [
          { label: "See it", to: "/use-cases" },
          { label: "Features", to: "/features" },
        ],
      },
      {
        title: "Launch calendar",
        body: "Stages rather than dates: draft, review, scheduled, live, with the live column written as it happens.",
        icon: Calendar01Icon,
        links: [
          { label: "See it", to: "/use-cases" },
          { label: "Docs", to: "/docs" },
        ],
      },
    ],
  },
  {
    id: "deployment",
    slug: "deployment",
    label: "Deployment",
    title: "By deployment",
    blurb:
      "Where the board runs decides who can use it. Self-hosted or managed, it is the same database and the same client.",
    icon: ServerIcon,
    description:
      "Where the board runs decides who can use it, what you can promise a client, and what happens the day a vendor changes their pricing. Self-hosted puts the database and the process on your own machine or your own box; compose brings the four services up together; an air-gapped install works because the fonts are bundled and nothing calls a CDN at runtime; and the managed tier is for teams who want the same board without owning the MongoDB.",
    cards: [
      {
        title: "Self-hosted",
        body: "Your MongoDB, your Redis, your hostname. One Node process and a static client build.",
        icon: ServerIcon,
        links: [
          { label: "Pricing", to: "/pricing" },
          { label: "Docs", to: "/docs" },
        ],
      },
      {
        title: "Docker compose",
        body: "The repository ships a compose file that brings up Mongo, Redis, the API and the client together.",
        icon: CubeIcon,
        links: [
          { label: "How it works", to: "/how-it-works" },
          { label: "Docs", to: "/docs" },
        ],
      },
      {
        title: "Air-gapped",
        body: "Fonts are bundled and nothing calls a CDN, so a board on a closed network behaves like one on the open web.",
        icon: LockPasswordIcon,
        links: [
          { label: "Features", to: "/features" },
          { label: "Docs", to: "/docs" },
        ],
      },
      {
        title: "Managed",
        body: "The hosted tier, in early access: we run the database and the upgrades, you invite the squad.",
        icon: CloudServerIcon,
        links: [
          { label: "Join the waitlist", to: "/pricing" },
          { label: "Features", to: "/features" },
        ],
      },
    ],
  },
  {
    id: "constraints",
    slug: "constraints",
    label: "By constraint",
    title: "By constraint",
    blurb:
      "Most teams arrive with one sentence about what they cannot do. Each of those is a constraint on where the board lives or how it syncs.",
    icon: DatabaseIcon,
    description:
      "Most teams arrive here with one sentence: “we can’t put our data there”, “we can’t afford per-seat pricing”, “our client can’t see our other work”, or “the board is always stale by the time we look at it”. Each of those is a constraint on where the board lives or how it syncs rather than a feature request — which is why the answer to all four is the same product, running somewhere else.",
    cards: [
      {
        title: "Data residency",
        body: "Boards, cards and comments live in your database. There is no third-party call at runtime to audit.",
        icon: DatabaseIcon,
        links: [
          { label: "Pricing", to: "/pricing" },
          { label: "Docs", to: "/docs" },
        ],
      },
      {
        title: "No per-seat tax",
        body: "MIT licensed, so a member is a person in a workspace rather than a line on an invoice.",
        icon: Medal01Icon,
        links: [
          { label: "Pricing", to: "/pricing" },
          {
            label: "GitHub",
            to: "https://github.com/imrajmishraa/kanban-collab",
          },
        ],
      },
      {
        title: "Client isolation",
        body: "A workspace is the permission boundary, and WebSocket connections pass the same auth as HTTP.",
        icon: Shield01Icon,
        links: [
          { label: "Features", to: "/features" },
          { label: "Docs", to: "/docs" },
        ],
      },
      {
        title: "Boards that never go stale",
        body: "Every client holds the same Yjs document, so two people moving a card is a merge rather than a lost change.",
        icon: FlashIcon,
        links: [
          { label: "How sync works", to: "/how-it-works" },
          { label: "Docs", to: "/docs" },
        ],
      },
    ],
  },
];
