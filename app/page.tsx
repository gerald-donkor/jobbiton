import { FinalCta } from "@/components/homepage/FinalCta";
import { Hero } from "@/components/homepage/Hero";
import { JobbitonFlowSections } from "@/components/homepage/JobbitonFlowSections";
import { ProductFeatures } from "@/components/homepage/ProductFeatures";
import { Testimonial } from "@/components/homepage/Testimonial";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgressBand } from "@/components/motion/ScrollFlow";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  const isSignedIn = Boolean(user);
  const primaryHref = isSignedIn ? "/profile" : "/login";
  const primaryLabel = isSignedIn ? "Go to Profile" : "Get Started";
  const navCtaLabel = isSignedIn ? "Go to Profile" : "Start for free";

  return (
    <div className="min-h-screen bg-surface">
      <Navbar ctaHref={primaryHref} ctaLabel={navCtaLabel} />
      <ScrollProgressBand />
      <main className="mx-auto w-full max-w-[1440px] border-x border-border bg-surface text-text-primary">
        <Hero
          primaryHref={primaryHref}
          primaryLabel={primaryLabel}
          secondaryHref="/find-jobs"
          secondaryLabel={isSignedIn ? "Find Jobs" : "Find Your First Match"}
        />
        <JobbitonFlowSections />
        <ProductFeatures />
        <Testimonial />
        <FinalCta
          primaryHref={primaryHref}
          primaryLabel={primaryLabel}
          secondaryHref="/find-jobs"
          secondaryLabel={isSignedIn ? "Find Jobs" : "Find Your First Match"}
        />
      </main>
      <Footer />
    </div>
  );
}
