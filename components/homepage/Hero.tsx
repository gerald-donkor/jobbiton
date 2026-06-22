import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { ScrollFloat } from "@/components/motion/ScrollFlow";

type HeroProps = {
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function Hero({
  primaryHref = "/login",
  primaryLabel = "Get Started",
  secondaryHref = "/find-jobs",
  secondaryLabel = "Find Your First Match",
}: HeroProps) {
  return (
    <section className="px-4 pt-8 sm:px-6 sm:pt-12 md:px-16 md:pt-20">
      <div className="soft-gradient-panel border border-border px-5 pb-0 pt-12 text-center sm:px-6 sm:pt-16 md:px-16 md:pt-20">
        <RevealGroup className="mx-auto flex max-w-[760px] flex-col items-center">
          <RevealItem>
          <h1 className="text-[40px] font-bold leading-[1.06] text-text-primary sm:text-[48px] md:text-[64px]">
            Job hunting is hard.
            <br />
            Your tools shouldn&apos;t be.
          </h1>
          </RevealItem>
          <RevealItem>
          <p className="mt-6 max-w-[660px] text-[18px] font-normal leading-7 text-text-secondary md:mt-7 md:text-[20px] md:leading-8">
            Stop applying blind. Jobbiton finds the jobs, researches the companies, and
            gives you everything you need to stand out.
          </p>
          </RevealItem>
          <RevealItem>
          <div className="mt-8 flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-center">
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
          </RevealItem>
        </RevealGroup>
        <Reveal className="mt-14 overflow-hidden border-t border-border bg-surface-tertiary px-3 py-8 sm:mt-20 sm:px-4 sm:py-12 md:mt-24 md:px-8 md:py-16">
          <ScrollFloat direction="up" intensity={48} scale>
            <Image
              src="/images/dashboard-demo.png"
              alt="Jobbiton dashboard preview showing job stats, recent activity, and company research activity"
              width={2394}
              height={1208}
              priority
              className="mx-auto w-full max-w-[1130px] rounded-xl"
            />
          </ScrollFloat>
        </Reveal>
      </div>
    </section>
  );
}
