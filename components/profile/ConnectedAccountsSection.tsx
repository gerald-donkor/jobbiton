export function ConnectedAccountsSection() {
  return (
    <section className="rounded-xl border border-border bg-surface px-6 py-6 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
      <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
        Connected Accounts
      </h2>
      <p className="mt-1 text-[14px] font-normal leading-5 text-text-secondary">
        Connect your LinkedIn to let the agent handle manual apply with
        LinkedIn workflows.
      </p>

      <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-info-lightest">
            <span className="linkedin-mini-mark" aria-hidden="true">
              in
            </span>
          </div>
          <div>
            <p className="text-[14px] font-medium leading-5 text-text-primary">
              LinkedIn
            </p>
            <p className="text-[12px] font-normal leading-4 text-text-muted">
              Not connected
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-[38px] items-center justify-center rounded-md bg-linkedin px-4 text-[16px] font-normal leading-6 text-linkedin-foreground transition-colors hover:bg-info-dark"
        >
          Connect LinkedIn
        </button>
      </div>
    </section>
  );
}
