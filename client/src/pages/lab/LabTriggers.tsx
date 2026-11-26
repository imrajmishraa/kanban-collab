import { useCallback, useEffect, useRef } from "react";

import {
  dismissToast,
  toastError,
  toastInfo,
  toastLoading,
  toastPromise,
  toastSuccess,
  toastWarning,
} from "@/lib/toast";

import { TONES } from "./labConfig";

/**
 * The firing half of the lab: one button per per-toast attribute.
 *
 * These are the things a `Toaster` prop cannot reach — kind, description, an id
 * that replaces instead of stacking, an action, a cancel, a promise. Each
 * carries `toasterId: "lab"`, so what it fires lands in the lab's own stack and
 * never in the app's.
 *
 * The handlers live in one `useCallback` and the refs are touched only inside
 * it: reading a ref while rendering is what `react-hooks/refs` exists to stop.
 */

const LAB_ID = "lab";

const FOCUS =
  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--tint-15)";

type TriggerId =
  | "success"
  | "described"
  | "info"
  | "warning"
  | "error"
  | "auth"
  | "copy"
  | "desc-tone"
  | "delayed"
  | "long"
  | "replace"
  | "promise-ok"
  | "promise-fail"
  | "action"
  | "cancel"
  | "tones"
  | "kinds";

/** Static: label and note never depend on state, so they are not rebuilt per render. */
const TRIGGERS: Array<{ id: TriggerId; label: string; note: string }> = [
  { id: "success", label: "Success", note: "message only — 3s" },
  {
    id: "described",
    label: "Success + description",
    note: "two lines, second muted",
  },
  { id: "info", label: "Info", note: "neutral surface, 4s" },
  { id: "warning", label: "Warning", note: "4s" },
  { id: "error", label: "Error", note: "6s — read it, then act" },
  { id: "auth", label: "Auth tone", note: "per-toast surface, 2.5s" },
  { id: "copy", label: "With copy", note: "copyValue → a Copy button" },
  { id: "delayed", label: "Delayed", note: "arrives 600ms late" },
  {
    id: "long",
    label: "Long description",
    note: "what Description lines clamps",
  },
  {
    id: "desc-tone",
    label: "Description tone",
    note: "one warning line in a neutral toast",
  },
  {
    id: "replace",
    label: "Loading → saved",
    note: "one id, replaced in place",
  },
  { id: "promise-ok", label: "Promise (resolves)", note: "loading → success" },
  {
    id: "promise-fail",
    label: "Promise (rejects)",
    note: "loading → error, no orphan spinner",
  },
  { id: "action", label: "With undo", note: "action, 44px on touch" },
  { id: "cancel", label: "With cancel", note: "the quieter second button" },
  {
    id: "tones",
    label: "One of each tone",
    note: "six surfaces — raise Visible toasts first",
  },
  {
    id: "kinds",
    label: "One of each kind",
    note: "success, info, warning, error",
  },
];

