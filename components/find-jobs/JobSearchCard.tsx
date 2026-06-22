import { Button } from "@/components/ui/button";

type JobSearchCardProps = {
  jobTitle: string;
  location: string;
  isSearching: boolean;
  feedback: {
    tone: "error" | "success";
    text: string;
  } | null;
  onJobTitleChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: () => Promise<void>;
};

export function JobSearchCard({
  jobTitle,
  location,
  isSearching,
  feedback,
  onJobTitleChange,
  onLocationChange,
  onSearch,
}: JobSearchCardProps) {
  return (
    <section className="rounded-xl border border-border bg-surface px-4 py-5 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)] sm:px-6 sm:py-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_122px] lg:items-end">
        <label className="block">
          <span className="mb-2 block text-[12px] font-semibold leading-4 text-text-secondary">
            JOB TITLE
          </span>
          <span className="flex h-10 items-center gap-3 rounded-md border border-border bg-surface px-3 shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_5%,transparent)] focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
            <span
              aria-hidden="true"
              className="nav-icon nav-icon-search shrink-0 text-info-muted"
            />
            <input
              type="text"
              value={jobTitle}
              placeholder="Frontend Engineer"
              aria-label="Job title"
              onChange={(event) => onJobTitleChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void onSearch();
                }
              }}
              className="min-w-0 flex-1 border-0 bg-transparent text-[14px] font-normal leading-5 text-text-primary outline-none placeholder:text-text-muted"
            />
          </span>
        </label>
        <label className="block">
          <span className="mb-2 block text-[12px] font-semibold leading-4 text-text-secondary">
            LOCATION
          </span>
          <span className="flex h-10 items-center rounded-md border border-border bg-surface px-3 shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_5%,transparent)] focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
            <input
              type="text"
              value={location}
              placeholder="Remote, New York..."
              aria-label="Location"
              onChange={(event) => onLocationChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void onSearch();
                }
              }}
              className="min-w-0 flex-1 border-0 bg-transparent text-[14px] font-normal leading-5 text-text-primary outline-none placeholder:text-text-muted"
            />
          </span>
        </label>
        <Button
          onClick={() => {
            void onSearch();
          }}
          disabled={isSearching}
          loading={isSearching}
          loadingLabel="Searching..."
          variant="primary"
          size="md"
          className="w-full lg:w-auto"
        >
          <span
            aria-hidden="true"
            className="nav-icon nav-icon-search shrink-0 text-accent-foreground"
          />
          Find Jobs
        </Button>
      </div>
      {feedback ? (
        <div
          className={`mt-4 flex min-h-10 items-center gap-2 rounded-md border px-4 py-3 text-[14px] font-medium leading-5 ${
            feedback.tone === "success"
              ? "border-success-light bg-success-lightest text-success-foreground"
              : "border-error bg-surface text-error"
          }`}
        >
          <span
            aria-hidden="true"
            className={
              feedback.tone === "success"
                ? "text-warning"
                : "text-error"
            }
          >
            {feedback.tone === "success" ? "*" : "!"}
          </span>
          <p>{feedback.text}</p>
        </div>
      ) : null}
    </section>
  );
}
