import { FlowNode } from "@components/ui/marketing/howItWorks/FlowNode";
import { SharedBoardPreview } from "@components/ui/marketing/howItWorks/SharedBoardPreview";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Radio,
  RefreshCw,
  Users,
} from "lucide-react";

export default function CollaborationFlowSection() {
  return (
    <section className="border-b border-neutral-800 bg-[#080808] px-4 py-24 text-neutral-100 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="font-mono text-[10px] text-rose-500">04</span>

            <span className="h-px w-6 bg-neutral-800" />

            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
              Collaboration flow
            </span>
          </div>

          <h2 className="font-mono text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            One shared state.
            <br />
            <span className="text-neutral-500">Everyone stays in sync.</span>
          </h2>

          <p className="mt-5 max-w-xl font-mono text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
            When someone changes the board, that change is propagated through
            the collaboration layer and reflected across connected clients.
          </p>
        </div>

        {/* Collaboration flow */}
        <div className="mt-14 border border-neutral-800 bg-[#0c0c0c]">
          {/* Status bar */}
          <div className="flex flex-col gap-3 border-b border-neutral-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center border border-neutral-800">
                <Radio size={12} strokeWidth={1.5} className="text-rose-500" />
              </span>

              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-700">
                  Collaboration
                </p>

                <p className="mt-1 font-mono text-[10px] text-neutral-400">
                  Connection active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
                3 users connected
              </span>
            </div>
          </div>

          {/* Flow */}
          <div className="p-5 sm:p-8 lg:p-10">
            <div className="grid gap-px bg-neutral-800 lg:grid-cols-3">
              <FlowNode
                number="01"
                icon={<Users size={16} strokeWidth={1.5} />}
                title="User action"
                description="A teammate changes a task, moves a card, or updates the board."
              />

              <FlowNode
                number="02"
                icon={<RefreshCw size={16} strokeWidth={1.5} />}
                title="Synchronization"
                description="The change is synchronized through the collaboration layer."
                active
              />

              <FlowNode
                number="03"
                icon={<Check size={16} strokeWidth={1.5} />}
                title="Shared state"
                description="Connected teammates receive the update and see the same board."
              />
            </div>

            {/* Flow connector */}
            <div className="mt-8 hidden items-center lg:flex">
              <div className="h-px flex-1 bg-neutral-800" />

              <div className="flex h-8 w-8 items-center justify-center border border-neutral-800 bg-[#0c0c0c]">
                <ArrowRight
                  size={13}
                  strokeWidth={1.5}
                  className="text-neutral-600"
                />
              </div>

              <div className="h-px flex-1 bg-neutral-800" />
            </div>

            {/* Mobile connector */}
            <div className="flex flex-col items-center py-5 lg:hidden">
              <div className="h-6 w-px bg-neutral-800" />

              <ArrowDown
                size={13}
                strokeWidth={1.5}
                className="text-neutral-700"
              />

              <div className="h-6 w-px bg-neutral-800" />
            </div>

            {/* Shared board */}
            <SharedBoardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}



