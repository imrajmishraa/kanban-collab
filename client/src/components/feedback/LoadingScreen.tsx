import "./loader.css";

import KanbanIcon from "@/assets/KanbanIcon";

/**
 * Which copy the splash shows.
 *
 * - `boot` — the app is coming up: the tagline.
 * - `auth` — a session is being restored / checked: the status line.
 */
export type LoadingPhase = "boot" | "auth";

const COPY: Record<LoadingPhase, string> = {
  boot: "Collaborate, Move Faster",
  auth: "Restoring session",
};

interface LoadingScreenProps {
  /** Picks the copy. Defaults to `boot`. Loses to `message` when that is set. */
  phase?: LoadingPhase;
  /**
   * Any other reason to hold the screen — a route chunk, an upload, an export.
   * Pass this instead of adding a phase.
   */
  message?: string;
  /** Turn off the idle breathing on the line. */
  pulse?: boolean;
}

/**
 * Boot splash. Mark and line blur-and-scale in on the same curve and offsets
 * the Indus splash uses; see loader.css for the numbers.
 *
 *   <LoadingScreen />                          → Collaborate, Move Faster
 *   <LoadingScreen phase="auth" />             → Restoring session
 *   <LoadingScreen message="Exporting…" />     → Exporting…
 *
 * Mounted once by `SplashHost`, which is what lets a phase change swap only the
 * line: the entrance belongs to the outer elements, and the text sits in its own
 * keyed span, so changing the copy re-runs the small fade and nothing else.
 */
export default function LoadingScreen({
  phase = "boot",
  message,
  pulse = true,
}: LoadingScreenProps) {
  const line = message ?? COPY[phase];

  return (
    <main
      role="status"
      aria-live="polite"
      aria-busy="true"
      /* An overlay, not a page: `SplashHost` renders it next to the router, so
         the app keeps mounting behind it and the splash has to sit on top of
         everything (drawers and dialogs stop at z-50). */
      className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-(--bg-root) text-(--text-primary)"
    >
      {/* Single soft top bloom — matches the forget-password panel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-2xl -translate-x-1/2 rounded-[50%] bg-(--brand)/4.5 blur-[150px]"
      />

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Mark + wordmark, the same lockup the sidebar and navbar use */}
        <div className="splash-mark flex items-center gap-2.5">
          <KanbanIcon size={28} variant="upper" />
          <span className="text-[22px] font-bold leading-none tracking-tight">
            Kanban
          </span>
        </div>

        {/* The outer element carries the entrance and the breathe; the keyed
            span inside carries the swap, so a phase change never touches the
            entrance above it. */}
        <p
          className={`text-[16px] font-normal text-(--text-secondary) ${
            pulse ? "splash-line" : "splash-line--still"
          }`}
        >
          <span key={line} className="splash-swap">
            <span className="splash-shine">{line}</span>
          </span>
        </p>
      </div>
    </main>
  );
}
