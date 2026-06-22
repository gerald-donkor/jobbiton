"use client";

import type { ChangeEvent } from "react";
import { ProcessOverlay } from "@/components/loading/ProcessOverlay";
import { Button } from "@/components/ui/button";
import { RESUME_ACCEPT } from "@/lib/resume-files";

type ResumeSectionProps = {
  resumePdfUrl: string;
  resumeInputKey: number;
  resumeName: string;
  resumePreviewUrl: string;
  isResumeSaved: boolean;
  isResumeUploading: boolean;
  resumeUploadMessage: string;
  isResumeUploadSuccess: boolean;
  canEmbedResume: boolean;
  resumePreviewText: string;
  isResumePreviewLoading: boolean;
  resumePreviewMessage: string;
  canExtractResume: boolean;
  isExtracting: boolean;
  extractMessage: string;
  isGenerating: boolean;
  generateMessage: string;
  isGenerateSuccess: boolean;
  isRemoving: boolean;
  removeMessage: string;
  isRemoveSuccess: boolean;
  onResumeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onExtractResume: () => void;
  onGenerateResume: () => void;
  onRemoveResume: () => void;
};

export function ResumeSection({
  resumePdfUrl,
  resumeInputKey,
  resumeName,
  resumePreviewUrl,
  isResumeSaved,
  isResumeUploading,
  resumeUploadMessage,
  isResumeUploadSuccess,
  canEmbedResume,
  resumePreviewText,
  isResumePreviewLoading,
  resumePreviewMessage,
  canExtractResume,
  isExtracting,
  extractMessage,
  isGenerating,
  generateMessage,
  isGenerateSuccess,
  isRemoving,
  removeMessage,
  isRemoveSuccess,
  onResumeChange,
  onExtractResume,
  onGenerateResume,
  onRemoveResume,
}: ResumeSectionProps) {
  const resumeLabel = resumeName || (resumePdfUrl ? "Existing resume saved" : "");
  const hasResume = Boolean(resumeLabel);
  const savedResumeUrl = resumePdfUrl ? "/api/resume/current" : "";
  const visibleResumeUrl = resumePreviewUrl || savedResumeUrl;
  const isExtractMessageSuccess =
    extractMessage === "Resume extracted. Review the fields below before saving.";
  const isResumeStatusSuccess = isResumeUploading || isResumeUploadSuccess;
  const activeOverlay = isExtracting
    ? {
        variant: "resume-extract" as const,
        title: "Extracting resume details",
        description:
          "Reading the resume, identifying profile fields, and preparing editable suggestions.",
        steps: [
          {
            title: "Reading document",
            detail: "Extracting readable text from the selected resume.",
          },
          {
            title: "Finding profile signals",
            detail: "Locating skills, education, work history, and contact data.",
          },
          {
            title: "Preparing fields",
            detail: "Filling the draft form while preserving your edits.",
          },
        ],
      }
    : isGenerating
      ? {
          variant: "resume-generate" as const,
          title: "Generating your resume",
          description:
            "Using your profile details to build a polished resume document.",
          steps: [
            {
              title: "Structuring sections",
              detail: "Arranging your profile into a clean resume outline.",
            },
            {
              title: "Writing role bullets",
              detail: "Polishing responsibilities and measurable impact.",
            },
            {
              title: "Building file",
              detail: "Rendering the PDF and saving it as your active resume.",
            },
          ],
        }
      : isResumeUploading
        ? {
            variant: "resume-upload" as const,
            title: "Uploading your resume",
            description:
              "Saving the file securely and preparing it for preview and extraction.",
            steps: [
              {
                title: "Checking file",
                detail: "Validating file type and size before upload.",
              },
              {
                title: "Saving resume",
                detail: "Uploading the document to secure storage.",
              },
              {
                title: "Refreshing preview",
                detail: "Updating the profile page with the saved resume.",
              },
            ],
          }
        : isRemoving
          ? {
              variant: "resume-upload" as const,
              title: "Removing resume",
              description:
                "Clearing the saved file and resetting resume-related profile state.",
              steps: [
                {
                  title: "Revoking file",
                  detail: "Removing the active resume from storage.",
                },
                {
                  title: "Updating profile",
                  detail: "Clearing the saved resume link from your profile.",
                },
                {
                  title: "Refreshing page",
                  detail: "Returning the resume panel to a ready state.",
                },
              ],
            }
          : null;

  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-surface px-4 py-5 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)] sm:px-6 sm:py-6">
      {activeOverlay ? (
        <ProcessOverlay active={true} {...activeOverlay} />
      ) : null}
      <div>
        <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
          Resume
        </h2>
        <p className="mt-1 text-[14px] font-normal leading-5 text-text-secondary">
          Upload an existing resume to auto fill the profile, or generate a new
          detailed one from your details below.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-border-muted bg-surface-secondary px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto flex max-w-[360px] flex-col items-center text-center">
          <input
            key={resumeInputKey}
            id="resume"
            name="resume"
            type="file"
            accept={RESUME_ACCEPT}
            className="sr-only"
            onChange={onResumeChange}
          />
          <div className="flex size-10 items-center justify-center rounded-full border border-border bg-surface shadow-[0_2px_8px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)]">
            <span className="upload-cloud" aria-hidden="true" />
          </div>
          {hasResume ? (
            <a
              href={visibleResumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 text-[14px] font-semibold leading-5 text-text-primary transition-colors hover:text-accent"
            >
              View current resume
            </a>
          ) : (
            <p className="mt-5 text-[14px] font-semibold leading-5 text-text-primary">
              Click to upload or drag and drop
            </p>
          )}
          {hasResume ? null : (
            <p className="mt-1 text-[12px] font-normal leading-4 text-text-muted">
              PDF, DOC, DOCX, TXT, or RTF. Maximum file size 2MB.
            </p>
          )}
          <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <label
              htmlFor="resume"
              className="inline-flex h-[38px] items-center justify-center rounded-md border border-border bg-surface px-5 text-[16px] font-normal leading-6 text-text-primary shadow-[0_2px_8px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)] transition-colors hover:border-accent"
            >
              Select Resume
            </label>
            {hasResume ? (
              <Button
                disabled={isRemoving || isResumeUploading}
                loading={isRemoving}
                loadingLabel="Removing..."
                variant="secondary"
                size="sm"
                className="text-error hover:border-error hover:text-error"
                onClick={onRemoveResume}
              >
                Remove resume
              </Button>
            ) : null}
          </div>
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
            isResumeStatusSuccess ? "text-success" : "text-error"
          }`}
        >
          {resumeUploadMessage ||
            (isResumeUploading
              ? "Uploading resume..."
              : isResumeSaved
                ? "Resume uploaded successfully."
                : "Resume selected. Uploading now...")}
        </p>
      ) : null}

      {removeMessage ? (
        <p
          className={`mt-3 text-[13px] font-semibold leading-5 ${
            isRemoveSuccess ? "text-success" : "text-error"
          }`}
        >
          {removeMessage}
        </p>
      ) : null}

      {canExtractResume ? (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[14px] font-semibold leading-5 text-text-primary">
              Fill profile from resume
            </p>
            <p className="mt-1 text-[12px] font-normal leading-4 text-text-secondary">
              Review the extracted details before saving your profile.
            </p>
          </div>
          <Button
            disabled={isExtracting}
            loading={isExtracting}
            loadingLabel="Extracting..."
            variant="primary"
            size="sm"
            className="w-full shrink-0 sm:w-auto"
            onClick={onExtractResume}
          >
            Extract from Resume
          </Button>
        </div>
      ) : null}

      {extractMessage ? (
        <p
          className={`mt-3 text-[13px] font-semibold leading-5 ${
            isExtractMessageSuccess ? "text-success" : "text-error"
          }`}
        >
          {extractMessage}
        </p>
      ) : null}

      {visibleResumeUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 truncate text-[13px] font-semibold leading-5 text-text-primary">
              {resumeLabel}
            </p>
            <a
              href={visibleResumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-8 w-full shrink-0 items-center justify-center rounded-md border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold leading-4 text-text-primary transition-colors hover:border-accent hover:text-accent sm:w-auto"
            >
              View full resume
            </a>
          </div>
          {canEmbedResume ? (
            <iframe
              src={visibleResumeUrl}
              title="Resume preview"
              className="h-[360px] w-full bg-surface-secondary"
            />
          ) : resumePreviewText || isResumePreviewLoading || resumePreviewMessage ? (
            <div className="bg-surface-secondary px-6 py-6">
              {isResumePreviewLoading ? (
                <p className="text-center text-[13px] font-semibold leading-5 text-text-secondary">
                  Loading resume preview...
                </p>
              ) : null}
              {resumePreviewMessage ? (
                <p className="text-center text-[13px] font-semibold leading-5 text-text-secondary">
                  {resumePreviewMessage}
                </p>
              ) : null}
              {resumePreviewText ? (
                <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-surface p-5 text-left text-[13px] font-normal leading-6 text-text-primary">
                  {resumePreviewText}
                </pre>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-surface-secondary px-6 py-12 text-center">
              <p className="text-[14px] font-semibold leading-5 text-text-primary">
                Preview unavailable for this file type
              </p>
              <p className="mt-1 max-w-[420px] text-[12px] font-normal leading-4 text-text-secondary">
                Open the resume in a new tab to view or download it with the right app.
              </p>
              <a
                href={visibleResumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-[38px] items-center justify-center rounded-md border border-border bg-surface px-4 text-[13px] font-semibold leading-5 text-text-primary transition-colors hover:border-accent hover:text-accent"
              >
                Open resume
              </a>
            </div>
          )}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] font-semibold leading-5 text-text-secondary">
          Need a fresh document based on the fields below?
        </p>
        <Button
          disabled={isGenerating}
          loading={isGenerating}
          loadingLabel="Generating..."
          variant="primary"
          size="lg"
          onClick={onGenerateResume}
        >
          <span className="document-icon" aria-hidden="true" />
          Generate Resume from Profile
        </Button>
      </div>
      {generateMessage ? (
        <p
          className={`mt-3 text-[13px] font-semibold leading-5 ${
            isGenerateSuccess ? "text-success" : "text-error"
          }`}
        >
          {generateMessage}
        </p>
      ) : null}
    </section>
  );
}
