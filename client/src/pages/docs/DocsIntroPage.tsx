import { useEffect, useRef } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

import DocsCopyBtn from "@/components/docs/DocsCopyBtn";

import {
  BREADCRUMB,
  CODE,
  H1,
  H2,
  H3,
  LEAD,
  LINK,
  P,
  PRE,
  QUOTE,
  TABLE_WRAP,
  UL,
} from "./docsTypography";

/**
 * The Introduction — the only docs page for now.
 *
 * The type ramp comes from `docsTypography`, so every page added later matches
 * this one without being compared against it. Nothing here declares an id: the
 * layout slugs headings from their text and the table of contents builds itself.
 */

export default function DocsIntroPage() {
  /* The copy action reads the rendered page, so it needs the element the layout
     wraps this content in. */
  const contentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    contentRef.current = document.querySelector("article");
  }, []);

  return (
    <>
      <p className={BREADCRUMB}>Introduction</p>

      {/* No `flex-wrap`. With it, a long title took the whole row on a phone and
          pushed the copy button onto a line of its own, hanging off the left
          edge under the title. Kept on one row, with `min-w-0` on the heading so
          it is the title that wraps and the button stays at the top right, the
          way the reference does it. */}
      <div className="mt-3 flex items-start justify-between gap-3">
        <h1 className={`min-w-0 ${H1}`}>Introduction to Kanban</h1>

        <DocsCopyBtn contentRef={contentRef} />
      </div>

      <p className={LEAD}>
        Kanban Collab is a real-time kanban board you can run yourself. Boards,
        columns and cards are the surface; underneath is a CRDT that keeps every
        open client in step, so two people dragging the same card never fight
        over it. Everything is open source and ships with one command: the
        client, the API, Mongo and Redis.
      </p>

      <p className={P}>
        It is built for small teams who want a board without a per-seat bill,
        and for developers who would rather read the code than trust a
        changelog. If that is you, the{" "}
        <a href="/docs/self-hosting" className={LINK}>
          self-hosting guide
        </a>{" "}
        gets you running in about ten minutes.
      </p>

      <h2 className={H2}>Key Features</h2>

      <h3 className={H3}>Free Version</h3>

      <ul className={UL}>
        <li>Unlimited boards, columns and cards</li>
        <li>
          Real-time sync over WebSockets, with offline edits reconciled by Yjs
        </li>
        <li>
          Search across boards, cards and comments from{" "}
          <kbd className="rounded border border-(--hairline) px-1.5 py-0.5 text-[15px]">
            ⌘K
          </kbd>
        </li>
        <li>
          MIT licensed: run it, fork it, redistribute it — see{" "}
          <a href="/docs/license" className={LINK}>
            License
          </a>
        </li>
      </ul>

      <h3 className={H3}>What you get on your own machine</h3>

      <ul className={UL}>
        <li>Boards, columns and cards with drag and drop</li>
        <li>
          Card details: description, labels, checklist, comments, attachments
        </li>
        <li>A command palette that searches boards, cards and people</li>
        <li>Every change stored with the user who made it and when</li>
      </ul>

      <h2 className={H2}>Quick Start</h2>

      <p className={P}>
        The repo ships a compose file with the client, the API, Mongo and Redis
        wired together. Clone it, copy the example env, and bring it up:
      </p>

      <pre className={PRE}>
        <code>{`git clone https://github.com/imrajmishraa/kanban-collab
cd kanban-collab
cp .env.example .env
docker compose up --build`}</code>
      </pre>

      <p className={P}>
        The client comes up on <code className={CODE}>localhost:5173</code> and
        the API on <code className={CODE}>localhost:3000</code>. Nothing else is
        required — no accounts, no keys, no cloud services.
      </p>

      <h2 className={H2}>Core Concepts</h2>

      <h3 className={H3}>Boards</h3>

      <p className={P}>
        A board belongs to a workspace and holds an ordered list of columns.
        Membership is per workspace, so a board is visible to everyone in it
        unless it is moved. Boards can be archived; archiving keeps the cards
        and takes the board out of everyone&apos;s sidebar.
      </p>

      <h3 className={H3}>Columns</h3>

      <p className={P}>
        Columns are the stages work moves through. They can be renamed,
        reordered and given a card limit. A limit is a warning, not a wall: the
        column tints when it is over, and the card still drops.
      </p>

      <h3 className={H3}>Cards</h3>

      <p className={P}>
        A card is the unit of work. It carries a title, a description, labels, a
        checklist, comments, attachments and an assignee. Everything about a
        card lives on the card, which is why the detail panel is the whole story
        of that piece of work rather than a form that scatters fields across
        screens.
      </p>

      <h3 className={H3}>Comments</h3>

      <p className={P}>
        Comments are per card and per thread, with mentions that resolve against
        workspace members. They are stored as their own documents rather than
        inside the card, so a busy card does not rewrite itself on every reply.
      </p>

      <h2 className={H2}>How Sync Works</h2>

      <h3 className={H3}>Presence</h3>

      <p className={P}>
        Every open client holds a WebSocket to the API and announces which board
        it is looking at. That is what draws the avatars in the header and the
        cursor labels when someone else is dragging.
      </p>

      <h3 className={H3}>Offline edits</h3>

      <p className={P}>
        Edits are applied locally first and queued as CRDT operations. When the
        connection returns the queue is merged, not replayed, so two people who
        moved the same card while offline end up with one card in one place
        rather than two versions of the board.
      </p>

      <blockquote className={QUOTE}>
        Ready to try it? Open a board and drag something —{" "}
        <a href="/workspaces" className={LINK}>
          the live app
        </a>{" "}
        is the same build as the repo.
      </blockquote>

      <h2 className={H2}>Architecture</h2>

      <p className={P}>
        Four processes, no hidden services. Everything below runs from the same
        compose file you used in the quick start.
      </p>

      <div className={TABLE_WRAP}>
        <table className="w-full border-collapse text-left text-[15px]">
          <thead>
            <tr className="border-b border-(--hairline) text-(--text-primary)">
              <th className="px-4 py-3 font-semibold">Service</th>
              <th className="px-4 py-3 font-semibold">What it does</th>
              <th className="px-4 py-3 font-semibold">Port</th>
            </tr>
          </thead>
          <tbody className="text-(--text-secondary)">
            {[
              ["client", "React app, Vite dev server", "5173"],
              ["server", "API, WebSocket, auth", "3000"],
              ["mongo", "Boards, cards, users", "27017"],
              ["redis", "Sessions and presence", "6379"],
            ].map(([service, what, port]) => (
              <tr
                key={service}
                className="border-b border-(--hairline) last:border-0"
              >
                <td className="px-4 py-3 font-mono text-[14px] text-(--text-primary)">
                  {service}
                </td>
                <td className="px-4 py-3">{what}</td>
                <td className="px-4 py-3 font-mono text-[14px]">{port}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className={H2}>Self-hosting</h2>

      <h3 className={H3}>Environment</h3>

      <p className={P}>
        The example env is enough to run locally. For anything public, change
        the session secret and the database URL before the first boot — the
        defaults are deliberately obvious so they cannot survive a deploy by
        accident.
      </p>

      <pre className={PRE}>
        <code>{`DATABASE_URL=mongodb://mongo:27017/kanban
REDIS_URL=redis://redis:6379
SESSION_SECRET=change-me-before-you-deploy
CLIENT_ORIGIN=http://localhost:5173`}</code>
      </pre>

      <h3 className={H3}>Updating</h3>

      <p className={P}>
        Pull, rebuild, and the migrations run on boot. There is no separate
        migration step to remember, and no downtime beyond the restart itself.
      </p>

      <h2 className={H2}>How to Use Kanban Collab</h2>

      <p className={P}>
        Create a workspace, add a board, and the three default columns are
        waiting. Cards can hold a description, labels, a checklist, comments and
        attachments. Everything is stored against the card, so a card detail
        panel is the whole story of that piece of work.
      </p>

      <a
        href="/docs/self-hosting"
        className={`mt-6 inline-flex items-center gap-1.5 text-[17px] font-medium ${LINK}`}
      >
        Read the self-hosting guide
        <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} strokeWidth={2} />
      </a>

      <h2 className={H2}>Integrations</h2>

      <ul className={UL}>
        <li>
          <a href="/docs/integrations/slack" className={LINK}>
            Slack
          </a>{" "}
          — post a card, close a card, and get a digest per board.
        </li>
        <li>
          <a href="/docs/integrations/github" className={LINK}>
            GitHub
          </a>{" "}
          — link a branch to a card and move it when the pull request merges.
        </li>
        <li>
          <a href="/docs/integrations/webhooks" className={LINK}>
            Webhooks
          </a>{" "}
          — every card change as a signed POST.
        </li>
      </ul>

      <h2 className={H2}>Help &amp; Support</h2>

      <p className={P}>
        Bugs and feature requests go to the{" "}
        <a
          href="https://github.com/imrajmishraa/kanban-collab/issues"
          className={LINK}
        >
          issue tracker
        </a>
        . Setup questions usually have an answer on the troubleshooting page; if
        not, an issue will end up there.
      </p>

      <p className={P}>
        If you would rather ask a person, the discussion tab on the repo is the
        fastest route — it is read daily, and anything that turns into a bug
        gets moved into an issue from there.
      </p>
    </>
  );
}
