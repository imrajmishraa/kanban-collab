import { PageHero, PageShell, ProseSection } from "@/features/marketing";

/**
 * A template, not legal advice: it describes what this build collects, which is
 * deliberately close to nothing.
 */
export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHero
        title="Privacy policy"
        lead="What we collect, why, and how to get it back or have it deleted."
      />

      <ProseSection title="What we collect">
        <ul>
          <li>
            Your name and email, so an account can exist and be signed into.
          </li>
          <li>
            The boards, cards and comments you create — that is the product.
          </li>
          <li>Basic request logs, kept short, for debugging failures.</li>
        </ul>
      </ProseSection>

      <ProseSection title="What we do not do">
        <p>
          No advertising, no profiling, no selling data, and no third-party
          analytics on the product itself. There is no tracker in the client
          that phones home.
        </p>
      </ProseSection>

      <ProseSection title="Where it lives">
        <p>
          On a hosted instance, in the Mongo database that instance runs. On a
          self-hosted one, in the database you configured — in which case we
          hold none of it.
        </p>
      </ProseSection>

      <ProseSection title="Your rights">
        <p>
          You can ask for a copy of your data or for the account to be deleted.
          Both requests go to{" "}
          <a href="mailto:raj212558@gmail.com">raj212558@gmail.com</a> and are
          handled by hand.
        </p>
      </ProseSection>
    </PageShell>
  );
}