export function LabTriggers() {
  const timers = useRef<number[]>([]);
  const fired = useRef<Array<string | number>>([]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const run = useCallback((id: TriggerId) => {
    const opts = { toasterId: LAB_ID };
    const later = (ms: number, then: () => void) =>
      timers.current.push(window.setTimeout(then, ms));
    /* `toastPromise` can hand back a handle rather than an id, and only ids are
       dismissable. */
    const remember = (toastId: unknown) => {
      if (typeof toastId === "string" || typeof toastId === "number")
        fired.current.push(toastId);
    };

    switch (id) {
      case "success":
        remember(toastSuccess("Board saved", undefined, opts));
        return;
      case "described":
        remember(
          toastSuccess("Board saved", "Twelve cards moved to Done.", opts),
        );
        return;
      case "info":
        remember(toastInfo("Synced", "You are up to date.", opts));
        return;
      case "warning":
        remember(toastWarning("Slow connection", "Retrying in 5s.", opts));
        return;
      case "error":
        remember(
          toastError(new Error("Could not reach the server"), undefined, opts),
        );
        return;
      case "auth":
        remember(
          toastSuccess("Logged in", "Taking you to your workspaces.", {
            ...opts,
            tone: "auth",
          }),
        );
        return;
      case "copy":
        remember(
          toastInfo("Invite link ready", "Anyone with the link can open it.", {
            ...opts,
            copyValue: "https://kanban-collab.app/b/lab-demo",
          }),
        );
        return;
      case "desc-tone":
        remember(
          toastInfo("Synced", "One card could not be saved.", {
            ...opts,
            descriptionTone: "danger",
          }),
        );
        return;
      case "delayed":
        remember(
          toastInfo("Delayed", "Only appeared after 600ms.", {
            ...opts,
            delay: 600,
          }),
        );
        return;
      case "long":
        remember(
          toastInfo(
            "Export finished",
            "Twelve boards, four hundred and six cards and their comments were written to a single archive, which is now ready to download from the exports page.",
            opts,
          ),
        );
        return;
      case "replace":
        remember(toastLoading("Saving…", { ...opts, id: "lab-save" }));
        later(1200, () =>
          toastSuccess("Saved", "The board is up to date.", {
            ...opts,
            id: "lab-save",
          }),
        );
        return;
      case "promise-ok":
        remember(
          toastPromise(
            new Promise<string>((resolve) => later(1500, () => resolve("ok"))),
            {
              loading: "Inviting…",
              success: "Invitation sent",
              error: "Could not send the invitation",
            },
            opts,
          ),
        );
        return;
      case "promise-fail":
        remember(
          toastPromise(
            new Promise<string>((_, reject) =>
              later(1500, () => reject(new Error("Export failed"))),
            ),
            {
              loading: "Exporting…",
              success: "Export ready",
              error: "Export failed",
            },
            opts,
          ),
        );
        return;
      case "action":
        remember(
          toastSuccess("Board deleted", "Design sprint", {
            ...opts,
            action: {
              label: "Undo",
              onClick: () =>
                toastInfo("Board restored", undefined, {
                  ...opts,
                  id: "lab-undo",
                }),
            },
          }),
        );
        return;
      case "cancel":
        remember(
          toastWarning("Archive this board?", "You can restore it later.", {
            ...opts,
            id: "lab-archive",
            cancel: {
              label: "Keep",
              onClick: () => dismissToast("lab-archive"),
            },
          }),
        );
        return;
      case "tones":
        TONES.forEach((tone) =>
          remember(
            toastInfo(`tone: ${tone}`, "Same stack, different surface.", {
              ...opts,
              tone,
            }),
          ),
        );
        return;
      case "kinds":
        remember(toastSuccess("Success", undefined, opts));
        remember(toastInfo("Info", undefined, opts));
        remember(toastWarning("Warning", undefined, opts));
        remember(toastError(new Error("Error"), undefined, opts));
        return;
    }
  }, []);

  const dismissAll = useCallback(() => {
    fired.current.forEach((toastId) => dismissToast(toastId));
    fired.current = [];
  }, []);

  return (
    <section className="rounded-xl border border-(--hairline) bg-(--bg-surface) p-4">
      <h2 className="text-[13px] font-semibold">Fire</h2>
      <p className="mt-1 text-[12px] leading-5 text-(--text-muted)">
        One per attribute the stack cannot carry: kind, description, id, action,
        cancel, promise.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {TRIGGERS.map((trigger) => (
          <button
            key={trigger.id}
            type="button"
            onClick={() => run(trigger.id)}
            className={`flex min-h-11 w-full flex-col items-start justify-center rounded-md border border-(--hairline) bg-(--bg-elevated) px-3 py-2 text-left transition-colors hover:bg-(--tint-8) ${FOCUS}`}
          >
            <span className="text-[12px] font-medium">{trigger.label}</span>
            <span className="text-[11px] leading-4 text-(--text-muted)">
              {trigger.note}
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={dismissAll}
          className={`flex min-h-11 w-full items-center justify-center rounded-md border border-(--hairline) bg-(--tint-4) px-3 text-[12px] font-medium text-(--text-secondary) transition-colors hover:bg-(--tint-8) ${FOCUS}`}
        >
          Dismiss everything fired here
        </button>
      </div>
    </section>
  );
}
