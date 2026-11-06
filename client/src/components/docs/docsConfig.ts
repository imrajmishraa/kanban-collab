/**
 * The documentation navigation, as data.
 */

export interface DocsNavLeaf {
  title: string;
  href: string;
}

/** A heading inside a group. Renders as a label, not a link. */
export interface DocsNavSection {
  title: string;
  children: DocsNavLeaf[];
}

export type DocsNavChild = DocsNavLeaf | DocsNavSection;

export interface DocsNavGroup {
  title: string;
  href: string;
  children?: DocsNavChild[];
}

export const GITHUB_URL = "https://github.com/imrajmishraa/kanban-collab";

/** A leaf is a link; a section is only a heading. */
export const isSection = (child: DocsNavChild): child is DocsNavSection =>
  "children" in child;

export const DOCS_NAV: DocsNavGroup[] = [
  { title: "Introduction", href: "/docs" },
  {
    /* No `/docs/license` page: a page whose whole content is "here are the two
       pages below it" is a click tax, so the group opens onto its children and
       its own href points at the first of them. The duplicate that creates is
       dropped in `DOCS_PAGES` below. */
    title: "License",
    href: "/docs/license/activate",
    children: [
      { title: "Activate License", href: "/docs/license/activate" },
      { title: "Troubleshooting", href: "/docs/license/troubleshooting" },
    ],
  },
  { title: "Self-hosting", href: "/docs/self-hosting" },
  { title: "Custom boards", href: "/docs/custom-boards" },
  { title: "API Reference", href: "/docs/api" },
  {
    title: "Migration Tool",
    href: "/docs/migration",
    children: [
      { title: "Overview", href: "/docs/migration/overview" },
      { title: "Quick Start", href: "/docs/migration/quick-start" },
      { title: "Commands", href: "/docs/migration/commands" },
      { title: "Troubleshooting", href: "/docs/migration/troubleshooting" },
    ],
  },
  {
    title: "Realtime sync",
    href: "/docs/realtime",
    children: [
      { title: "Quick Start", href: "/docs/realtime/quick-start" },
      { title: "Presence", href: "/docs/realtime/presence" },
      { title: "Offline edits", href: "/docs/realtime/offline" },
    ],
  },
  {
    title: "Integrations",
    href: "/docs/integrations",
    children: [
      {
        title: "AI Agents",
        children: [
          { title: "MCP Server", href: "/docs/integrations/mcp" },
          { title: "Agent Skill", href: "/docs/integrations/skill" },
          { title: "Claude Code", href: "/docs/integrations/claude-code" },
          { title: "ChatGPT & Codex", href: "/docs/integrations/chatgpt" },
          { title: "Cursor", href: "/docs/integrations/cursor" },
        ],
      },
      {
        title: "Frameworks",
        children: [
          { title: "React", href: "/docs/integrations/react" },
          { title: "Vue", href: "/docs/integrations/vue" },
          { title: "Angular", href: "/docs/integrations/angular" },
          { title: "Svelte", href: "/docs/integrations/svelte" },
          { title: "SolidJS", href: "/docs/integrations/solid" },
          { title: "React Native", href: "/docs/integrations/react-native" },
        ],
      },
      {
        title: "Platforms",
        children: [
          { title: "Slack", href: "/docs/integrations/slack" },
          { title: "GitHub", href: "/docs/integrations/github" },
          { title: "Webhooks", href: "/docs/integrations/webhooks" },
        ],
      },
    ],
  },
  {
    title: "Features",
    href: "/docs/features",
    children: [
      { title: "Boards and columns", href: "/docs/features/boards" },
      { title: "Cards and checklists", href: "/docs/features/cards" },
      { title: "Comments", href: "/docs/features/comments" },
      { title: "Search", href: "/docs/features/search" },
    ],
  },
  {
    title: "Best Practice",
    href: "/docs/best-practice",
    children: [
      { title: "Team setup", href: "/docs/best-practice/team" },
      { title: "Card hygiene", href: "/docs/best-practice/cards" },
    ],
  },
  {
    title: "Troubleshooting",
    href: "/docs/troubleshooting",
    children: [
      { title: "Common Issues", href: "/docs/troubleshooting/common" },
    ],
  },
  {
    title: "FAQs",
    href: "/docs/faqs",
    children: [
      { title: "License Questions", href: "/docs/faqs/license" },
      { title: "Technical Support", href: "/docs/faqs/support" },
    ],
  },
  {
    title: "Changelog",
    href: "/docs/changelog",
    children: [
      { title: "Overview & Recent", href: "/docs/changelog" },
      { title: "Core Library", href: "/docs/changelog/core" },
      { title: "Packages", href: "/docs/changelog/packages" },
      { title: "Plugins", href: "/docs/changelog/plugins" },
    ],
  },
];

/* ── Reading order ────────────────────────────────────────────────────────
   Every page in the tree, flattened in the order the sidebar shows them. One
   list, three readers: the search index, the pagination at the foot of a page,
   and anything else that needs "the page after this one". Building it here
   means a page added to the tree is immediately reachable by all of them.
   ─────────────────────────────────────────────────────────────────────── */

export interface DocsPageEntry {
  title: string;
  href: string;
  /** The group it sits under, for anything that wants to show context. */
  group: string;
}

export const DOCS_PAGES: DocsPageEntry[] = DOCS_NAV.flatMap((group) => {
  const own: DocsPageEntry[] = [
    { title: group.title, href: group.href, group: group.title },
  ];

  const nested = (group.children ?? []).flatMap((child): DocsPageEntry[] => {
    if (isSection(child)) {
      return child.children.map((leaf) => ({
        title: leaf.title,
        href: leaf.href,
        group: group.title,
      }));
    }
    return [{ title: child.title, href: child.href, group: group.title }];
  });

  return [...own, ...nested];
}).filter(
  /* A group whose href is the same as its first child — the License group, which
     has no page of its own — would otherwise appear twice, and the previous/next
     footer would offer a page as its own neighbour. */
  (page, index, all) =>
    all.findIndex((other) => other.href === page.href) === index,
);
