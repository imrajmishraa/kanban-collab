import {
  LogsIcon,
  DashboardSquare01Icon,
  GithubIcon,
  LayersIcon,
  PencilEdit02Icon,
  Rocket01Icon,
  Settings01Icon,
  StarIcon,
  Tag01Icon,
  UserGroupIcon,
  UserIcon,
  Note01Icon,
  FileStarIcon,
  Agreement03Icon,
  BiometricAccessIcon,
  BookOpen02Icon,
  MessageQuestionIcon,
  SmilePlusIcon,
  Home03Icon,
  BellRingIcon,
  ApiIcon,
  House02Icon,
  CloudServerIcon,
  NewTwitterIcon,
  InstagramIcon,
  YoutubeIcon,
  Mail01Icon,
  BiscuitIcon,
} from "@hugeicons/core-free-icons";

/**
 * Everything the header knows: its palette, and every route it can point at.
 *
 * The routes live here rather than in the components so there is one list to
 * edit when a page moves. The navbar renders NAV_LINKS, SOLUTIONS and
 * MOBILE_LINKS; the search renders PUBLIC_PAGES and PROTECTED_PAGES.
 *
 * Workspace-scoped hrefs are the route shapes without an id. If the search is
 * mounted where a workspace is known, prefix them with it — otherwise they land
 * on the workspace picker, which is the app's own guard behaviour.
 */

/* ── Palette ──────────────────────────────────────────────────────
   The bar is permanently light: it reads no theme token, so it looks the same
   in dark and light. Written as arbitrary rgb() rather than hex or palette
   utilities because `check-theme-colors` rejects those two and allows rgb. */
export const NAV = {
  surface: "bg-[rgb(255,255,255)]",
  edge: "border-[rgb(234,234,234)]",
  /* Plain values here. A `hover:` class in `ink` would set nothing at rest and
     the bar would inherit body's ink again. */
  ink: "text-[rgb(55,55,55)]",
  inkSecondary: "text-[rgb(104,104,104)]",
  /* One label colour for every piece of text in the bar. */
  text: "text-[rgb(90,90,90)]",
  /* Hover goes lighter, not darker: the label steps back under the pointer. */
  inkHover: "hover:text-[rgb(176,176,176)]",
  placeholder: "placeholder:text-[rgb(160,160,160)]",
  icon: "text-[rgb(128,128,128)]",
  iconHover: "hover:text-[rgb(55,55,55)]",
  accent: "text-[rgb(52,92,58)]",
  accentBar: "bg-[rgb(52,92,58)]",
  accentWash: "bg-[rgb(240,246,240)]",
  divider: "bg-[rgb(234,234,234)]",
  hover: "hover:bg-[rgb(246,246,246)]",
  focus: "focus-visible:ring-[rgb(52,92,58)]",
  panel: "shadow-[0_18px_50px_-12px_rgba(15,23,42,0.18)]",
  key: "rounded-md border border-[rgb(228,228,228)] px-1.5 py-0.5 text-[11px] font-medium text-[rgb(140,140,140)]",
} as const;

/* ── Shapes ───────────────────────────────────────────────────────── */

export interface NavLink {
  title: string;
  href: string;
  icon?: typeof LayersIcon;
}

export interface NavPage {
  title: string;
  href: string;
  icon: typeof LayersIcon;
  /** The section the page sits in, shown under the title in the search. */
  parent?: string;
  /** Behind the auth guard: reaching it signed out redirects to login. */
  protected?: boolean;
  /** Kept out of the empty search list, still found when typing. */
  searchOnly?: boolean;
  /** Lives under /workspaces/:id, so it needs the active workspace. */
  workspaceScoped?: boolean;
}

/* ── The bar ──────────────────────────────────────────────────────── */

/** Top-level links. Solutions renders as the dropdown, so it is not here. */
export const NAV_LINKS: NavLink[] = [
  { title: "Examples", href: "/use-cases" },
  { title: "Pricing", href: "/pricing" },
  { title: "Docs", href: "/docs" },
];

export const SOLUTIONS: NavPage[] = [
  { title: "All solutions", href: "/solutions", icon: LayersIcon },
  {
    title: "How it works",
    href: "/solutions#how-it-works",
    icon: Rocket01Icon,
  },
  {
    title: "Engineering",
    href: "/solutions#engineering",
    icon: DashboardSquare01Icon,
  },
  { title: "Product", href: "/solutions#product", icon: PencilEdit02Icon },
  { title: "Design", href: "/solutions#design", icon: PencilEdit02Icon },
  {
    title: "Open source teams",
    href: "/solutions#open-source",
    icon: GithubIcon,
  },
];

/** What the phone menu shows: the short list, then the action. */
export const MOBILE_LINKS: NavLink[] = [
  { title: "Examples", href: "/use-cases", icon: LayersIcon },
  { title: "Solutions", href: "/solutions", icon: PencilEdit02Icon },
  { title: "Pricing", href: "/pricing", icon: Tag01Icon },
  { title: "Docs", href: "/docs", icon: BookOpen02Icon },
];

