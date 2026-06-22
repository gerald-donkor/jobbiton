import { FinalCta } from "@/components/homepage/FinalCta";
import { Hero } from "@/components/homepage/Hero";
import { JobbitonFlowSections } from "@/components/homepage/JobbitonFlowSections";
import { ProductFeatures } from "@/components/homepage/ProductFeatures";
import { Testimonial } from "@/components/homepage/Testimonial";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { FoldSection, ScrollProgressBand } from "@/components/motion/ScrollFlow";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  const isSignedIn = Boolean(user);
  const primaryHref = isSignedIn ? "/profile" : "/login";
  const primaryLabel = isSignedIn ? "Go to Profile" : "Get Started";
  const navCtaLabel = isSignedIn ? "Go to Profile" : "Start for free";

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar ctaHref={primaryHref} ctaLabel={navCtaLabel} reserveSpace={false} />
      <ScrollProgressBand />
      <main className="mx-auto w-full max-w-[1440px] border-x border-border bg-surface/24 text-text-primary backdrop-blur-[0.5px]">
        <FoldSection index={0}>
          <Hero
            primaryHref={primaryHref}
            primaryLabel={primaryLabel}
            secondaryHref="/find-jobs"
            secondaryLabel={isSignedIn ? "Find Jobs" : "Find Your First Match"}
          />
        </FoldSection>
        <FoldSection index={1}>
          <JobbitonFlowSections />
        </FoldSection>
        <FoldSection index={2}>
          <ProductFeatures />
        </FoldSection>
        <FoldSection index={3}>
          <Testimonial />
        </FoldSection>
        <FoldSection index={4}>
          <FinalCta
            primaryHref={primaryHref}
            primaryLabel={primaryLabel}
            secondaryHref="/find-jobs"
            secondaryLabel={isSignedIn ? "Find Jobs" : "Find Your First Match"}
          />
        </FoldSection>
      </main>
      <Footer />
    </div>
  );
}
