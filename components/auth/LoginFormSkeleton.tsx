export function LoginFormSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading sign in options"
      className="grid w-full max-w-[760px] overflow-hidden rounded-xl border border-border bg-surface shadow-[0_14px_30px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)] md:grid-cols-[1.08fr_0.92fr]"
    >
      <div className="soft-gradient-panel flex min-h-[420px] flex-col justify-between border-b border-border px-8 py-8 md:border-r md:border-b-0 md:px-10">
        <div>
          <div className="mb-8 h-7 w-44 animate-pulse rounded-full border border-border bg-surface" />
          <div className="space-y-3">
            <div className="h-12 w-full max-w-[350px] animate-pulse rounded-md bg-surface-secondary" />
            <div className="h-12 w-4/5 max-w-[300px] animate-pulse rounded-md bg-surface-secondary" />
            <div className="h-12 w-3/5 max-w-[220px] animate-pulse rounded-md bg-surface-secondary" />
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-4 w-full max-w-[350px] animate-pulse rounded-md bg-surface-secondary" />
            <div className="h-4 w-5/6 max-w-[300px] animate-pulse rounded-md bg-surface-secondary" />
          </div>
        </div>
      </div>

      <div className="flex min-h-[420px] items-center px-8 py-10 md:px-8">
        <div className="w-full">
          <div className="h-4 w-20 animate-pulse rounded-md bg-surface-secondary" />
          <div className="mt-3 h-8 w-36 animate-pulse rounded-md bg-surface-secondary" />
          <div className="mt-4 h-4 w-56 animate-pulse rounded-md bg-surface-secondary" />
          <div className="mt-6 space-y-3">
            <div className="h-10 w-full animate-pulse rounded-md border border-border bg-surface-secondary" />
            <div className="h-10 w-full animate-pulse rounded-md border border-border bg-surface-secondary" />
          </div>
        </div>
      </div>
    </section>
  );
}
