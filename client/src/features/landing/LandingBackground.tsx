const BACKGROUND_URL = "https://chaicode.com/assets/background-S4EJ6pKP.svg";

export function LandingBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Base color behind the SVG (avoids a flash of white on load) */}
      <div className="absolute inset-0 bg-[#0a0a14]" />

      {/* The chaicode.com background SVG — cover the viewport */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${BACKGROUND_URL}")` }}
      />

      {/* Soft vignette to pull focus toward the center */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,transparent_35%,rgba(0,0,0,0.55)_100%)]" />

      {/* Optional: subtle top-edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]" />
    </div>
  );
}
