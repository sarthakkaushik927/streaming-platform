import React from 'react';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { Hero } from '../components/hireme/Hero';
import { EngineeringPractices } from '../components/hireme/EngineeringPractices';
import { SkillsSection } from '../components/hireme/SkillsSection';
import { ProcessTimeline } from '../components/hireme/ProcessTimeline';
import { ExperienceSection } from '../components/hireme/ExperienceSection';
import { SelectedWork } from '../components/hireme/SelectedWork';
import { HireCTA } from '../components/hireme/HireCTA';
import '../components/hireme/hireme.css';

const SectionPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`bg-background text-on-surface rounded-4xl overflow-hidden shadow-2xl px-6 lg:px-16 2xl:px-24 py-12 md:py-16 ${className}`}
  >
    <div className="max-w-6xl mx-auto">{children}</div>
  </div>
);

export const HireMePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-frame p-2 md:p-4 flex flex-col gap-2 md:gap-3 font-body-md">
      <div className="bg-background text-on-surface rounded-4xl overflow-hidden shadow-2xl relative">
        <Navbar />
        <div className="px-6 lg:px-16 2xl:px-24 py-8">
          <div className="max-w-6xl mx-auto">
            <Hero />
          </div>
        </div>
      </div>

      <SectionPanel>
        <ExperienceSection />
      </SectionPanel>

      <SectionPanel>
        <SelectedWork />
      </SectionPanel>

      <SectionPanel>
        <EngineeringPractices />
      </SectionPanel>

      <SectionPanel>
        <SkillsSection />
      </SectionPanel>

      <SectionPanel>
        <ProcessTimeline />
      </SectionPanel>

      <SectionPanel>
        <HireCTA />
      </SectionPanel>

      <Footer />
    </div>
  );
};
