import Link from "next/link";

export function FinalCta() {
  return (
    <section>
      <div className="diagonal-band h-24 border-y border-border" aria-hidden="true" />
      <div className="soft-gradient-panel px-6 py-20 text-center md:px-16 md:py-28">
        <h2 className="mx-auto max-w-[860px] text-[48px] font-bold leading-[1.08] text-text-primary md:text-[64px]">
          Your next job search can feel a lot less overwhelming
        </h2>
        <p className="supporting-text-tone mt-8 text-[20px] font-normal leading-8">
          Set up your profile, upload your resume, and start finding matches in
          minutes.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
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
      <div className="diagonal-band h-24 border-t border-border" aria-hidden="true" />
    </section>
  );
}
