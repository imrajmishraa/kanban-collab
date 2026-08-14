import Navbar from "@/components/layout/landing/Navbar";
import Footer from "@/components/layout/landing/Footer";

import HeroSection from "@components/layout/landing/HeroSection";
import WhyKanbanSection from "@components/layout/landing/WhyKanbanSection";
import CollaborationSection from "@components/layout/landing/CollaborationSection";
import TeamSection from "@components/layout/landing/TeamSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-neutral-100">
      <Navbar />

      <main className="pt-14">
        <HeroSection />

        <WhyKanbanSection />

        <CollaborationSection />

        <TeamSection />
      </main>

      <Footer />
    </div>
  );
}
