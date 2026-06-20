import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { ScrollFloat } from "@/components/motion/ScrollFlow";

const impactStats = [
  { value: "30 days", label: "job history tracked" },
  { value: "50-100%", label: "match score buckets" },
  { value: "7 days", label: "research activity window" },
];

const showcaseItems = [
  {
    title: "Profile launchpad",
    tag: "Onboarding",
    year: "Step 01",
    copy: "Build one complete profile from your resume, then reuse it for every search, match, and company brief.",
    href: "/profile",
  },
  {
    title: "Matched job search",
    tag: "Discovery",
    year: "Step 02",
    copy: "Search roles by title and location while Jobbiton scores each listing against your actual skills.",
    href: "/find-jobs",
  },
  {
    title: "Research-ready decisions",
    tag: "Preparation",
    year: "Step 03",
    copy: "Open a job, inspect your fit, research the company, and apply with context instead of guesswork.",
    href: "/dashboard",
  },
];

const services = [
  {
    number: "01",
    title: "Resume intelligence",
    copy: "Upload, extract, edit, and generate a clean resume without letting the agent mutate your profile behind your back.",
    cta: "Set up profile",
    href: "/profile",
  },
  {
    number: "02",
    title: "Job matching",
    copy: "Every discovered role gets a score, match reason, matched skills, and missing skills so you can choose deliberately.",
    cta: "Find jobs",
    href: "/find-jobs",
  },
  {
    number: "03",
    title: "Company research",
    copy: "For any role that looks promising, Jobbiton researches the employer and turns it into interview-ready context.",
    cta: "Review dashboard",
    href: "/dashboard",
  },
];

const processSteps = [
  {
    step: "Step 01",
    title: "Create your profile",
    copy: "Start with a resume upload or fill the profile manually. This becomes the single source for matching.",
  },
  {
    step: "Step 02",
    title: "Search and score roles",
    copy: "Run targeted searches and let the agent save the jobs with scores, reasons, and skill gaps.",
  },
  {
    step: "Step 03",
    title: "Research the companies",
    copy: "Generate a structured company dossier only when a role deserves deeper preparation.",
  },
  {
    step: "Step 04",
    title: "Apply with context",
    copy: "Use the dashboard, job details, and company brief to make the next application sharper.",
  },
];

const faqs = [
  {
    question: "Does Jobbiton apply to jobs for me?",
    answer:
      "No. It prepares the search, scoring, and company research so you can decide where to apply.",
  },
  {
    question: "Can I change my profile after matching jobs?",
    answer:
      "Yes. Your profile is editable at any time, and future searches use the updated information.",
  },
  {
    question: "What happens when company research is thin?",
    answer:
      "The research flow falls back gracefully and still builds a useful briefing from the job and profile context.",
  },
];

