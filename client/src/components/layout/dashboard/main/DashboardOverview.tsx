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
      className="mt-8 border-y border-(--border)"
    >
      <div
        className="
          grid grid-cols-1
          divide-y divide-(--border)
          sm:grid-cols-3
          sm:divide-x sm:divide-y-0
        "
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="
              group
              px-5 py-5
              transition-all duration-150
              hover:border-(--brand)
              hover:bg-(--brand-muted)
              sm:px-6
            "
          >
            <p
              className="
                font-mono text-[10px] uppercase
                tracking-[0.18em]
                text-(--text-muted)
              "
            >
              {stat.label}
            </p>

            <p
              className="
                mt-2
                font-mono text-2xl font-semibold
                tracking-tight
                text-(--text-primary)
              "
            >
              {String(stat.value).padStart(2, "0")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
