"use client";

import type { ChangeEvent } from "react";

type ResumeSectionProps = {
  resumePdfUrl: string;
  resumeName: string;
  resumePreviewUrl: string;
  isResumeSaved: boolean;
  onResumeChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ResumeSection({
  resumePdfUrl,
  resumeName,
  resumePreviewUrl,
  isResumeSaved,
  onResumeChange,
}: ResumeSectionProps) {
  const resumeLabel = resumeName || (resumePdfUrl ? "Existing resume saved" : "");
  const hasResume = Boolean(resumeLabel);
  const savedResumeUrl = resumePdfUrl ? "/api/resume/current" : "";
  const visibleResumeUrl = resumePreviewUrl || savedResumeUrl;

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
          <input
            id="resume"
            name="resume"
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={onResumeChange}
          />
          <div className="flex size-10 items-center justify-center rounded-full border border-border bg-surface shadow-[0_2px_8px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)]">
            <span className="upload-cloud" aria-hidden="true" />
          </div>
          <p className="mt-5 text-[14px] font-semibold leading-5 text-text-primary">
            Click to upload or drag and drop
          </p>
          <p className="mt-1 text-[12px] font-normal leading-4 text-text-muted">
            PDF format only. Maximum file size 2MB.
          </p>
          <label
            htmlFor="resume"
            className="mt-4 inline-flex h-[38px] items-center justify-center rounded-md border border-border bg-surface px-5 text-[16px] font-normal leading-6 text-text-primary shadow-[0_2px_8px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)] transition-colors hover:border-accent"
          >
            Select Resume
          </label>
          {hasResume ? (
            <p className="mt-3 max-w-full truncate text-[12px] font-medium leading-4 text-text-secondary">
              {resumeLabel}
            </p>
          ) : null}
        </div>
      </div>

      {hasResume ? (
        <p
          className={`mt-3 text-[14px] font-semibold leading-5 ${
            isResumeSaved ? "text-success" : "text-text-secondary"
          }`}
        >
          {isResumeSaved
            ? "Resume uploaded successfully."
            : "Resume selected. Save profile to upload it."}
        </p>
      ) : null}

      {visibleResumeUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
            <p className="min-w-0 truncate text-[13px] font-semibold leading-5 text-text-primary">
              {resumeLabel}
            </p>
            <a
              href={visibleResumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-md border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold leading-4 text-text-primary transition-colors hover:border-accent hover:text-accent"
            >
              View full resume
            </a>
          </div>
          <iframe
            src={visibleResumeUrl}
            title="Resume preview"
            className="h-[360px] w-full bg-surface-secondary"
          />
        </div>
      ) : null}

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
