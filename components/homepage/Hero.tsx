import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="px-6 pt-16 md:px-16 md:pt-20">
      <div className="soft-gradient-panel border border-border px-6 pb-0 pt-16 text-center md:px-16 md:pt-20">
        <div className="mx-auto flex max-w-[760px] flex-col items-center">
          <h1 className="text-[48px] font-bold leading-[1.06] text-text-primary md:text-[64px]">
            Job hunting is hard.
            <br />
            Your tools shouldn&apos;t be.
          </h1>
          <p className="mt-7 max-w-[660px] text-[20px] font-normal leading-8 text-text-secondary">
            Stop applying blind. JobPilot finds the jobs, researches the companies, and
            gives you everything you need to stand out.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="button-primary button-primary-lg"
            >
              Get Started <span className="button-caret">▶</span>
            </Link>
            <Link
              href="/find-jobs"
              className="button-secondary button-secondary-lg"
            >
              Find Your First Match
            </Link>
          </div>
        </div>
        <div className="mt-24 border-t border-border bg-surface-tertiary px-4 py-16 md:px-8">
          <Image
            src="/images/dashboard-demo.png"
            alt="JobPilot dashboard preview showing job stats, recent activity, and company research activity"
            width={2394}
            height={1208}
            priority
            className="mx-auto w-full max-w-[1130px] rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}
