import { PageHero, PageShell, ProseSection } from "@/features/marketing";

/**
 * A template, not legal advice: it describes what this build actually does.
 * Have it checked before it goes public.
 */
export default function CookiesPage() {
  return (
    <PageShell>
      <PageHero
        title="Cookies policy"
        lead="What this site stores in your browser, and why. Short, because the list is short."
      />

      <ProseSection title="What we store">
        <p>
          One session cookie, set when you sign in, which keeps you signed in
          between pages. It is <code>httpOnly</code> and is not readable by
          JavaScript in the page.
        </p>
        <p>
          A theme preference, kept in <code>localStorage</code> rather than a
          cookie, so the page does not flash the wrong palette on load.
        </p>
      </ProseSection>

      <ProseSection title="What we do not use">
        <ul>
          <li>No advertising or tracking cookies.</li>
          <li>No third-party analytics script on any page.</li>
          <li>No fingerprinting, and no cross-site identifiers.</li>
        </ul>
      </ProseSection>

      <ProseSection title="If you self-host">
        <p>
          A self-hosted instance sets the same session cookie against your own
          domain. Nothing is sent to us, because there is nothing of ours in the
          path.
        </p>
      </ProseSection>

      <ProseSection title="Questions">
        <p>
          Write to <a href="mailto:raj212558@gmail.com">raj212558@gmail.com</a>{" "}
          and ask.
        </p>
      </ProseSection>
    </PageShell>
  );
}
