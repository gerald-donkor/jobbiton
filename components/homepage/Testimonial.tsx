import Image from "next/image";

export function Testimonial() {
  return (
    <section className="px-6 py-24 text-center md:px-16">
      <p className="text-[14px] font-medium uppercase leading-5 text-accent">
        Success Stories
      </p>
      <blockquote className="mx-auto mt-8 max-w-[940px] text-[32px] font-medium leading-[1.35] text-text-slate md:text-[40px]">
        &ldquo;I used to spend my evenings copy-pasting resumes. Now I open my
        dashboard to see interviews waiting. It feels like cheating. Had 3 offers
        on the table simultaneously.&rdquo;
      </blockquote>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Image
          src="/images/user-icon.png"
          alt="Tom Wilson"
          width={48}
          height={48}
          className="rounded-md"
        />
        <div className="text-left">
          <p className="text-[16px] font-semibold leading-6 text-text-primary">
            Tom Wilson
          </p>
          <p className="text-[14px] font-normal leading-5 text-text-secondary">
            Junior Developer
          </p>
        </div>
      </div>
    </section>
  );
}
