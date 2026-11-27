import { ui } from "@/features/boards";
import { BoardShell } from "./BoardShell";

export function BoardMessage({ title, body }: { title: string; body: string }) {
  return (
    <BoardShell>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className={[ui.panel, "max-w-md px-6 py-10 text-center"].join(" ")}
        >
          <span aria-hidden="true" className={ui.hairline} />
          <h1 className="font-mono text-[13px] font-semibold text-(--text-primary)">
            {title}
          </h1>
          <p className="mt-2 font-mono text-[11px] leading-5 text-(--text-secondary)">
            {body}
          </p>
        </div>
      </div>
    </BoardShell>
  );
}
