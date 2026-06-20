type FeatureTextProps = {
  title: string;
  copy: string;
  active?: boolean;
};

export function FeatureText({ title, copy, active = false }: FeatureTextProps) {
  return (
    <article className="border-b border-border px-6 py-7 last:border-b-0 sm:px-8 sm:py-9 md:px-16">
      <div className={active ? "border-l-2 border-success pl-6 sm:pl-8" : "pl-6 sm:pl-8"}>
        <h3 className="text-[20px] font-semibold leading-7 text-text-slate sm:text-[22px] sm:leading-8">
          {title}
        </h3>
        <p className="mt-3 max-w-[650px] text-[17px] font-normal leading-7 text-text-secondary sm:text-[20px] sm:leading-8">
          {copy}
        </p>
      </div>
    </article>
  );
}
