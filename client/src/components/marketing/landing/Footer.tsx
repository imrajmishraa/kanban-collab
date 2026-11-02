import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { Tooltip } from "#components/Tooltips/ToolTip";
import { cn } from "@/utils/cn";

import {
  FOOTER_AI,
  FOOTER_COLUMNS,
  FOOTER_CONTACT,
  FOOTER_LEGAL,
  FOOTER_SOCIAL,
  FOOTER_TOOLS,
  NAV,
  type AiBrand,
} from "./navConfig";

/**
 * The public footer: four columns of links, then a row split between the AI
 * shortcuts on the left and the documentation shortcuts on the right, then the
 * base line.
 *
 * Like the header, it is permanently light and reads no theme token, so the
 * page keeps one surface from top to bottom whichever theme the app is in.
 */

const linkBase = cn(
  "inline-flex items-center gap-1.5 text-[15px]",
  "transition-colors duration-150",
  "text-[rgb(90,90,90)] hover:text-[rgb(176,176,176)]",
);

const squareBtn = cn(
  "flex items-center justify-center rounded-xl border",
  "transition-colors duration-150",
  "border-[rgb(234,234,234)] text-[rgb(128,128,128)]",
  "hover:border-[rgb(214,214,214)] hover:text-[rgb(55,55,55)]",
  "focus-visible:ring-2 focus-visible:ring-[rgb(52,92,58)] focus-visible:outline-hidden",
);

/**
 * Simplified marks, drawn here rather than imported: the icon set has no brand
 * logos, and a hand-drawn approximation reads better than a wrong one. Swap any
 * of these for the official SVG when you have it.
 */
