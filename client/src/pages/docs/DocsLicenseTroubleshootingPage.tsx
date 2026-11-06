import { useEffect, useRef } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  ArrowUpRight01Icon,
} from "@hugeicons/core-free-icons";

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
  QUOTE,
  UL,
} from "./docsTypography";

/**
 * License Troubleshooting — the second page under the License group.
 *
 * Written as the questions that actually arrive, in the order they arrive:
 * a key that will not take, a key that is already used, a key that cannot be
 * found, and the case where someone has no key and thinks they need one.
 */

export default function DocsLicenseTroubleshootingPage() {
  const contentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    contentRef.current = document.querySelector("article");
  }, []);

  return (
    <>
      <div className="flex">
        <p className={BREADCRUMB}>License</p>
        <div className="mx-1 mt-1 text-(--text-muted)">
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={15}
            strokeWidth={1.6}
            aria-hidden="true"
          />
        </div>
        <p className={"text-[14px] text-(--text-primary)"}>Troubleshooting</p>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <h1 className={`min-w-0 ${H1}`}>License Troubleshooting</h1>

        <DocsCopyBtn contentRef={contentRef} />
      </div>

      <p className={LEAD}>
        Almost every licence problem is one of four things. Work down the list —
        the first two cover most of the reports we get.
      </p>

      <h2 className={H2}>The self-hosted build is asking for a key</h2>

      <p className={P}>
        It should not, and it does not need one. That prompt means the client in
        the browser is the hosted build talking to our API, not yours.
      </p>

      <h3 className={H3}>Check where the client is pointing</h3>

      <p className={P}>
        The API base URL is baked in at build time. If it is missing, the client
        falls back to ours:
      </p>

      <pre className="mt-5 overflow-x-auto rounded-xl border border-(--hairline) bg-(--bg-surface) p-4 font-mono text-[14px] leading-[1.7] text-(--text-secondary)">
        <code>{`VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000`}</code>
      </pre>

      <p className={P}>
        Set both in <span className={CODE}>.env</span>, rebuild the client, and
        the prompt goes away. Vite reads these at build time, so a restart of
        the dev server is not enough — the client has to be rebuilt.
      </p>

      <h2 className={H2}>The key is rejected</h2>

      <ul className={UL}>
        <li>
          <strong className="text-(--text-primary)">Whitespace</strong> — copy
          the key again from the email. A trailing space from a wrapped line is
          the most common cause.
        </li>
        <li>
          <strong className="text-(--text-primary)">Wrong prefix</strong> — a
          key starts with <span className={CODE}>kb_live_</span> or{" "}
          <span className={CODE}>kb_test_</span>. A test key will not activate a
          live workspace.
        </li>
        <li>
          <strong className="text-(--text-primary)">Expired</strong> — keys are
          valid for the billing period they were issued for. An unpaid invoice
          suspends the key, not the data.
        </li>
      </ul>

      <h2 className={H2}>The key is already in use</h2>

      <p className={P}>
        A key belongs to one workspace. If it was redeemed on a workspace that
        was deleted, it is released automatically after thirty days; before
        that, an owner can release it from{" "}
        <span className={CODE}>Settings → Billing</span> on the old workspace.
      </p>

      <h3 className={H3}>Moving a key to another workspace</h3>

      <p className={P}>
        Release it first, then redeem it in the new workspace. There is no
        transfer step, and nothing is lost — the data stays with the workspace
        it was created in, not with the key.
      </p>

      <h2 className={H2}>The email with the key is gone</h2>

      <p className={P}>
        Any owner of the workspace can see the key again on the billing page.
        Nobody else can, which is deliberate: the key is a payment credential,
        and it should not be readable by everyone in a shared workspace.
      </p>

      <blockquote className={QUOTE}>
        If you have no access to billing and no email, the answer is the person
        who paid. There is no support route that reveals a key to someone who
        cannot see the workspace&apos;s billing page.
      </blockquote>

      <h2 className={H2}>Still stuck</h2>

      <p className={P}>
        Open an issue with the workspace id and what the screen said — never the
        key itself. Keys pasted into issues are treated as compromised and
        revoked.
      </p>

      <a
        href="https://github.com/imrajmishraa/kanban-collab/issues"
        className={`mt-6 inline-flex items-center gap-1.5 text-[17px] font-medium ${LINK}`}
      >
        Open an issue
        <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} strokeWidth={2} />
      </a>
    </>
  );
}
