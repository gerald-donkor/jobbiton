import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";

type FinalCtaProps = {
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function FinalCta({
  primaryHref = "/login",
  primaryLabel = "Get Started",
  secondaryHref = "/find-jobs",
  secondaryLabel = "Find Your First Match",
}: FinalCtaProps) {
  return (
    <section>
      <div className="diagonal-band h-16 border-y border-border md:h-24" aria-hidden="true" />
      <Reveal className="soft-gradient-panel px-4 py-16 text-center sm:px-6 md:px-16 md:py-28">
        <h2 className="mx-auto max-w-[860px] text-[38px] font-bold leading-[1.08] text-text-primary sm:text-[48px] md:text-[64px]">
          Your next job search can feel a lot less overwhelming
        </h2>
        <p className="supporting-text-tone mt-8 text-[18px] font-normal leading-7 md:text-[20px] md:leading-8">
          Set up your profile, upload your resume, and start finding matches in
          minutes.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
          <Link
            href={primaryHref}
            className="button-primary button-primary-lg"
          >
            {primaryLabel} <span className="button-caret">▶</span>
          </Link>
          <Link
            href={secondaryHref}
            className="button-secondary button-secondary-lg"
          >
            {secondaryLabel}
          </Link>
        </div>
      </Reveal>
      <div className="diagonal-band h-16 border-t border-border md:h-24" aria-hidden="true" />
    </section>
  );
}
