import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";

const footerLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Condition", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="bg-surface/82 backdrop-blur-md">
      <div className="mx-auto flex min-h-40 w-full max-w-[1440px] flex-col items-start justify-between gap-8 border-x border-border px-6 py-12 md:flex-row md:items-center md:px-16">
        <BrandLogo />
        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-8 md:gap-12">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="supporting-text-tone text-[16px] font-normal leading-6 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
