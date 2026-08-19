const skeletonColumns = [1, 2, 3];

const skeletonCards = [1, 2, 3];

export default function BoardSkeleton() {
  return (
    <div
      aria-label="Loading board"
      aria-busy="true"
      className="flex h-full min-h-0 flex-col bg-[#080808]"
    >
      {/* Header skeleton */}
      <div className="border-b border-neutral-800 px-4 py-4 md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 h-3 w-28 animate-pulse bg-neutral-900" />

            <div className="h-5 w-52 max-w-full animate-pulse bg-neutral-900" />

            <div className="mt-2 h-3 w-72 max-w-full animate-pulse bg-neutral-900" />
          </div>

          <div className="flex gap-1">
            <div className="h-9 w-9 animate-pulse bg-neutral-900" />
            <div className="h-9 w-9 animate-pulse bg-neutral-900" />
          </div>
        </div>
      </div>

      {/* Toolbar skeleton */}
      <div className="flex flex-col gap-3 border-b border-neutral-800 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex gap-2">
          <div className="h-9 w-56 max-w-[45vw] animate-pulse bg-neutral-900" />
          <div className="h-9 w-20 animate-pulse bg-neutral-900" />
          <div className="h-9 w-24 animate-pulse bg-neutral-900" />
        </div>

        <div className="flex gap-2">
          <div className="h-9 w-20 animate-pulse bg-neutral-900" />
          <div className="h-9 w-24 animate-pulse bg-neutral-900" />
        </div>
      </div>

      {/* Columns skeleton */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full min-w-max gap-4 p-4 md:p-6">
          {skeletonColumns.map((column) => (
            <div
              key={column}
              className="flex h-full w-75 shrink-0 flex-col border border-neutral-800 bg-[#0b0b0b]"
            >
              {/* Column header */}
              <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-3">
                <div className="h-3 w-20 animate-pulse bg-neutral-900" />
                <div className="h-3 w-5 animate-pulse bg-neutral-900" />
              </div>

              {/* Cards */}
              <div className="min-h-0 flex-1 p-3">
                <div className="flex flex-col gap-2">
                  {skeletonCards.map((card) => (
                    <div
                      key={card}
                      className="border border-neutral-900 bg-[#0d0d0d] p-3"
                    >
                      <div className="h-2.5 w-16 animate-pulse bg-neutral-900" />

                      <div className="mt-3 h-4 w-full animate-pulse bg-neutral-900" />
                      <div className="mt-1.5 h-4 w-3/4 animate-pulse bg-neutral-900" />

                      <div className="mt-3 flex gap-1.5">
                        <div className="h-4 w-14 animate-pulse bg-neutral-900" />
                        <div className="h-4 w-16 animate-pulse bg-neutral-900" />
                      </div>

                      <div className="mt-3 border-t border-neutral-900 pt-2.5">
                        <div className="h-3 w-20 animate-pulse bg-neutral-900" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add card skeleton */}
              <div className="border-t border-neutral-800 p-2">
                <div className="h-8 w-full animate-pulse bg-neutral-900" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
