interface DashboardOverviewProps {
  workspaceCount: number;
  boardCount: number;
  taskCount: number;
}

export default function DashboardOverview({
  workspaceCount,
  boardCount,
  taskCount,
}: DashboardOverviewProps) {
  const stats = [
    {
      label: "Workspaces",
      value: workspaceCount,
    },
    {
      label: "Boards",
      value: boardCount,
    },
    {
      label: "Tasks",
      value: taskCount,
    },
  ];

  return (
    <section
      aria-label="Workspace overview"
      className="mt-8 border-y border-neutral-800"
    >
      <div className="grid grid-cols-1 divide-y divide-neutral-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group px-5 py-5 transition-colors hover:bg-[#0c0c0e] sm:px-6"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
              {stat.label}
            </p>

            <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-neutral-100">
              {String(stat.value).padStart(2, "0")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
