import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";

import Footer from "@/components/layout/landing/Footer";
import Navbar from "@/components/layout/landing/Navbar";
import { LandingBackground } from "@/features/landing/LandingBackground";


function ScrollCorner() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.4,
  });

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 16,
        scale: visible ? 1 : 0.9,
      }}
      transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`
        fixed bottom-6 right-6 z-60 flex size-11 cursor-pointer items-center
        justify-center rounded-full bg-[#0B0B10]/70
        text-(--text-secondary) shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_32px_-8px_rgba(0,0,0,0.6)]
        backdrop-blur-xl backdrop-saturate-150
        transition-colors duration-300
        hover:border-(--brand)/45 hover:text-(--brand-hover)
        ${visible ? "pointer-events-auto" : "pointer-events-none"}
      `}
    >
      {/* Progress ring */}
      <svg
        viewBox="0 0 48 48"
        className="absolute inset-0 size-full -rotate-90"
      >
        {/* Progress ring for the scroll corner */}
        <motion.circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ pathLength: progress }}
        />
      </svg>

      <HugeiconsIcon
        icon={ArrowUp01Icon}
        size={15}
        strokeWidth={2.2}
        className="relative"
      />
    </motion.button>
  );
}

export default function PublicLayout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-(--bg-root) text-(--text-primary)">
      {/* 3D depth field behind every public page */}
      <LandingBackground />

      <Navbar />

      <main className="relative z-0 flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* Scroll progress ring — bottom-right corner */}
      <ScrollCorner />
    </div>
  );
}
