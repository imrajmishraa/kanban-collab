import PageHero from "@/features/marketing/components/shared/PageHero";
import PageShell from "@/features/marketing/components/shared/PageShell";
import ProseSection from "@/features/marketing/components/shared/ProseSection";

/**
 * A template, not legal advice. It describes the terms this build is meant to
 * ship under; have a lawyer read it before it goes public.
 */
export default function TermsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        lead="The short version: the software is open source, your data is yours, and we are not liable for how you run it."
      />

      <ProseSection title="Using the service">
        <p>
          You may use Kanban Collab for any lawful purpose. You are responsible
          for the content you put on a board and for who you invite to it.
        </p>
        <p>
          Do not use a hosted instance to store material you have no right to
          store, or to attack the service or other users of it.
        </p>
      </ProseSection>

      <ProseSection title="Your data">
        <p>
          Your boards, cards and comments belong to you. We claim no licence
          over them beyond what is needed to store and serve them back to you.
        </p>
        <p>
          On a self-hosted instance the data never reaches us at all — it lives
          in the database you pointed the API at.
        </p>
      </ProseSection>

      <ProseSection title="Availability">
        <p>
          A hosted instance is offered as-is, with no uptime guarantee. The
          software itself is open source, so if availability matters to you, run
          it yourself.
        </p>
      </ProseSection>

      <ProseSection title="Ending it">
        <p>
          You can stop using the service at any time and export your data. We
          may suspend an account that is being used to break these terms.
        </p>
      </ProseSection>

      <ProseSection title="Contact">
        <p>
          Questions about these terms:{" "}
          <a href="mailto:raj212558@gmail.com">raj212558@gmail.com</a>.
        </p>
      </ProseSection>
    </PageShell>
  );
}
