const skeletonColumns = [1, 2, 3];

const skeletonCards = [1, 2, 3];

const panel =
  "relative overflow-hidden rounded-xl border border-white/8 bg-white/4";

export default function BoardSkeleton() {
  return (
    <div
      aria-label="Loading board"
      aria-busy="true"
      className="flex h-full min-h-0 flex-col bg-(--bg-root)"
    >
      {/* Header skeleton */}
      <div className="border-b border-white/8 px-4 py-4 md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 h-3 w-28 animate-pulse rounded bg-white/6" />

            <div className="h-5 w-52 max-w-full animate-pulse rounded bg-white/6" />

            <div className="mt-2 h-3 w-72 max-w-full animate-pulse rounded bg-white/6" />
          </div>

          <div className="flex gap-1">
            <div className="size-9 animate-pulse rounded-full bg-white/6" />
            <div className="size-9 animate-pulse rounded-full bg-white/6" />
          </div>
        </div>
      </div>

      {/* Toolbar skeleton */}
      <div className="flex flex-col gap-3 border-b border-white/8 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex gap-2">
          <div className="h-9 w-56 max-w-[45vw] animate-pulse rounded-full bg-white/6" />
          <div className="h-9 w-20 animate-pulse rounded-full bg-white/6" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-white/6" />
        </div>

        <div className="flex gap-2">
          <div className="h-9 w-20 animate-pulse rounded-full bg-white/6" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-white/6" />
        </div>
      </div>

      {/* Columns skeleton */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full min-w-max gap-4 p-4 md:p-6">
          {skeletonColumns.map((column) => (
            <div
              key={column}
              className={[panel, "flex h-full w-72 shrink-0 flex-col"].join(
                " ",
              )}
            >
              {/* Column header */}
              <div className="flex items-center justify-between border-b border-white/6 px-3 py-3">
                <div className="h-3 w-20 animate-pulse rounded bg-white/6" />
                <div className="h-3 w-5 animate-pulse rounded bg-white/6" />
              </div>

              {/* Cards */}
              <div className="min-h-0 flex-1 p-2.5">
                <div className="flex flex-col gap-2">
                  {skeletonCards.map((card) => (
                    <div
                      key={card}
                      className="rounded-lg border border-white/8 bg-white/3 p-3"
                    >
                      <div className="h-2.5 w-16 animate-pulse rounded bg-white/6" />

                      <div className="mt-3 h-4 w-full animate-pulse rounded bg-white/6" />
                      <div className="mt-1.5 h-4 w-3/4 animate-pulse rounded bg-white/6" />

                      <div className="mt-3 flex gap-1.5">
                        <div className="h-4 w-14 animate-pulse rounded-full bg-white/6" />
                        <div className="h-4 w-16 animate-pulse rounded-full bg-white/6" />
                      </div>

                      <div className="mt-3 border-t border-white/6 pt-2.5">
                        <div className="h-3 w-20 animate-pulse rounded bg-white/6" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add card skeleton */}
              <div className="border-t border-white/6 p-2">
                <div className="h-8 w-full animate-pulse rounded-lg bg-white/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
