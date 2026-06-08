type FeatureTextProps = {
  title: string;
  copy: string;
  active?: boolean;
};

export function FeatureText({ title, copy, active = false }: FeatureTextProps) {
  return (
    <article className="border-b border-border px-8 py-9 last:border-b-0 md:px-16">
      <div className={active ? "border-l-2 border-accent pl-8" : "pl-8"}>
        <h3 className="text-[22px] font-semibold leading-8 text-text-slate">
          {title}
        </h3>
        <p className="mt-3 max-w-[650px] text-[20px] font-normal leading-8 text-text-secondary">
          {copy}
        </p>
      </div>
    </article>
  );
}