export function JobbitonFlowSections() {
  return (
    <section>
      <Reveal className="border-y border-border px-4 py-14 sm:px-6 md:px-16 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div>
            <p className="text-[13px] font-semibold uppercase leading-5 text-accent">
              Launchpad for focused applications
            </p>
            <h2 className="mt-5 max-w-[620px] text-[40px] font-semibold leading-[1.05] text-text-primary sm:text-[54px] md:text-[64px]">
              Build fast. Apply smarter.
            </h2>
          </div>
          <p className="max-w-[620px] text-[18px] font-normal leading-8 text-text-secondary">
            Jobbiton moves your search through proof, progress, research,
            decisions, and action. The rhythm is clear: profile, search,
            research, dashboard, then apply with context.
          </p>
        </div>
      </Reveal>

      <RevealGroup className="grid border-b border-border md:grid-cols-3">
        {impactStats.map((stat) => (
          <RevealItem key={stat.label} className="border-b border-border last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
            <ScrollFloat className="px-6 py-9 md:px-10 md:py-12" direction="up" intensity={24}>
            <p className="text-[38px] font-semibold leading-none text-text-primary md:text-[48px]">
              {stat.value}
            </p>
            <p className="mt-3 text-[14px] font-medium leading-5 text-text-secondary">
              {stat.label}
            </p>
            </ScrollFloat>
          </RevealItem>
        ))}
      </RevealGroup>

      <div id="showcase" className="grid border-b border-border lg:grid-cols-[0.78fr_1.22fr]">
        <Reveal className="border-b border-border px-6 py-12 sm:px-8 md:px-16 md:py-20 lg:border-b-0 lg:border-r">
          <p className="text-[13px] font-semibold uppercase leading-5 text-accent">
            Featured flows
          </p>
          <h2 className="mt-5 text-[38px] font-semibold leading-[1.08] text-text-primary sm:text-[48px]">
            Your search, broken into the right moves.
          </h2>
        </Reveal>
        <RevealGroup className="grid sm:grid-cols-2 xl:grid-cols-3">
          {showcaseItems.map((item) => (
            <RevealItem key={item.title}>
              <ScrollFloat
                className="h-full"
                direction={item.year === "Step 02" ? "up" : "right"}
                intensity={item.year === "Step 02" ? 24 : 30}
              >
                <Link
                  href={item.href}
                  className="group flex h-full min-h-[300px] flex-col justify-between border-b border-border px-6 py-7 transition-colors hover:bg-surface-secondary sm:border-r xl:border-b-0"
                >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium leading-4 text-text-muted">
                    <span className="rounded-full border border-border px-2.5 py-1 text-text-secondary">
                      {item.tag}
                    </span>
                    <span>{item.year}</span>
                  </div>
                  <h3 className="mt-8 text-[24px] font-semibold leading-8 text-text-primary transition-colors group-hover:text-accent">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-[15px] font-normal leading-6 text-text-secondary">
                    {item.copy}
                  </p>
                </div>
                <span className="mt-8 text-[14px] font-semibold leading-5 text-accent">
                  Open flow
                </span>
                </Link>
              </ScrollFloat>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      <Reveal className="grid border-b border-border lg:grid-cols-2">
        <div className="overflow-hidden bg-surface-muted px-4 py-10 sm:px-6 md:px-12">
          <ScrollFloat className="flex items-center justify-center" direction="left" intensity={46} scale>
            <Image
              src="/images/dashboard-demo.png"
              alt="Jobbiton dashboard with analytics cards and charts"
              width={2394}
              height={1208}
              className="w-full max-w-[720px] rounded-xl border border-border shadow-[0_18px_48px_color-mix(in_srgb,var(--color-overlay)_14%,transparent)]"
            />
          </ScrollFloat>
        </div>
        <div className="px-6 py-12 sm:px-8 md:px-16 md:py-20">
          <p className="text-[13px] font-semibold uppercase leading-5 text-accent">
            Operational proof
          </p>
          <h2 className="mt-5 text-[38px] font-semibold leading-[1.08] text-text-primary sm:text-[48px]">
            A dashboard that keeps the whole search visible.
          </h2>
          <p className="mt-6 text-[17px] font-normal leading-8 text-text-secondary">
            Instead of a decorative portfolio grid, Jobbiton shows the work:
            jobs found, match quality, companies researched, recent activity,
            and charted momentum.
          </p>
        </div>
      </Reveal>

      <div id="services" className="border-b border-border">
        <Reveal className="px-6 py-12 sm:px-8 md:px-16 md:py-20">
          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <h2 className="text-[38px] font-semibold leading-[1.08] text-text-primary sm:text-[48px]">
              Built around the jobs workflow.
            </h2>
            <p className="max-w-[720px] text-[17px] font-normal leading-8 text-text-secondary">
              Jobbiton&apos;s capability flow maps every section to a real page
              and a real action in the app, so the story never drifts away
              from the product.
            </p>
          </div>
        </Reveal>
        <RevealGroup>
          {services.map((service) => (
            <RevealItem key={service.number}>
              <ScrollFloat direction="right" intensity={22}>
              <article className="grid border-t border-border px-6 py-8 sm:px-8 md:px-16 lg:grid-cols-[160px_1fr_auto] lg:items-center lg:gap-10">
                <p className="text-[14px] font-semibold leading-5 text-accent">
                  {service.number}.
                </p>
                <div className="mt-4 lg:mt-0">
                  <h3 className="text-[28px] font-semibold leading-9 text-text-primary">
                    {service.title}
                  </h3>
                  <p className="mt-3 max-w-[760px] text-[15px] font-normal leading-6 text-text-secondary">
                    {service.copy}
                  </p>
                </div>
                <Link
                  href={service.href}
                  className="button-secondary button-secondary-lg mt-6 w-fit lg:mt-0"
                >
                  {service.cta}
                </Link>
              </article>
              </ScrollFloat>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      <div id="process" className="grid border-b border-border lg:grid-cols-[0.78fr_1.22fr]">
        <Reveal className="border-b border-border px-6 py-12 sm:px-8 md:px-16 md:py-20 lg:border-b-0 lg:border-r">
          <p className="text-[13px] font-semibold uppercase leading-5 text-accent">
            From profile to application
          </p>
          <h2 className="mt-5 text-[38px] font-semibold leading-[1.08] text-text-primary sm:text-[48px]">
            Four steps, one calm search.
          </h2>
        </Reveal>
        <RevealGroup>
          {processSteps.map((item) => (
            <RevealItem key={item.step}>
              <ScrollFloat direction="left" intensity={22}>
              <article className="border-b border-border px-6 py-8 last:border-b-0 sm:px-8 md:px-12">
                <p className="text-[13px] font-semibold uppercase leading-5 text-accent">
                  {item.step}
                </p>
                <h3 className="mt-3 text-[26px] font-semibold leading-8 text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-[720px] text-[15px] font-normal leading-6 text-text-secondary">
                  {item.copy}
                </p>
              </article>
              </ScrollFloat>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      <div id="faq" className="grid border-b border-border lg:grid-cols-[0.78fr_1.22fr]">
        <Reveal className="border-b border-border px-6 py-12 sm:px-8 md:px-16 md:py-20 lg:border-b-0 lg:border-r">
          <p className="text-[13px] font-semibold uppercase leading-5 text-accent">
            FAQs
          </p>
          <h2 className="mt-5 text-[38px] font-semibold leading-[1.08] text-text-primary sm:text-[48px]">
            What candidates usually ask first.
          </h2>
        </Reveal>
        <RevealGroup>
          {faqs.map((item) => (
            <RevealItem key={item.question}>
              <ScrollFloat direction="up" intensity={18}>
              <details className="group border-b border-border px-6 py-7 last:border-b-0 sm:px-8 md:px-12">
                <summary className="flex items-center justify-between gap-6 text-[20px] font-semibold leading-7 text-text-primary">
                  {item.question}
                  <span className="text-accent transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-[760px] text-[15px] font-normal leading-6 text-text-secondary">
                  {item.answer}
                </p>
              </details>
              </ScrollFloat>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
