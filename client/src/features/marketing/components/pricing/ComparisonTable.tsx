import { COMPARE } from "./plans";

const COLUMNS = ["Community", "Team", "Enterprise"] as const;

/**
 * The comparison table.
 *
 * `marketing-prose` carries no table rules on purpose, so the table brings its
 * own: a mono header row on a tint, hairlines between rows, and the first cell
 * of each row in the primary ink so the label reads before the values.
 */
export default function ComparisonTable() {
  return (
    <section
      id="compare"
      className="scroll-mt-24 border-b border-(--hairline) bg-(--bg-surface)"
    >
      <div className="mx-auto w-full max-w-384 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <header className="max-w-2xl">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-muted)">
            Line by line
          </span>
          <h2 className="mt-4 text-[28px] font-bold leading-[1.2] tracking-[-1px] text-(--text-primary) md:text-[34px]">
            What changes between the three
          </h2>
          <p className="mt-3 text-[16px] leading-7 text-(--text-secondary) md:text-[17px]">
            The board is identical in all three. What differs is who runs the
            database, and who you call when it is down.
          </p>
        </header>

        <div className="mt-8 overflow-x-auto rounded-xl border border-(--hairline) bg-(--bg-surface)">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <caption className="sr-only">
              Features by plan: Community, Team and Enterprise
            </caption>
            <thead>
              <tr className="bg-(--tint-3)">
                <th
                  scope="col"
                  className="border-b border-(--hairline) px-4 py-3 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-(--text-muted)"
                >
                  Feature
                </th>
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="border-b border-(--hairline) px-4 py-3 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-(--text-muted)"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr
                  key={row.label}
                  className="transition-colors duration-150 hover:bg-(--tint-2)"
                >
                  <th
                    scope="row"
                    className="border-b border-(--hairline) px-4 py-3.5 text-left text-[14px] font-semibold text-(--text-primary)"
                  >
                    {row.label}
                  </th>
                  <td className="border-b border-(--hairline) px-4 py-3.5 text-[14px] text-(--text-secondary)">
                    {row.community}
                  </td>
                  <td className="border-b border-(--hairline) px-4 py-3.5 text-[14px] text-(--text-secondary)">
                    {row.team}
                  </td>
                  <td className="border-b border-(--hairline) px-4 py-3.5 text-[14px] text-(--text-secondary)">
                    {row.enterprise}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
