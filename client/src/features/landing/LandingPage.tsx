import HeroSection from "@components/layout/landing/HeroSection";
import WhyKanbanSection from "@components/layout/landing/WhyKanbanSection";
import CollaborationSection from "@components/layout/landing/CollaborationSection";
import TeamSection from "@components/layout/landing/TeamSection";
import { LandingBackground } from "./LandingBackground";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen text-neutral-100">
      <LandingBackground />

      <main className="relative z-0">
        <HeroSection />

        <WhyKanbanSection />

        <CollaborationSection />

        <TeamSection />
      </main>
    </div>
  );
}
