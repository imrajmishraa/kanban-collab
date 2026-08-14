import React from "react";
import { Link } from "react-router-dom";

export default function TeamSection() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-800">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-28">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-600">
          // Built for teams
        </p>

        <h2 className="mt-5 font-mono text-3xl tracking-tight text-neutral-100 sm:text-4xl md:text-5xl">
          Turn ideas into progress.
        </h2>

        <p className="mx-auto mt-5 max-w-xl font-mono text-sm leading-7 text-neutral-500">
          Start with a board. Bring your team in. Build something together.
        </p>

        <Link
          to="/auth/sign-in"
          className="
            mt-9
            inline-flex
            items-center
            border
            border-rose-500/80
            bg-rose-500/10
            px-5
            py-2.5
            font-mono
            text-sm
            text-rose-400
            transition-all
            duration-200
            hover:bg-rose-500/20
            hover:text-rose-300
            active:scale-[0.98]
          "
        >
          [ Get Started ]
        </Link>
      </div>
    </section>
  );
}