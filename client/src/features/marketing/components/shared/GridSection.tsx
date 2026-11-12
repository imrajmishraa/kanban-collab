import SectionHead from "./SectionHead";
import CardGrid, { type GridCard } from "./CardGrid";

interface GridSectionProps {
  id?: string;
  title: string;
  lead?: string;
  register?: "sans" | "mono";
  items: GridCard[];
  columns?: 2 | 3;
}

/** A head and a card grid, on the marketing background. */
export default function GridSection({
  id,
  title,
  lead,
  register,
  items,
  columns,
}: GridSectionProps) {
  return (
    <section
      id={id}
      className="relative scroll-mt-24 border-t border-(--hairline) bg-(--bg-root)"
    >
      <div className="mx-auto w-full max-w-384 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHead title={title} lead={lead} register={register} />

        <CardGrid items={items} columns={columns} />
      </div>
    </section>
  );
}
