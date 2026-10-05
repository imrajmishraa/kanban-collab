import { ENV } from "../../config/env";
import { emailLogger } from "../logging/childLogger";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailTransport {
  readonly provider: string;
  send(message: EmailMessage): Promise<void>;
}

/**
 * Console transport — the default (`EMAIL_PROVIDER=console`). Emits the full
 * message to the delivery log so digests are observable in dev and tests
 * without any provider credentials.
 */
class ConsoleEmailTransport implements EmailTransport {
  readonly provider = "console";

  async send(message: EmailMessage): Promise<void> {
    emailLogger.info(
      {
        to: message.to,
        subject: message.subject,
        body: message.text,
      },
      "Email sent via console transport.",
    );
  }
}

/**
 * Documented seam for real providers.
 *
 * No SMTP/SES client is installed (see the T18 note in the P2 README), so these
 * transports log a warning and resolve rather than throwing — a missing email
 * provider must never fail the cron job that produced the message. Swap this
 * class body for the real client when credentials and an SDK are available.
 */
class UnconfiguredEmailTransport implements EmailTransport {
  readonly provider: string;

  constructor(provider: string) {
    this.provider = provider;
  }

  async send(message: EmailMessage): Promise<void> {
    emailLogger.warn(
      {
        provider: this.provider,
        to: message.to,
        subject: message.subject,
      },
      "Email provider not wired — message dropped (documented seam).",
    );
  }
}

function createTransport(): EmailTransport {
  switch (ENV.EMAIL_PROVIDER) {
    case "smtp":
      return new UnconfiguredEmailTransport("smtp");
    case "ses":
      return new UnconfiguredEmailTransport("ses");
    default:
      return new ConsoleEmailTransport();
  }
}

export const emailTransport: EmailTransport = createTransport();
