import { useEffect, useRef } from "react";

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
  UL,
} from "./docsTypography";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

/**
 * Activate License — the first page under the License group.
 *
 * There is no License landing page on purpose: a page whose whole content is
 * "here are the two pages below it" is a click tax. The group opens straight
 * onto its children.
 */

export default function DocsActivateLicensePage() {
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
        <p className={"text-[14px] text-(--text-primary)"}>Activate License</p>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h1 className={`min-w-0 ${H1}`}>Activate License</h1>

        <DocsCopyBtn contentRef={contentRef} />
      </div>
      <p className={LEAD}>
        A self-hosted install has nothing to activate. Every feature is on from
        the first boot, because the build you run and the build in the repo are
        the same build — there is no locked code waiting for a key.
      </p>
      <p className={P}>
        Keys exist for hosted workspaces, where they identify a paid
        subscription to our servers. If you are running your own copy, skip this
        page: it does not apply to you and nothing is missing.
      </p>
      <h2 className={H2}>Activating a hosted workspace</h2>
      <p className={P}>
        Sign in, open the workspace, and use{" "}
        <span className={CODE}>Settings → Billing → Redeem key</span>. The key
        is checked once, against our API, and the workspace is marked active. No
        other screen changes.
      </p>
      <h3 className={H3}>What the key unlocks</h3>
      <ul className={UL}>
        <li>
          Hosted storage for the workspace, so you do not run Mongo yourself
        </li>
        <li>Managed backups and a longer change history</li>
        <li>Priority support on the workspace&apos;s tickets</li>
      </ul>
      <h3 className={H3}>What it does not do</h3>
      <ul className={UL}>
        <li>It does not unlock features in the self-hosted client</li>
        <li>
          It does not expire your data if it lapses — the workspace stays
          readable
        </li>
        <li>It is not tied to a person, only to the workspace</li>
      </ul>
      <h2 className={H2}>Where keys come from</h2>
      <p className={P}>
        A key is issued when a hosted subscription starts, and it arrives by
        email to the address that paid. If the email is gone, the billing page
        in the workspace can show the key again to an owner.
      </p>
      <pre className={PRE}>
        <code>{`# a hosted key looks like this
kb_live_7f3c9a2e-4b81-4d0f-9e6a-2c5d1b8a7e34`}</code>
      </pre>
      <h2 className={H2}>Self-hosted installs</h2>
      <p className={P}>
        Nothing to paste, nothing to phone home. The client never calls a
        licence server, which also means it keeps working with no network — and
        that it cannot be revoked remotely, by us or anyone else.
      </p>
      <p className={P}>
        If a screen is asking for a key on a machine you own, you are running
        the hosted client against your own API. Point the client at your server
        with <span className={CODE}>VITE_API_URL</span> and the prompt goes
        away. See the{" "}
        <a href="/docs/license/troubleshooting" className={LINK}>
          licence troubleshooting
        </a>{" "}
        page if it does not.
      </p>
    </>
  );
}
