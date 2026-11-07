import { useState } from "react";

import PageHero from "@/features/marketing/components/shared/PageHero";
import PageShell from "@/features/marketing/components/shared/PageShell";

/** Where feedback goes until there is an endpoint for it. */
const FEEDBACK_INBOX = "raj212558@gmail.com";

export default function FeedbackPage() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  /**
   * No API for this yet, so the form hands the text to the mail client rather
   * than pretending to have sent it. The confirmation line says so too.
   */
  const send = () => {
    const subject = encodeURIComponent("Kanban Collab feedback");
    const body = encodeURIComponent(
      `${message}\n\n— ${email || "no address given"}`,
    );

    window.location.href = `mailto:${FEEDBACK_INBOX}?subject=${subject}&body=${body}`;
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="Feedback"
        title="Tell us what is wrong"
        accentTitle="with the product, not the copy."
        lead="Bug reports, missing features, a screen that made no sense — all of it is useful, and all of it gets read."
      >
        <form
          className="mt-10 max-w-xl rounded-xl border border-(--hairline) bg-(--tint-3) p-5"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <label
            htmlFor="feedback-email"
            className="block font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)/70"
          >
            Your email
          </label>
          <input
            id="feedback-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@team.com"
            className="mt-2 h-10 w-full rounded-lg border border-(--hairline) bg-(--bg-root) px-3 text-[14px] text-(--text-primary) outline-hidden placeholder:text-(--text-subtle) focus:border-(--hairline-strong)"
          />

          <label
            htmlFor="feedback-message"
            className="mt-5 block font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)/70"
          >
            What happened
          </label>
          <textarea
            id="feedback-message"
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={6}
            placeholder="Which board, what you did, what you expected instead."
            className="mt-2 w-full resize-y rounded-lg border border-(--hairline) bg-(--bg-root) px-3 py-2.5 text-[14px] leading-6 text-(--text-primary) outline-hidden placeholder:text-(--text-subtle) focus:border-(--hairline-strong)"
          />

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="submit" className="m-btn">
              Open in mail
            </button>

            <p className="text-[13px] text-(--text-muted)">
              There is no feedback endpoint yet, so this opens your mail client
              with the text filled in.
            </p>
          </div>
        </form>
      </PageHero>
    </PageShell>
  );
}