/* ── Search: public ───────────────────────────────────────────────── */

export const PUBLIC_PAGES: NavPage[] = [
  { title: "Home", href: "/home", icon: Home03Icon },
  { title: "Cookies policy", href: "/cookies", icon: BiscuitIcon },
  { title: "Examples", href: "/use-cases", icon: LayersIcon },
  { title: "Features", href: "/features", icon: FileStarIcon },
  { title: "How it works", href: "/how-it-works", icon: Rocket01Icon },
  { title: "Solutions", href: "/solutions", icon: PencilEdit02Icon },
  { title: "Pricing", href: "/pricing", icon: Tag01Icon },
  { title: "Testimonials", href: "/testimonials", icon: StarIcon },
  { title: "Docs", href: "/docs", icon: BookOpen02Icon },
  { title: "Terms of Service", href: "/terms", icon: Agreement03Icon },
  { title: "Privacy policy", href: "/privacy", icon: BiometricAccessIcon },
  { title: "Help", href: "/help", icon: MessageQuestionIcon },
  { title: "Feedback", href: "/feedback", icon: SmilePlusIcon },
  { title: "Github Team", href: "/solutions#open-source", icon: GithubIcon },
];

/**
 * The empty search shows only the public pages that are NOT already a nav
 * link. Repeating Examples, Solutions, Pricing and Docs there would be a menu
 * of the menu.
 */
export const QUICK_PAGES: NavPage[] = PUBLIC_PAGES.filter(
  (page) =>
    ![
      "/home",
      "/features",
      "/use-cases",
      "/solutions",
      "/pricing",
      "/docs",
      "/how-it-works",
      "/feedback",
      "/testimonials",
      "/solutions#open-source",
    ].includes(page.href),
);

/* ── Search: behind the guard ─────────────────────────────────────── */

export const PROTECTED_PAGES: NavPage[] = [
  {
    title: "Boards",
    workspaceScoped: true,
    href: "/boards",
    icon: LayersIcon,
    parent: "Workspace",
    protected: true,
  },
  {
    title: "Notes",
    workspaceScoped: true,
    href: "/notes",
    icon: Note01Icon,
    parent: "Workspace",
    protected: true,
  },
  {
    title: "Activity logs",
    workspaceScoped: true,
    href: "/activity",
    icon: LogsIcon,
    parent: "Workspace",
    protected: true,
  },
  {
    title: "Members",
    searchOnly: true,
    workspaceScoped: true,
    href: "/members",
    icon: UserGroupIcon,
    parent: "Workspace",
    protected: true,
  },
  {
    title: "Settings",
    searchOnly: true,
    workspaceScoped: true,
    href: "/settings",
    icon: Settings01Icon,
    parent: "Workspace",
    protected: true,
  },
  {
    title: "Notifications",
    searchOnly: true,
    workspaceScoped: true,
    href: "/settings/notifications",
    icon: BellRingIcon,
    parent: "Workspace settings",
    protected: true,
  },
  {
    title: "Profile",
    searchOnly: true,
    href: "/account/profile",
    icon: UserIcon,
    parent: "Account",
    protected: true,
  },
  {
    title: "Preferences",
    searchOnly: true,
    href: "/account/settings",
    icon: Settings01Icon,
    parent: "Account",
    protected: true,
  },
  {
    title: "Notification settings",
    href: "/account/notifications",
    icon: BellRingIcon,
    parent: "Account",
    protected: true,
  },
  {
    /* The picker itself: noisy in a list of destinations, useful when the
       visitor is actually looking for it. */
    title: "Workspaces",
    href: "/workspaces",
    icon: DashboardSquare01Icon,
    parent: "Account",
    protected: true,
    searchOnly: true,
  },
];

/**
 * The guarded pages the empty search lists: a short set of destinations, not
 * the whole app. Everything else is still there when the visitor types, which
 * keeps the resting panel readable while leaving the map complete.
 */
export const DEFAULT_PROTECTED: NavPage[] = PROTECTED_PAGES.filter(
  (page) => !page.searchOnly,
);

/* ── Footer ───────────────────────────────────────────────────────── */

