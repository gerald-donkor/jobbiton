import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollFloat } from "@/components/motion/ScrollFlow";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  copy: string;
  children?: ReactNode;
};

export function PageIntro({ eyebrow, title, copy, children }: PageIntroProps) {
  return (
    <Reveal className="border-b border-border bg-surface px-4 py-8 sm:px-6 md:py-10">
      <div className="mx-auto grid w-full max-w-[1120px] gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <ScrollFloat direction="right" intensity={20}>
          <p className="text-[12px] font-semibold uppercase leading-4 text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-[32px] font-semibold leading-[1.08] text-text-primary sm:text-[40px] md:text-[48px]">
            {title}
          </h1>
        </ScrollFloat>
        <ScrollFloat className="flex flex-col gap-5" direction="left" intensity={20}>
          <p className="max-w-[680px] text-[15px] font-normal leading-7 text-text-secondary sm:text-[16px]">
            {copy}
          </p>
          {children ? <div>{children}</div> : null}
        </ScrollFloat>
      </div>
    </Reveal>
  );
}
