import { useEffect, useRef } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import KanbanIcon from "@/assets/KanbanIcon";
import { TOUR_ICONS } from "@/features/marketing";

const EASE = 0.08;

/** How far from the pointer a mark starts to feel a push, in px. */
const REACH = 220;

/** The hardest push, in px, for a mark sitting right under the pointer. */
const FORCE = 96;

function seeded(seed: number) {
  let state = seed;

  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Cell {
  icon: IconSvgElement;
  left: number;
  top: number;
  size: number;
  rotate: number;
  opacity: number;
  brand: boolean;
}

/** Forty-four marks, spread once, at module load. */
const FIELD: Cell[] = (() => {
  const random = seeded(0x6b616e62);

  return Array.from({ length: 44 }, (_, index) => ({
    icon: TOUR_ICONS[index % TOUR_ICONS.length],
    left: 2 + random() * 95,
    top: 2 + random() * 94,
    size: 15 + Math.round(random() * 23),
    rotate: Math.round(random() * 44 - 22),
    opacity: 0.2 + random() * 0.32,
    brand: random() > 0.74,
  }));
})();

export function AuthBrandPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const markRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /* The real pointer, and the one the panel draws with. The second chases the
       first, which is what makes the reaction feel slow rather than jumpy. */
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame: number | undefined;
    let size = { width: 0, height: 0 };

    const paint = () => {
      panel.style.setProperty("--mx", `${current.x}px`);
      panel.style.setProperty("--my", `${current.y}px`);

      FIELD.forEach((cell, index) => {
        const node = markRefs.current[index];
        if (!node) return;

        const cx = (cell.left / 100) * size.width;
        const cy = (cell.top / 100) * size.height;
        const dx = cx - current.x;
        const dy = cy - current.y;
        const distance = Math.hypot(dx, dy) || 1;

        // Nothing beyond the reach; everything inside it moves away, hardest
        // when the pointer is closest.
        const pull = Math.max(0, 1 - distance / REACH);
        const push = pull * pull * FORCE;

        node.style.transform =
          push > 0.5
            ? `translate(${(dx / distance) * push}px, ${(dy / distance) * push}px)`
            : "";
      });
    };

    const tick = () => {
      current.x += (target.x - current.x) * EASE;
      current.y += (target.y - current.y) * EASE;
      paint();

      const settled =
        Math.abs(target.x - current.x) < 0.4 &&
        Math.abs(target.y - current.y) < 0.4;

      if (settled) {
        current.x = target.x;
        current.y = target.y;
        paint();
        frame = undefined;
        return;
      }

      frame = window.requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || reduceMotion) return;

      const rect = panel.getBoundingClientRect();
      size = { width: rect.width, height: rect.height };
      target.x = event.clientX - rect.left;
      target.y = event.clientY - rect.top;

      if (frame === undefined) frame = window.requestAnimationFrame(tick);
    };

    panel.addEventListener("pointermove", onMove);

    return () => {
      panel.removeEventListener("pointermove", onMove);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <aside
      ref={panelRef}
      className="relative hidden overflow-hidden border-r border-(--hairline) bg-(--bg-root) lg:flex lg:flex-col"
    >
      {/* The light. Always spread — it never gathers into a spot, because a
          bright pool under the cursor is the thing that makes a pointer effect
          look like a torch rather than a surface. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(460px 420px at 16% 20%, color-mix(in srgb, var(--brand) 26%, transparent), transparent 70%)",
            "radial-gradient(400px 380px at 80% 10%, color-mix(in srgb, var(--warning) 22%, transparent), transparent 70%)",
            "radial-gradient(440px 400px at 90% 66%, color-mix(in srgb, var(--success) 20%, transparent), transparent 72%)",
            "radial-gradient(460px 420px at 28% 92%, color-mix(in srgb, var(--danger) 18%, transparent), transparent 72%)",
          ].join(", "),
        }}
      />

      {/* And the light parts around the pointer: the colour steps aside instead
          of lighting up, so the cursor leaves a clean gap behind it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(300px 300px at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--bg-root) 94%, transparent) 0%, color-mix(in srgb, var(--bg-root) 46%, transparent) 44%, transparent 78%)",
        }}
      />

      {/* the marks */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {FIELD.map((cell, index) => (
          <span
            key={index}
            ref={(node) => {
              markRefs.current[index] = node;
            }}
            className={[
              "absolute motion-reduce:transition-transform motion-reduce:duration-500",
              cell.brand ? "text-(--brand)" : "text-(--text-primary)",
            ].join(" ")}
            style={{
              left: `${cell.left}%`,
              top: `${cell.top}%`,
              opacity: cell.opacity,
            }}
          >
            <HugeiconsIcon
              icon={cell.icon}
              size={cell.size}
              strokeWidth={1.4}
              style={{ transform: `rotate(${cell.rotate}deg)` }}
            />
          </span>
        ))}
      </div>

      {/* the words sit on top of the field, so the field fades out under them */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-linear-to-t from-(--bg-root) via-(--bg-root)/80 to-transparent"
      />

      <div className="relative flex h-full flex-col p-10 xl:p-14">
        <KanbanIcon size={30} className="text-(--text-primary)" />

        <div className="mt-auto cursor-default">
          <h1 className="max-w-105 font-sans text-[38px] font-bold leading-[1.06] tracking-[-1.6px] text-(--text-primary) xl:text-[46px] xl:tracking-[-2px]">
            Move work forward,
            <br />
            <span className="text-(--brand)">together.</span>
          </h1>

          <p className="mt-4 max-w-90 text-[14.5px] leading-[1.6] text-(--text-secondary)">
            Every board is a shared document. Two people moving the same card is
            a merge, not a lost change.
          </p>
        </div>
      </div>
    </aside>
  );
}
