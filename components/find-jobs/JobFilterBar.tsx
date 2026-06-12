import {
  parseMatchFilterValue,
  parseSortValue,
  type MatchFilterValue,
  type SortValue,
} from "@/components/find-jobs/types";

type JobFilterBarProps = {
  filterQuery: string;
  matchFilter: MatchFilterValue;
  sortBy: SortValue;
  onFilterQueryChange: (value: string) => void;
  onMatchFilterChange: (value: MatchFilterValue) => void;
  onSortByChange: (value: SortValue) => void;
};

export function JobFilterBar({
  filterQuery,
  matchFilter,
  sortBy,
  onFilterQueryChange,
  onMatchFilterChange,
  onSortByChange,
}: JobFilterBarProps) {
  return (
    <section className="grid gap-3 lg:grid-cols-[1fr_136px_154px]">
      <label className="flex h-10 items-center gap-3 rounded-md border border-border bg-surface px-3 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_5%,transparent)]">
        <span
          aria-hidden="true"
          className="nav-icon nav-icon-search shrink-0 text-info-muted"
        />
        <input
          type="text"
          value={filterQuery}
          onChange={(event) => onFilterQueryChange(event.target.value)}
          aria-label="Filter jobs"
          placeholder="Filter by company or role..."
          className="min-w-0 flex-1 border-0 bg-transparent text-[14px] font-normal leading-5 text-text-secondary outline-none placeholder:text-text-muted"
        />
      </label>
      <label className="relative block">
        <span className="sr-only">Match filter</span>
        <select
          value={matchFilter}
          onChange={(event) =>
            onMatchFilterChange(parseMatchFilterValue(event.target.value))
          }
          className="h-10 w-full appearance-none rounded-md border border-border bg-surface px-3 pr-8 text-[14px] font-normal leading-5 text-text-primary shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_5%,transparent)] outline-none transition-colors hover:border-accent focus:border-accent focus:ring-1 focus:ring-accent"
        >
          <option value="all">All Matches</option>
          <option value="high">High Match</option>
          <option value="low">Low Match</option>
        </select>
        <span
          aria-hidden="true"
          className="find-jobs-caret pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-primary"
        />
      </label>
      <label className="relative block">
        <span className="sr-only">Sort jobs</span>
        <select
          value={sortBy}
          onChange={(event) => onSortByChange(parseSortValue(event.target.value))}
          className="h-10 w-full appearance-none rounded-md border border-border bg-surface px-3 pr-9 text-[14px] font-normal leading-5 text-text-primary shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_5%,transparent)] outline-none transition-colors hover:border-accent focus:border-accent focus:ring-1 focus:ring-accent"
        >
          <option value="score">Match Score</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <span
          aria-hidden="true"
          className="find-jobs-caret pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-primary"
        />
      </label>
    </section>
  );
}
