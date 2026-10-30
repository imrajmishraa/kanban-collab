import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

import type { AuthUser } from "@/types/api/auth/auth";

interface FeedbackDialogProps {
  onClose: () => void;
  /** Used only to prefill the reply address. */
  user: AuthUser | null;
}

type Kind = "bug" | "idea" | "other";

/* ChaiUI's segmented control: one row, dividers, and the active segment in
   the dark brown fill, which is the one place orange is allowed to fill. */
const KINDS: Array<{ value: Kind; label: string }> = [
  { value: "bug", label: "Something broke" },
  { value: "idea", label: "An idea" },
  { value: "other", label: "Something else" },
];

const MAX_LENGTH = 1000;

/**
 * Feedback form, built to the ChaiUI dialog recipe: a frosted backdrop, a
 * rounded card with no shadow, a title and one line of description, the body,
 * then one solid action beside a mirrored outline.
 *
 * The submit is a stub for now. It records nothing and shows a confirmation,
 * so the flow is settled before the endpoint exists. To wire it up, replace
 * the body of `submit` with the mutation; `kind`, `message` and `email` are
 * the payload.
 */
export default function FeedbackDialog({ onClose, user }: FeedbackDialogProps) {
  const [kind, setKind] = useState<Kind>("bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [sent, setSent] = useState(false);

  const messageRef = useRef<HTMLTextAreaElement>(null);
  const titleId = "feedback-dialog-title";
  const bodyId = "feedback-dialog-body";

  /* Focus the thing you came to type in. */
  useEffect(() => {
    messageRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const submit = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    /* TODO: send { kind, message: trimmed, email } once the endpoint exists. */
    setSent(true);
  };

  const canSend = message.trim().length > 0;

  return createPortal(
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="w-full max-w-md rounded-2xl border border-orange-50/15 bg-(--bg-elevated) p-6 text-(--text-primary)"
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="text-base font-medium tracking-tight text-neutral-100"
            >
              {sent ? "Thanks for the note" : "Send feedback"}
            </h2>
            <p
              id={bodyId}
              className="mt-1.5 text-sm leading-6 text-neutral-400"
            >
              {sent
                ? "We read every one. Nothing else to do here."
                : "Tell us what broke, or what you would like to see next."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors duration-200 hover:bg-white/6 hover:text-neutral-200 motion-reduce:transition-none"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={15} strokeWidth={1.7} />
          </button>
        </div>

        {sent ? (
          <>
            <div className="mt-6 flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-orange-50/20 text-orange-100">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={16}
                  strokeWidth={1.7}
                />
              </span>
              <p className="text-sm leading-6 text-neutral-400">
                Your note is queued for the team. If you left a reply address,
                that is where an answer will go.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-none rounded-tr-lg rounded-bl-lg bg-white px-4 text-sm font-medium text-neutral-900 transition-colors duration-200 hover:bg-neutral-200 motion-reduce:transition-none"
              >
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Segmented: the active segment is the one allowed orange fill. */}
            <div
              role="group"
              aria-label="What kind of feedback"
              className="mt-5 flex overflow-hidden rounded-md border border-orange-50/15"
            >
              {KINDS.map((entry, index) => {
                const active = entry.value === kind;

                return (
                  <button
                    key={entry.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setKind(entry.value)}
                    className={[
                      "h-8 flex-1 cursor-pointer px-2 text-[12px] font-medium tracking-tight",
                      "transition-colors duration-200 motion-reduce:transition-none",
                      index > 0 ? "border-l border-orange-50/15" : "",
                      active
                        ? "bg-orange-900/40 text-orange-100"
                        : "text-neutral-400 hover:text-neutral-200",
                    ].join(" ")}
                  >
                    {entry.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-4">
              <label
                htmlFor="feedback-message"
                className="block text-sm font-medium text-neutral-200"
              >
                Your note
              </label>
              <textarea
                id="feedback-message"
                ref={messageRef}
                value={message}
                maxLength={MAX_LENGTH}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="What happened, and where?"
                className="mt-2 min-h-28 w-full resize-none rounded-lg border border-orange-50/15 bg-transparent px-3 py-2 text-sm leading-6 text-neutral-100 placeholder:text-neutral-600 outline-hidden transition-colors duration-200 focus:border-orange-50/30 motion-reduce:transition-none"
              />
              <p className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-500">
                <span>Keep it to what you saw, and where.</span>
                <span className="font-mono tabular-nums">
                  {message.length}/{MAX_LENGTH}
                </span>
              </p>
            </div>

            <div className="mt-4">
              <label
                htmlFor="feedback-email"
                className="block text-sm font-medium text-neutral-200"
              >
                Reply to
              </label>
              <input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 h-9 w-full rounded-lg border border-orange-50/15 bg-transparent px-3 text-sm text-neutral-100 placeholder:text-neutral-600 outline-hidden transition-colors duration-200 focus:border-orange-50/30 motion-reduce:transition-none"
              />
              <p className="mt-1.5 text-[11px] text-neutral-500">
                Leave it blank if you would rather not be answered.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-none rounded-tl-lg rounded-br-lg border border-orange-50/20 bg-transparent px-4 text-sm font-medium text-neutral-200 transition-colors duration-200 hover:bg-white/4 motion-reduce:transition-none"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submit}
                disabled={!canSend}
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-none rounded-tr-lg rounded-bl-lg bg-white px-4 text-sm font-medium text-neutral-900 transition-colors duration-200 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-neutral-500 motion-reduce:transition-none"
              >
                Send
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  size={16}
                  strokeWidth={1.7}
                  aria-hidden="true"
                  className="-ml-1"
                />
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
