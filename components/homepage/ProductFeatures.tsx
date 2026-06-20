import Image from "next/image";

import { FeatureText } from "@/components/homepage/FeatureText";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { ScrollFloat } from "@/components/motion/ScrollFlow";

const jobSearchFeatures = [
  {
    title: "Find jobs that actually fit",
    copy: "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
  },
  {
    title: "Know the Company Before You Apply",
    copy: "Stop guessing what a company is about. Jobbiton browses their site and gives you everything you need to apply with confidence.",
  },
  {
    title: "Keep track of every application",
    copy: "Keep a clear view of every job you've found, tailored. Your activity and progress all stay in one simple place.",
  },
];

const confidenceFeatures = [
  {
    title: "Understand your match score",
    copy: "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what's missing.",
  },
  {
    title: "AI-Powered Job Matching",
    copy: "Stop guessing which jobs are worth applying to. Jobbiton scores every role against your actual skills so you focus on the ones that matter.",
    active: true,
  },
  {
    title: "Focus on the right roles",
    copy: "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.",
  },
];

export function ProductFeatures() {
  return (
    <section>
      <div className="grid border-t border-border md:grid-cols-2">
        <div className="border-b border-border md:border-r md:border-border">
          <Reveal className="border-b border-border px-6 py-12 sm:px-8 sm:py-16 md:px-16 md:py-24">
            <h2 className="max-w-[520px] text-[38px] font-bold leading-[1.1] text-text-primary sm:text-[48px] md:text-[56px]">
              Manage Your Job Search With Ease
            </h2>
          </Reveal>
          <RevealGroup>
            {jobSearchFeatures.map((feature, index) => (
              <RevealItem key={feature.title}>
              <FeatureText
                title={feature.title}
                copy={feature.copy}
                active={index === 0}
              />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
        <Reveal className="overflow-hidden bg-surface-muted px-4 py-10 sm:px-6 sm:py-16 md:px-8">
          <ScrollFloat className="flex items-center justify-center" direction="left" intensity={40} scale>
            <Image
              src="/images/jobs-lists.png"
              alt="Job matches list with companies, scores, salaries, and sources"
              width={1182}
              height={889}
              className="w-full max-w-[590px] rounded-xl"
            />
          </ScrollFloat>
        </Reveal>
      </div>
      <div className="diagonal-band h-16 border-b border-border md:h-24" aria-hidden="true" />
      <div className="grid border-b border-border md:grid-cols-2">
        <Reveal className="overflow-hidden bg-surface-muted px-4 py-10 sm:px-6 sm:py-16 md:min-h-[620px] md:px-10">
          <ScrollFloat className="flex items-center justify-center" direction="right" intensity={40} scale>
            <Image
              src="/images/agnet-log.png"
              alt="Agent log showing Jobbiton scanning, filtering, and preparing applications"
              width={1072}
              height={828}
              className="w-full max-w-[530px] rounded-xl"
            />
          </ScrollFloat>
        </Reveal>
        <div className="border-l-0 border-border md:border-l">
          <Reveal className="border-b border-border px-6 py-12 sm:px-8 sm:py-16 md:px-16 md:py-24">
            <h2 className="max-w-[640px] text-[38px] font-bold leading-[1.1] text-text-primary sm:text-[48px] md:text-[56px]">
              Apply With More Confidence, Every Time
            </h2>
          </Reveal>
          <RevealGroup>
            {confidenceFeatures.map((feature) => (
              <RevealItem key={feature.title}>
              <FeatureText
                title={feature.title}
                copy={feature.copy}
                active={feature.active}
              />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
      <div className="diagonal-band h-16 border-b border-border md:h-24" aria-hidden="true" />
    </section>
  );
}
