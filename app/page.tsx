import { FinalCta } from "@/components/homepage/FinalCta";
import { Hero } from "@/components/homepage/Hero";
import { ProductFeatures } from "@/components/homepage/ProductFeatures";
import { Testimonial } from "@/components/homepage/Testimonial";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="mx-auto w-full max-w-[1440px] border-x border-border bg-surface text-text-primary">
        <Hero />
        <ProductFeatures />
        <Testimonial />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
