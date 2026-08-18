import React from 'react';

import HowItWorksHero from '@components/layout/marketing/howItWorks/HowItWorksHero';
import WorkflowOverviewSection from '#components/layout/marketing/howItWorks/WorkflowOverviewSection';
import StepOneSection from '#components/layout/marketing/howItWorks/StepOneSection';
import StepTwoSection from '#components/layout/marketing/howItWorks/StepTwoSection';
import StepThreeSection from '#components/layout/marketing/howItWorks/StepThreeSection';
import HowItWorksCTA from '#components/layout/marketing/howItWorks/HowItWorksCTA';
import CollaborationFlowSection from '#components/layout/marketing/howItWorks/CollaborationFlowSection';

function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#080808] px-4 py-12 text-neutral-100 sm:px-6 sm:py-16">
      <HowItWorksHero />
      <WorkflowOverviewSection />
      <StepOneSection />
      <StepTwoSection />
      <StepThreeSection />
      <CollaborationFlowSection />
      <HowItWorksCTA />
    </div>
  );
}

export default HowItWorksPage;
