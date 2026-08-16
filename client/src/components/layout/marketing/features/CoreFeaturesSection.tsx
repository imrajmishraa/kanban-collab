import FeatureCard from "#components/ui/marketing/features/FeatureCard";
import FeatureIcon from "#components/ui/marketing/features/FeatureIcon";

export default function CoreFeaturesSection() {
  return (
    <section
      id="core-features"
      className="border-b border-neutral-800 bg-[#080808] px-4 py-24 text-neutral-100 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Section heading */}
        <div className="max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="font-mono text-[10px] text-rose-500">01</span>

            <span className="h-px w-6 bg-neutral-800" />

            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
              Core features
            </span>
          </div>

          <h2 className="font-mono text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to organize work.
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
            Keep projects clear, structured, and moving forward with the
            essential tools of a modern Kanban workspace.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-14 grid overflow-hidden border border-neutral-800 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<FeatureIcon name="board" />}
            index="01"
            title="Powerful Boards"
            description="Visualize your workflow in a flexible Kanban board built around the way your team works."
          />

          <FeatureCard
            icon={<FeatureIcon name="move" />}
            index="02"
            title="Drag & Drop"
            description="Move tasks naturally between stages and keep your workflow flowing without unnecessary friction."
          />

          <FeatureCard
            icon={<FeatureIcon name="card" />}
            index="03"
            title="Custom Cards"
            description="Capture the details behind every task and keep important work organized in one place."
          />

          <FeatureCard
            icon={<FeatureIcon name="tag" />}
            index="04"
            title="Labels & Organization"
            description="Categorize work clearly so your team can understand priorities and context at a glance."
          />

          <FeatureCard
            icon={<FeatureIcon name="calendar" />}
            index="05"
            title="Due Dates"
            description="Keep deadlines visible and make it easier to understand what needs attention next."
          />

          <FeatureCard
            icon={<FeatureIcon name="users" />}
            index="06"
            title="Assignments"
            description="Make ownership clear by connecting work with the people responsible for moving it forward."
          />
        </div>
      </div>
    </section>
  );
}