export interface FooterLink {
  title: string;
  href: string;
  /** Off-site, so it opens in a new tab and skips the router. */
  external?: boolean;
  /** A short bold note after the label, like "Free". */
  badge?: string;
  /** A live status dot after the label. */
  dot?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

/**
 * The "Ask AI" row: the same five tools the reference links to, pointed at this
 * project instead. Each opens with the question already written, so a visitor
 * lands on an answer rather than an empty box.
 */
const ASK = encodeURIComponent(
  "Tell me about Kanban Collab (https://github.com/imrajmishraa/kanban-collab): what it does, how its realtime CRDT sync works, and how to self-host it with Docker.",
);

export type AiBrand = "chatgpt" | "claude" | "perplexity" | "grok" | "gemini";

export interface AiLink {
  title: string;
  href: string;
  brand: AiBrand;
}

export const FOOTER_AI: AiLink[] = [
  {
    title: "Ask ChatGPT about Kanban",
    href: `https://chatgpt.com/?q=${ASK}`,
    brand: "chatgpt",
  },
  {
    title: "Ask Claude about Kanban",
    href: `https://claude.ai/new?q=${ASK}`,
    brand: "claude",
  },
  {
    title: "Ask Perplexity about Kanban",
    href: `https://www.perplexity.ai/search/new?q=${ASK}`,
    brand: "perplexity",
  },
  {
    title: "Ask Grok about Kanban",
    href: `https://grok.com/?q=${ASK}`,
    brand: "grok",
  },
  {
    title: "Ask Gemini AI about Kanban",
    href: `https://www.google.com/search?udm=50&q=${ASK}`,
    brand: "gemini",
  },
];

const REPO = "https://github.com/imrajmishraa/kanban-collab";
const DOCS = `${REPO}/tree/main/docs`;

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { title: "Examples", href: "/use-cases" },
      { title: "Features", href: "/features" },
      { title: "How it works", href: "/how-it-works" },
      { title: "Solutions", href: "/solutions" },
      { title: "Pricing", href: "/pricing", badge: "Free" },
      { title: "Testimonials", href: "/testimonials" },
    ],
  },
  {
    title: "Build",
    links: [
      { title: "Documentation", href: DOCS, external: true },
      {
        title: "API reference",
        href: `${REPO}/blob/main/docs/api-reference.md`,
        external: true,
      },
      {
        title: "Architecture",
        href: `${REPO}/blob/main/docs/architecture.md`,
        external: true,
      },
      {
        title: "Self-hosting",
        href: `${REPO}/blob/main/docs/deployment.md`,
        external: true,
      },
      {
        title: "Contributing",
        href: `${REPO}/blob/main/docs/contributing.md`,
        external: true,
      },
      { title: "Report an issue", href: `${REPO}/issues`, external: true },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        title: "Design tokens",
        href: `${REPO}/blob/main/design.md`,
        external: true,
      },
      {
        title: "Realtime sync",
        href: `${REPO}/blob/main/docs/realtime-collaboration.md`,
        external: true,
      },
      {
        title: "Activity log",
        href: `${REPO}/blob/main/docs/activity-log.md`,
        external: true,
      },
      {
        title: "System status",
        href: `${REPO}/actions`,
        external: true,
        dot: true,
      },
      { title: "FAQ", href: `${REPO}/blob/main/docs/faq.md`, external: true },
    ],
  },
  {
    title: "More",
    links: [
      { title: "Pricing", href: "/pricing" },
      { title: "License", href: `${REPO}/blob/main/LICENSE`, external: true },
      {
        title: "Author",
        href: "https://github.com/imrajmishraa",
        external: true,
      },
      { title: "Open source", href: REPO, external: true },
      { title: "Privacy policy", href: "/privacy" },
      { title: "Cookie policy", href: "/cookies" },
      { title: "Terms of service", href: "/terms" },
    ],
  },
];

/**
 * The row of square buttons under the columns: the places a developer actually
 * goes next. Brand marks for AI tools would have to be drawn by hand here, so
 * these point at the project's own surfaces instead.
 */
export const FOOTER_TOOLS: NavPage[] = [
  { title: "Documentation", href: DOCS, icon: BookOpen02Icon },
  {
    title: "API reference",
    href: `${REPO}/blob/main/docs/api-reference.md`,
    icon: ApiIcon,
  },
  {
    title: "Architecture",
    href: `${REPO}/blob/main/docs/architecture.md`,
    icon: House02Icon,
  },
  {
    title: "Self-hosting",
    href: `${REPO}/blob/main/docs/deployment.md`,
    icon: CloudServerIcon,
  },
  { title: "Repository", href: REPO, icon: GithubIcon },
];

/** Contact and legal, kept out of the columns so the base row stays short. */
export const FOOTER_CONTACT = {
  label: "Contact us",
  href: `${REPO}/issues/new`,
  external: true,
} as const;

export const FOOTER_LEGAL: FooterLink[] = [
  { title: "Consent preferences", href: "/cookies" },
];

export const FOOTER_SOCIAL: NavPage[] = [
  { title: "GitHub", href: REPO, icon: GithubIcon },
  { title: "X", href: "http://x.com/imrajmishraa", icon: NewTwitterIcon },
  {
    title: "Instagram",
    href: "http://instagram.com/imrajmishraa",
    icon: InstagramIcon,
  },
  {
    title: "Youtube",
    href: "http://youtube.com/@imrajmishraa",
    icon: YoutubeIcon,
  },
  { title: "Mail", href: "mailto:rajm56002@gmail.com", icon: Mail01Icon },
];