const AI_MARK: Record<AiBrand, ReactNode> = {
  chatgpt: (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.8312 2.25C8.55502 2.25 6.72848 4.05765 6.72848 6.26471V11.6721L8.5033 12.717L8.50289 7.03256C8.50287 6.82597 8.61397 6.63534 8.79373 6.53351L13.8559 3.66586C13.8788 3.65291 13.9017 3.64014 13.9247 3.62756C13.1733 2.78424 12.0673 2.25 10.8312 2.25Z"
        fill="currentColor"
      />
      <path
        d="M20.3539 9.45169C20.7288 8.39044 20.649 7.18338 20.0322 6.13514C18.9022 4.21475 16.3899 3.54874 14.4214 4.66389L9.65002 7.36677L9.65016 9.25194L14.6484 6.52949C14.8224 6.4347 15.033 6.43646 15.2054 6.53413L20.2676 9.40178C20.2966 9.41818 20.3253 9.43483 20.3539 9.45169Z"
        fill="currentColor"
      />
      <path
        d="M9.65026 10.5581L9.65047 13.3923L11.9529 14.7478L14.4088 13.4101L14.4558 10.67L12.0476 9.25228L9.65026 10.5581Z"
        fill="currentColor"
      />
      <path
        d="M13.222 8.61259L18.1365 11.5058C18.3116 11.6088 18.4191 11.7968 18.4191 12V17.7353C18.4191 17.7628 18.4188 17.7902 18.4184 17.8175C19.5522 17.6046 20.584 16.9282 21.2022 15.8776C22.3284 13.9638 21.6646 11.5115 19.7022 10.3998L14.9173 7.68922L13.222 8.61259Z"
        fill="currentColor"
      />
      <path
        d="M15.5916 11.3387L15.4949 16.9767C15.4915 17.1798 15.3809 17.3658 15.2042 17.4659L10.142 20.3336C10.1196 20.3463 10.0971 20.3588 10.0746 20.3711C10.8259 21.2152 11.9325 21.75 13.1692 21.75C15.4454 21.75 17.2719 19.9424 17.2719 17.7353V12.3279L15.5916 11.3387Z"
        fill="currentColor"
      />
      <path
        d="M14.3862 14.7286L9.35164 17.4709C9.17762 17.5657 8.96699 17.5639 8.79457 17.4662L3.73237 14.5986C3.70272 14.5818 3.67331 14.5648 3.64412 14.5475C3.26908 15.6088 3.34884 16.816 3.9657 17.8643C5.09571 19.7847 7.60799 20.4507 9.57655 19.3355L14.3536 16.6294L14.3862 14.7286Z"
        fill="currentColor"
      />
      <path
        d="M10.7785 15.3875L8.8055 14.226C8.79258 14.219 8.77995 14.2116 8.76765 14.2037L5.86393 12.4942C5.68885 12.3912 5.58136 12.2032 5.58136 12V6.26471C5.58136 6.23734 5.58158 6.21003 5.58201 6.18277C4.44805 6.39557 3.41608 7.072 2.79778 8.12278C1.67163 10.0366 2.3354 12.4889 4.29779 13.6006L9.08274 16.3111L10.7785 15.3875Z"
        fill="currentColor"
      />
    </svg>
  ),
  claude: (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M21.9233 14.4301L22 14L21.6291 13.4965L20.9428 13.065C20.9428 13.065 19.4289 12.8889 18.2831 12.8889C16.8124 12.8889 15.7782 12.8006 15.2699 12.7432L15.202 12.6527L21.6291 11.1704L21.9233 10.5254L21.8667 10.2086L21.1651 9.83519L15.8356 10.8875L15.7677 10.7857C16.458 9.31683 18.0195 7.56458 19.0605 6.16902L19.3547 5.18458L18.7323 4.23409H17.8384C17.8384 4.23409 16.5145 5.28642 14.0252 8.70365L13.6857 9.05443H13.5273L14.5796 3.13651L14.1949 2.54811L13.6857 2.3218L13.086 2.70652L12.7692 3.46465L12.2034 9.65414H12.0676L11.8074 8.70365C11.8074 8.70365 9.53297 4.44909 8.7638 2.4142L8.39441 2.12448L7.5 2L7.23552 2.12448L6.61986 2.92846L6.85888 4.04389L9.85751 9.31683L9.71264 9.43272L4.98293 5.82568L4.07755 5.76049L3.53432 6.33994L3.67194 7.16564L4.01236 7.60747L9.79232 11.5042L10.0054 11.7186L9.9083 11.8278L2.45561 11.2539L2.03906 11.5195L2 11.8278L2.45561 12.4076L2.93889 12.52L9.86375 12.7891L9.94141 12.918L9.86375 13.1002C9.56079 13.2482 5.73332 15.2667 4.38587 16.3764L4.1657 16.5701L4.09524 17.2042L4.51797 17.5917L5.47792 17.4508L10.762 13.9897L10.8149 14.1747C10.8149 14.1747 9.4146 15.7423 6.49952 19.6437L6.44668 20.2426L7.03674 20.5068L7.35379 20.4099L8.7805 18.8775L11.8101 14.7559H11.9598L11.8101 15.3548C11.7889 15.4887 11.2376 18.7543 10.7092 20.9736L11.0086 21.6341L11.5 22L12.1183 21.775L12.3561 21.458L12.9197 15.4253L13.0518 15.3548C13.0518 15.3548 14.6899 18.1466 16.3016 20.3923L16.8388 20.4804L17.3672 20.3043L17.5257 20.0048L17.42 19.1065L15.0862 15.6542V15.4957H15.2095L19.3752 18.8687H19.6394L19.9036 18.5077L19.8067 18.0321L15.1391 13.7079V13.5846L20.8811 14.9585L21.9233 14.4301Z"
        fill="currentColor"
      />
    </svg>
  ),
  perplexity: (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9.8584 7.25H5.95063C5.28581 7.24997 4.71289 7.24994 4.25416 7.31161C3.76253 7.37771 3.29126 7.52677 2.90902 7.90902C2.52677 8.29126 2.37771 8.76253 2.31161 9.25416C2.24994 9.71289 2.24997 10.2857 2.25 10.9505V13.0494C2.24997 13.7142 2.24994 14.2871 2.31161 14.7459C2.37771 15.2375 2.52677 15.7088 2.90902 16.091C3.22482 16.4068 3.60139 16.5634 4 16.6456V14.3798C4 13.2586 4.47059 12.1888 5.29711 11.4312L9.8584 7.25Z"
        fill="currentColor"
      />
      <path
        d="M20 16.6456C20.3986 16.5634 20.7752 16.4068 21.091 16.091C21.4732 15.7088 21.6223 15.2375 21.6884 14.7459C21.7501 14.2871 21.75 13.7142 21.75 13.0494V10.9506C21.75 10.2858 21.7501 9.71291 21.6884 9.25416C21.6223 8.76253 21.4732 8.29126 21.091 7.90902C20.7088 7.52677 20.2375 7.37771 19.7459 7.31161C19.2871 7.24994 18.7143 7.24997 18.0495 7.25H14.1416L18.7029 11.4312C19.5294 12.1888 20 13.2586 20 14.3798V16.6456Z"
        fill="currentColor"
      />
      <path
        d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V22C12.75 22.4142 12.4142 22.75 12 22.75C11.5858 22.75 11.25 22.4142 11.25 22V2C11.25 1.58579 11.5858 1.25 12 1.25Z"
        fill="currentColor"
      />
      <path
        d="M10 4.93934L6.73744 1.67678C6.46418 1.40352 6.09356 1.25 5.70711 1.25C4.90237 1.25 4.25 1.90237 4.25 2.70711V6.05335C4.75648 5.99981 5.33522 5.99991 5.89174 6.00001H10V4.93934Z"
        fill="currentColor"
      />
      <path
        d="M14 6.00001H18.1083C18.6648 5.99991 19.2435 5.99981 19.75 6.05335V2.70711C19.75 1.90237 19.0976 1.25 18.2929 1.25C17.9064 1.25 17.5358 1.40352 17.2626 1.67678L14 4.93934V6.00001Z"
        fill="currentColor"
      />
      <path
        d="M10 8.81641L6.14176 12.3531C5.57353 12.874 5.25 13.6095 5.25 14.3803V20.3072C5.25 21.1043 5.89619 21.7505 6.6933 21.7505C7.09995 21.7505 7.48772 21.579 7.76126 21.2781L10 18.8155V8.81641Z"
        fill="currentColor"
      />
      <path
        d="M14 18.8155L16.2387 21.2781C16.5123 21.579 16.9001 21.7505 17.3067 21.7505C18.1038 21.7505 18.75 21.1043 18.75 20.3072V14.3803C18.75 13.6095 18.4265 12.874 17.8582 12.3531L14 8.81641V18.8155Z"
        fill="currentColor"
      />
    </svg>
  ),
  grok: (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M7 9H3L12 22H16L7 9Z" fill="currentColor" />
      <path d="M18 22H21V3.5L18 7.78571V22Z" fill="currentColor" />
      <path
        d="M3.00021 22H7.00021L9.0553 19.0642L7.06635 16.1912L3.00021 22Z"
        fill="currentColor"
      />
      <path
        d="M9.99464 12.008L11.9836 14.8809L21.0002 2H17.0002L9.99464 12.008Z"
        fill="currentColor"
      />
    </svg>
  ),
  gemini: (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2.25C12.4142 2.25 12.75 2.58579 12.75 3C12.75 7.55635 16.4437 11.25 21 11.25C21.4142 11.25 21.75 11.5858 21.75 12C21.75 12.4142 21.4142 12.75 21 12.75C16.4437 12.75 12.75 16.4437 12.75 21C12.75 21.4142 12.4142 21.75 12 21.75C11.5858 21.75 11.25 21.4142 11.25 21C11.25 16.4437 7.55635 12.75 3 12.75C2.58579 12.75 2.25 12.4142 2.25 12C2.25 11.5858 2.58579 11.25 3 11.25C7.55635 11.25 11.25 7.55635 11.25 3C11.25 2.58579 11.5858 2.25 12 2.25Z"
        fill="currentColor"
      />
    </svg>
  ),
};

