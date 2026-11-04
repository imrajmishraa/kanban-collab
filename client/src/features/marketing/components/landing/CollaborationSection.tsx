// import { Suspense, lazy } from "react";
// import { motion, useReducedMotion } from "framer-motion";
// import { Link } from "react-router-dom";
// import { HugeiconsIcon } from "@hugeicons/react";
// import { Cursor01Icon } from "@hugeicons/core-free-icons";

// import DesktopFrame from "./DesktopFrame";
// import { Reveal } from "./Tilt";

// const DashboardDemoPage = lazy(() => import("./DashboardDemoPage"));

// /* ── Content ────────────────────────────────────────────────────────── */

// const REPO_URL = "https://github.com/imrajmishraa/kanban-collab";

// /* Two people on the same card. The dot carries the identity, not a fill,
//    which is what keeps this inside the palette. */
// const PEERS = [
//   {
//     name: "Aarav",
//     at: "left-[14%] top-[34%]",
//     dot: "bg-(--success)",
//     delay: 0,
//   },
//   {
//     name: "Meera",
//     at: "right-[16%] top-[52%]",
//     dot: "bg-(--warning)",
//     delay: 0.8,
//   },
// ];

// function FrameSkeleton() {
//   return (
//     <div
//       aria-hidden="true"
//       className="aspect-4/3 w-full animate-pulse rounded-xl bg-(--tint-3) motion-reduce:animate-none"
//     />
//   );
// }

// /* ── Section ────────────────────────────────────────────────────────── */

// export default function CollaborationSection() {
//   const reduce = useReducedMotion();

//   return (
//     <section className="relative">
//       <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
//         <div className="flex w-full flex-col items-center justify-center text-center">
//           <div className="flex max-w-3xl flex-col items-center gap-6">
//             {/* Badge */}
//             <Reveal>
//               <span className="inline-flex min-h-8 items-center rounded-xl bg-(--accent-soft) px-3.5 py-0.5 text-sm font-medium text-(--accent)">
//                 Real-time by default
//               </span>
//             </Reveal>

//             {/* Headline */}
//             <Reveal delay={0.06}>
//               <h2 className="max-w-md text-[40px] font-semibold leading-[1.1] tracking-tight text-balance text-(--text-primary) md:max-w-none md:text-[52px] lg:text-[56px]">
//                 Build together, at scale, everywhere
//               </h2>
//             </Reveal>

//             {/* Standfirst */}
//             <Reveal delay={0.12}>
//               <p className="max-w-[50ch] text-base font-medium text-balance text-(--text-secondary) md:text-[22px]">
//                 Two people cannot drag the same card into two different columns.
//                 Every change converges, cursors and all, and nobody waits for a
//                 refresh to see it.
//               </p>
//             </Reveal>

//             {/* Actions */}
//             <Reveal delay={0.18}>
//               <div className="flex flex-row flex-wrap justify-center gap-2">
//                 <Link
//                   to="/workspaces"
//                   className="
//                     inline-flex h-12 items-center justify-center rounded-full
//                     bg-(--solid-bg) px-6 text-base font-medium text-(--solid-text)
//                     transition-colors duration-200 motion-reduce:transition-none
//                     hover:bg-(--solid-bg-hover)
//                     focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none
//                   "
//                 >
//                   Start a board
//                 </Link>

//                 <a
//                   href={REPO_URL}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="
//                     inline-flex h-12 items-center justify-center rounded-full
//                     border border-(--hairline-strong) bg-(--tint-3) px-6
//                     text-base font-medium text-(--text-primary)
//                     transition-colors duration-200 motion-reduce:transition-none
//                     hover:bg-(--tint-6)
//                     focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none
//                   "
//                 >
//                   Read the source
//                 </a>
//               </div>
//             </Reveal>
//           </div>

//           {/* ── The board, with people on it ── */}
//           <Reveal delay={0.24} className="w-full">
//             <div className="relative mx-auto mt-14 w-full max-w-5xl">
//               <div
//                 aria-hidden="true"
//                 className="pointer-events-none absolute -inset-x-8 -top-10 bottom-0 rounded-[40%] bg-(--accent-soft) blur-[110px]"
//               />

//               <div className="relative">
//                 <DesktopFrame
//                   title="Kanban Collab"
//                   url="kanban.app"
//                   screenAspect="aspect-16/10"
//                 >
//                   <Suspense fallback={<FrameSkeleton />}>
//                     <DashboardDemoPage />
//                   </Suspense>
//                 </DesktopFrame>

//                 {/* Presence cursors */}
//                 {PEERS.map((peer) => (
//                   <motion.div
//                     key={peer.name}
//                     aria-hidden="true"
//                     className={`pointer-events-none absolute z-20 ${peer.at}`}
//                     animate={reduce ? undefined : { y: [0, -7, 0] }}
//                     transition={{
//                       duration: 5.5,
//                       delay: peer.delay,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                     }}
//                   >
//                     <div className="flex items-center gap-1.5 rounded-full rounded-tl-sm border border-(--hairline-strong) bg-(--bg-root) px-2.5 py-1 text-[11px] font-medium text-(--text-primary) backdrop-blur-md">
//                       <HugeiconsIcon
//                         icon={Cursor01Icon}
//                         size={12}
//                         strokeWidth={2}
//                         className="text-(--text-secondary)"
//                       />
//                       <span className={`size-1.5 rounded-full ${peer.dot}`} />
//                       {peer.name}
//                     </div>
//                   </motion.div>
//                 ))}

//                 {/* Who is here */}
//                 <div className="pointer-events-none absolute bottom-4 right-4 z-20 inline-flex items-center gap-2 rounded-full border border-(--hairline-strong) bg-(--bg-root) px-3 py-1.5 text-[12px] font-medium text-(--text-secondary) backdrop-blur-md">
//                   <span className="relative flex size-1.5">
//                     <span className="absolute inline-flex size-full animate-ping rounded-full bg-(--success) opacity-70 motion-reduce:animate-none" />
//                     <span className="relative inline-flex size-1.5 rounded-full bg-(--success)" />
//                   </span>
//                   3 online
//                 </div>
//               </div>
//             </div>
//           </Reveal>
//         </div>
//       </div>
//     </section>
//   );
// }
