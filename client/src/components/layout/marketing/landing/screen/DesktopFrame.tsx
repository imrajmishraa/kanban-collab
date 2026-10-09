import { type ReactNode } from "react";
import { AppleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import logo from "@/assets/logo.svg?inline";
import { cn } from "@/lib/utils";
import useClock from "./Clock";
import ChromeIcon from "./ChromeIcon";
import { P, STROKE } from "./Shared";
import Tab from "./BrowserTab";
import ToolbarButton from "./ToolbarButton";

/* ── DesktopFrame ──────────────────────────────────────────────────── */
interface DesktopFrameProps {
  children: ReactNode;
  className?: string;
  title?: string;
  url?: string;
  /**
   * Screen shape. Taller ratios give the app inside more room.
   * Pass any aspect class — "aspect-16/10" (default), "aspect-3/2",
   * "aspect-4/3" — or a fixed height such as "h-150" to override it.
   */
  screenAspect?: string;
}

function DesktopFrame({
  children,
  className,
  title = "Kanban Collab",
  url = "kanban.app",
  screenAspect = "aspect-16/10",
}: DesktopFrameProps) {
  const clock = useClock();

  return (
    /* ── Chassis: aluminum band → thick black bezel → screen ── */
    <div className={cn("relative mx-auto w-full", className)}>
      {/* aluminum band */}
      <div
        className={cn(
          "relative rounded-[25px] p-1 shadow-2xl",
          "bg-linear-to-b from-zinc-700 via-zinc-800 to-zinc-900",
          "ring-1 ring-black/60",
        )}
      >
        {/* polished bevel highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[15px] ring-1 ring-white/5 ring-inset"
        />

        {/* thick black display bezel — the "sides" of a real screen */}
        <div className="relative rounded-[20px] bg-black p-3 ring-1 ring-white/5 ring-inset">
          {/* ── Screen ── */}
          <div
            className={cn(
              "relative w-full overflow-hidden rounded-xl",
              screenAspect,
              "bg-[#0B0B10] ring-1 ring-white/10",
            )}
          >
            {/* ── Wallpaper ── */}
            <div className="absolute inset-0 bg-[#050810]">
              <div className="absolute inset-0 [background:radial-gradient(70%_55%_at_75%_16%,rgba(43,88,158,0.5),transparent_60%),radial-gradient(55%_45%_at_16%_78%,rgba(94,60,154,0.42),transparent_62%),radial-gradient(42%_36%_at_86%_68%,rgba(214,146,58,0.22),transparent_60%)]" />
            </div>

            {/* ── macOS menu bar ── */}
            <div
              className={cn(
                "relative z-20 flex h-8 items-center justify-between bg-black/25 px-3.5",
                "text-[11px] text-white/85 backdrop-blur-md",
              )}
            >
              <div className="flex items-center gap-4">
                {/* Apple logo */}
                <HugeiconsIcon
                  icon={AppleIcon}
                  size={15}
                  className="cursor-pointer fill-white"
                />
                <span className="cursor-pointer font-bold">Brave</span>
                {["File", "Edit", "View", "History", "Window", "Help"].map(
                  (m) => (
                    <span
                      key={m}
                      className="hidden cursor-pointer text-white/75 hover:text-white sm:inline"
                    >
                      {m}
                    </span>
                  ),
                )}
              </div>
              <div className="flex items-center gap-3.5">
                {/* battery */}
                <span className="flex items-center gap-1.5">
                  <svg
                    viewBox="0 0 26 12"
                    className="h-3 w-6 cursor-pointer text-white/85"
                    aria-hidden="true"
                  >
                    <rect
                      x="0.75"
                      y="0.75"
                      width="20.5"
                      height="10.5"
                      rx="3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    <rect
                      x="2.5"
                      y="2.5"
                      width="13"
                      height="7"
                      rx="1.5"
                      fill="currentColor"
                    />
                    <rect
                      x="23"
                      y="4"
                      width="2"
                      height="4"
                      rx="1"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="hidden sm:inline">53%</span>
                </span>
                {/* wifi */}
                <svg
                  viewBox="0 0 24 24"
                  className="size-3.5 cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M2.5 9.2a15 15 0 0 1 19 0" />
                  <path d="M5.5 12.6a10.5 10.5 0 0 1 13 0" />
                  <path d="M8.6 15.9a6 6 0 0 1 6.8 0" />
                  <circle
                    cx="12"
                    cy="19"
                    r="0.6"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
                {/* spotlight */}
                <ChromeIcon d={P.search} size={12} className="cursor-pointer" />
                <span className="tabular-nums">{clock}</span>
              </div>
            </div>

            {/* ── Camera notch (MacBook Pro style) ── */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-0 z-30 h-6.5 w-24 -translate-x-1/2 rounded-b-sm bg-black"
            >
              {/* camera lens */}
              <span className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#2e3a4a,#0a0f14_70%)] ring-1 ring-white/10" />
            </div>

            {/* ── Brave browser window ── */}
            <div
              className={cn(
                "group/bus absolute bottom-0 left-1/2 top-[9%] min-h-0 w-full -translate-x-1/2",
                "flex flex-col overflow-hidden rounded-xs bg-zinc-900",
                "shadow-[0_24px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/15",
              )}
            >
              {/* Tab strip */}
              <div className="mb-0.5 flex items-end gap-1 bg-zinc-900/95 pl-3">
                {/* traffic lights */}
                <div className="flex items-center gap-2 pb-1.5">
                  <button
                    type="button"
                    aria-label="Close window"
                    className="group/tl relative size-3 rounded-full bg-[#FF5F57] ring-1 ring-black/25"
                  />
                  <button
                    type="button"
                    aria-label="Minimise"
                    className="group/tl relative size-3 rounded-full bg-[#FEBC2E] ring-1 ring-black/25"
                  />
                  <button
                    type="button"
                    aria-label="Maximise"
                    className="group/tl relative size-3 rounded-full bg-[#28C840] ring-1 ring-black/25"
                  />
                </div>

                {/* tabs */}
                <div className="mt-0.5 ml-2 text-xs flex min-w-0 h-6 items-end  justify-center gap-1 overflow-hidden rounded-lg">
                  {/* ── active tab: our app ── */}
                  <Tab
                    active
                    wide
                    label={title}
                    icon={
                      <img
                        src={logo}
                        alt=""
                        className="size-3 rounded-xs object-cover"
                      />
                    }
                  />
                </div>

                {/* new tab */}
                <span className="ml-0.5 mb-1 flex size-5 shrink-0 cursor-default items-center justify-center rounded-sm p-0.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200">
                  <ChromeIcon d={P.plusTab} size={12} />
                </span>
              </div>

              {/* Toolbar */}
              <div className="flex h-10 shrink-0 items-center gap-1 border-b border-black/40 bg-zinc-800 px-2.5">
                <ToolbarButton d={P.back} />
                <ToolbarButton d={P.forward} />
                <ToolbarButton d={P.reload} />

                {/* address bar */}
                <div
                  className={cn(
                    "mx-auto flex h-6.5 w-full max-w-md items-center gap-2 rounded-full",
                    "bg-zinc-900/90 px-3 text-[11px] text-zinc-300 ring-1 ring-white/10",
                  )}
                >
                  {/* Brave shields */}
                  <ChromeIcon
                    d={P.shield}
                    size={12}
                    className="shrink-0 text-[#FB542B]"
                  />
                  {/* lock */}
                  <svg
                    viewBox="0 0 24 24"
                    className="size-3 shrink-0 text-zinc-500"
                    {...STROKE}
                    strokeWidth={1.6}
                  >
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                  <span className="truncate">{url}</span>
                </div>

                <div className="ml-auto flex shrink-0 gap-0">
                  <ToolbarButton d={P.extension} />
                  <ToolbarButton d={P.star} />
                  <ToolbarButton d={P.wallet} />
                  <ToolbarButton d={P.shield} />
                  <ToolbarButton d={P.menu} />
                </div>
              </div>

              {/* ── Viewport: the app renders here ── */}
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#0B0B10] scrollbar-none [&::-webkit-scrollbar]:hidden">
                <div className="h-full">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesktopFrame;