/**
 * Each mark keeps its own colour, taken from the source markup. Set inline
 * rather than as a class: the button recipe already carries a text colour, and
 * with a plain `cn` join two text colours would be resolved by whichever
 * Tailwind emitted last, not by which one you wrote last.
 */
const AI_COLOR: Record<AiBrand, string> = {
  chatgpt: "rgb(13,13,13)",
  claude: "rgb(217,119,87)",
  perplexity: "rgb(32,128,141)",
  grok: "rgb(13,13,13)",
  gemini: "rgb(78,130,238)",
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        /* Above LandingBackground: it is `fixed inset-0 z-0`, so anything left
           at auto paints behind the depth field. */
        "relative z-10 w-full border-t",
        NAV.surface,
        NAV.edge,
        NAV.ink,
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        {/* ── Columns ───────────────────────────────────────────── */}
        <div className="mt-5 ml-10 grid grid-cols-2 gap-x-10 gap-y-10 md:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="text-[15px] font-semibold text-[rgb(23,23,23)]">
                {column.title}
              </h2>
              <ul className="mt-6 flex flex-col gap-4">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.title}`}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkBase}
                      >
                        {link.title}
                        {link.badge ? (
                          <span className="font-semibold text-[rgb(23,23,23)]">
                            {link.badge}
                          </span>
                        ) : null}
                        {link.dot ? (
                          <span
                            aria-hidden="true"
                            className="size-1.5 rounded-full bg-[rgb(52,92,58)]"
                          />
                        ) : null}
                      </a>
                    ) : (
                      <Link to={link.href} className={linkBase}>
                        {link.title}
                        {link.badge ? (
                          <span className="font-semibold text-[rgb(23,23,23)]">
                            {link.badge}
                          </span>
                        ) : null}
                        {link.dot ? (
                          <span
                            aria-hidden="true"
                            className="size-1.5 rounded-full bg-[rgb(52,92,58)]"
                          />
                        ) : null}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Ask AI (left) · documentation shortcuts (right) ───── */}
        <div className="mt-20 flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[15px] text-[rgb(90,90,90)]">
              Ask AI
              <span aria-hidden="true" className="text-[rgb(66,133,244)]">
                ✦
              </span>
              about Kanban Collab
            </p>
            <ul className="mt-4 flex flex-wrap items-center gap-3">
              {FOOTER_AI.map((ai) => (
                <li key={ai.title}>
                  <Tooltip label={ai.title} side="top" size="sm">
                    <a
                      href={ai.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={ai.title}
                      style={{ color: AI_COLOR[ai.brand] }}
                      className={cn(
                        "flex items-center justify-center rounded-[14px] border",
                        "border-[rgb(234,234,234)] bg-[rgb(250,250,250)]",
                        "transition-[background-color,transform] duration-150",
                        "hover:-translate-y-px hover:bg-[rgb(244,244,244)]",
                        "focus-visible:ring-2 focus-visible:ring-[rgb(52,92,58)] focus-visible:outline-hidden",
                        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                        "size-13 hover:scale-110",
                      )}
                    >
                      {AI_MARK[ai.brand]}
                    </a>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:text-right">
            <p className="text-[15px] text-[rgb(90,90,90)]">Read the docs</p>
            <ul className="mt-4 flex flex-wrap items-center gap-3 md:justify-end">
              {FOOTER_TOOLS.map((tool) => (
                <li key={tool.title}>
                  <Tooltip label={tool.title} side="top" size="sm">
                    <a
                      href={tool.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={tool.title}
                      className={cn(squareBtn, "size-11 hover:scale-110")}
                    >
                      <HugeiconsIcon
                        icon={tool.icon}
                        size={19}
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                    </a>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Base line ─────────────────────────────────────────── */}
        <div
          className={cn(
            "mt-15 flex flex-col gap-4 border-t pt-8",
            NAV.edge,
            "text-[15px] md:flex-row md:items-center md:justify-between",
          )}
        >
          <p className="text-[rgb(23,23,23)]">
            © {year} Kanban Collab. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <a
              href={FOOTER_CONTACT.href}
              target={FOOTER_CONTACT.external ? "_blank" : undefined}
              rel={FOOTER_CONTACT.external ? "noopener noreferrer" : undefined}
              className="group inline-flex items-center gap-1.5 text-[rgb(90,90,90)] transition-colors duration-150 hover:text-[rgb(55,55,55)]"
            >
              {FOOTER_CONTACT.label}
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={14}
                strokeWidth={2}
                aria-hidden="true"
                className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
              />
              <span className="font-semibold text-[rgb(23,23,23)]">
                open an issue
              </span>
            </a>

            {FOOTER_LEGAL.map((link) => (
              <span key={link.title} className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="hidden h-4 w-px bg-[rgb(228,228,228)] md:block"
                />
                <Link
                  to={link.href}
                  className="text-[rgb(90,90,90)] transition-colors duration-150 hover:text-[rgb(55,55,55)]"
                >
                  {link.title}
                </Link>
              </span>
            ))}

            <span
              aria-hidden="true"
              className="hidden h-4 w-px bg-[rgb(228,228,228)] md:block"
            />

            <ul className="flex items-center gap-4">
              {FOOTER_SOCIAL.map((social) => (
                <li key={social.title}>
                  <Tooltip label={social.title} side="top" size="sm">
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.title}
                      className="flex items-center text-[rgb(90,90,90)] transition-colors duration-150 hover:scale-110 hover:text-[rgb(23,23,23)]"
                    >
                      <HugeiconsIcon
                        icon={social.icon}
                        size={19}
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                    </a>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
