import { useState } from "react";

import { Toaster } from "@/components/toaster/Toaster";

import { LabControls } from "./LabControls";
import { LabTriggers } from "./LabTriggers";
import {
  LAB_DEFAULTS,
  snippet,
  toToasterProps,
  type LabConfig,
} from "./labConfig";

/**
 * Every axis of `components/toaster`, live.
 *
 * The stack here is mounted with `id="lab"`, and every call in `LabTriggers`
 * carries `toasterId: "lab"`, so nothing fired here reaches the app's own toasts
 * — two stacks on one screen is what the `id` axis is for.
 *
 * Presets *fill the controls* rather than being passed through: the toaster is
 * always built from what the panel says, so the panel can never lie about the
 * thing on screen.
 *
 * Reached at `/lab/toasts` in a dev build. The route is spread into
 * `app/router.tsx` behind `import.meta.env.DEV`, so it is not in a production
 * bundle.
 */
export default function ToasterLabPage() {
  const [config, setConfig] = useState<LabConfig>(LAB_DEFAULTS);

  return (
    <div className="min-h-dvh bg-(--bg-root) text-(--text-primary)">
      <header className="mx-auto max-w-6xl px-4 pt-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-subtle)">
          lab / toasts
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          Toaster lab
        </h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-6 text-(--text-muted)">
          The stack on this page is mounted with{" "}
          <code className="font-mono text-[12px]">id=&quot;lab&quot;</code>, so
          nothing here reaches the app&apos;s own toasts. Presets fill the
          controls; the toaster is always built from what the controls say.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-(--hairline) bg-(--bg-card) p-3 font-mono text-[11px] leading-5 text-(--text-secondary)">
          {snippet(config)}
        </pre>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-4 md:grid-cols-2">
        <LabControls config={config} onChange={setConfig} />
        <LabTriggers />
      </main>

      <Toaster id="lab" {...toToasterProps(config)} />
    </div>
  );
}
