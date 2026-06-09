export function ResumeSection() {
  return (
    <section className="rounded-xl border border-border bg-surface px-6 py-6 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
      <div>
        <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
          Resume
        </h2>
        <p className="mt-1 text-[14px] font-normal leading-5 text-text-secondary">
          Upload an existing resume to auto fill the profile, or generate a new
          detailed one from your details below.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-border-muted bg-surface-secondary px-6 py-10">
        <div className="mx-auto flex max-w-[360px] flex-col items-center text-center">
          <div className="flex size-10 items-center justify-center rounded-full border border-border bg-surface shadow-[0_2px_8px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)]">
            <span className="upload-cloud" aria-hidden="true" />
          </div>
          <p className="mt-5 text-[14px] font-semibold leading-5 text-text-primary">
            Click to upload or drag and drop
          </p>
          <p className="mt-1 text-[12px] font-normal leading-4 text-text-muted">
            PDF format only. Maximum file size 2MB.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex h-[38px] items-center justify-center rounded-md border border-border bg-surface px-5 text-[16px] font-normal leading-6 text-text-primary shadow-[0_2px_8px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)] transition-colors hover:border-accent"
          >
            Select Resume
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] font-semibold leading-5 text-text-secondary">
          Need a fresh document based on the fields below?
        </p>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-5 text-[13px] font-semibold leading-5 text-accent-foreground shadow-[0_8px_18px_color-mix(in_srgb,var(--color-accent)_22%,transparent)] transition-colors hover:bg-accent-dark"
        >
          <span className="document-icon" aria-hidden="true" />
          Generate Resume from Profile
        </button>
      </div>
    </section>
  );
}
