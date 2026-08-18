const DashboardSkeleton = () => {
  return (
    <div
      role="status"
      aria-label="Loading dashboard"
      aria-busy="true"
      className="animate-pulse space-y-8"
    >
      {/* Screen-reader loading message */}
      <span className="sr-only">Loading dashboard...</span>

      {/* Overview */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 border border-neutral-800 bg-[#0b0b0b] p-5"
          >
            <div className="h-3 w-20 rounded-sm bg-neutral-800" />

            <div className="mt-4 h-7 w-24 rounded-sm bg-neutral-800" />

            <div className="mt-2 h-2.5 w-32 rounded-sm bg-neutral-900" />
          </div>
        ))}
      </section>

      {/* Workspaces */}
      <section>
        <div className="mb-4 h-3 w-28 rounded-sm bg-neutral-800" />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 border border-neutral-800 bg-[#0b0b0b] p-4"
            >
              <div className="h-3 w-32 rounded-sm bg-neutral-800" />

              <div className="mt-3 h-2.5 w-20 rounded-sm bg-neutral-900" />
            </div>
          ))}
        </div>
      </section>

      {/* Activity */}
      <section>
        <div className="mb-4 h-3 w-24 rounded-sm bg-neutral-800" />

        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex h-12 items-center gap-3 border border-neutral-800 bg-[#0b0b0b] px-4"
            >
              <div className="size-6 rounded-full bg-neutral-800" />

              <div className="flex-1">
                <div className="h-2.5 w-2/3 rounded-sm bg-neutral-800" />

                <div className="mt-2 h-2 w-1/3 rounded-sm bg-neutral-900" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent boards */}
      <section>
        <div className="mb-4 h-3 w-32 rounded-sm bg-neutral-800" />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-24 border border-neutral-800 bg-[#0b0b0b] p-4"
            >
              <div className="h-3 w-36 rounded-sm bg-neutral-800" />

              <div className="mt-4 h-2.5 w-24 rounded-sm bg-neutral-900" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardSkeleton;
