# Memory — Feature 11 Find Jobs Stabilization

Last updated: 2026-06-12 22:10 GMT

## What was built

- Completed Phase 3 Feature 11: Filter + Sort + Pagination for `/find-jobs`.
- Added server-side saved-job listing in `app/find-jobs/page.tsx` with user-scoped InsForge queries, exact counts, text search, match filtering, sorting, and 20-row pagination.
- Added `components/find-jobs/types.ts` for Find Jobs filter/sort value types, list result typing, and parser helpers.
- Updated `components/find-jobs/FindJobsPageContent.tsx` and `components/find-jobs/FindJobsClient.tsx` so saved jobs are loaded server-side while filter, sort, pagination, and live search state are URL-driven from the client wrapper.
- Updated `components/find-jobs/JobFilterBar.tsx` to use the shared Find Jobs parser helpers instead of local UI type exports.
- Improved `agent/matcher.ts` fallback matching with skill aliases, word/phrase boundaries, title-token overlap, skill coverage, and a lower true no-match floor so relevant searches can produce High Match rows even without OpenRouter.
- Updated `agent/adzuna.ts`, `agent/types.ts`, and `app/api/agent/find/route.ts` so successful searches return the created `agent_runs.id`.
- Fixed stale saved-search leakage: `/find-jobs` now writes that run id to the `run` URL param and scopes saved DB listings to the active run across refresh, filter, sort, and pagination changes.
- Updated `context/progress-tracker.md` and `context/ui-registry.md` with the Feature 11 behavior and run-scoping rules.

## Decisions made

- `/find-jobs` loads saved jobs in the route Server Component; the client component should not fetch saved job rows directly.
- Filter state is URL-backed: `q`, `match=high|low`, `sort=score|newest|oldest`, `page`, and `run={agent_runs.id}`.
- Search context is scoped by `run`; broad all-user saved-job listing should not be used in the current Find Jobs table unless a separate saved-jobs archive mode is intentionally designed.
- A successful Adzuna search keeps the instant UX by temporarily rendering returned jobs immediately, then navigates to `/find-jobs?run={runId}` so refreshes and later control changes stay in the same search context.
- Existing saved jobs are not automatically rescored. Matcher improvements apply to newly discovered jobs unless a future rescore flow is added.

## Problems solved

- High Match no longer empties purely because fallback matching missed aliases like React/React.js, Next/Next.js, Node/Node.js, or Postgres/PostgreSQL.
- High Match plus sort controls now apply to temporary latest-search rows, not only server-loaded rows.
- Saved-job query failures now show a safe inline error instead of silently looking like an empty result set.
- Text search is tokenized before building the InsForge OR filter so punctuation-heavy input is less likely to create malformed query syntax.
- Older Backend Developer results no longer reappear after refreshing or after searching for Frontend Developer, because the table is scoped to the active `agent_runs.id`.

## Current state

- Phase 1 Foundation is complete.
- Phase 2 Features 05, 06, 07, and 08 are complete.
- Phase 3 Features 09, 10, and 11 are complete.
- `/find-jobs` searches Adzuna, saves discovered jobs, lists saved jobs from InsForge, supports URL-backed text filtering, High/Low Match filtering, score/newest/oldest sorting, exact result counts, and 20-per-page pagination.
- `/find-jobs` saved listings are scoped to the active `run` URL param, with latest completed run fallback only when no `run` param exists.
- `/find-jobs/[id]` is still a protected placeholder; live job rows link there, but the real Job Details UI has not been built yet.
- `OPENROUTER_API_KEY` is absent in the current `.env.local`, so job scoring falls back to the heuristic matcher unless that key is added.
- `npm run lint` passes.
- `npm run build` passes after allowing the known network-dependent Inter font fetch and still shows the existing Node `module.register()` deprecation warning.
- A dev-server smoke check was not completed because `.next/dev/lock` referenced a dead PID and neither `localhost:3000` nor `localhost:3001` accepted connections. Production build verification passed.

## Next session starts with

Run `/remember restore`, then continue with Phase 4 Feature 12: Job Details Page — Full UI.

Start by loading a single saved job by UUID from InsForge in `/find-jobs/[id]`, scoped to the current user. Build the full job details page using real saved job data and an empty Company Research card. Keep the Company Research agent logic for Feature 13.

## Open questions

- Whether to add `OPENROUTER_API_KEY` locally so job scoring uses GPT-4o instead of the heuristic fallback.
- Whether `/find-jobs/[id]` should keep the current homepage-like navbar treatment or switch to an authenticated active Find Jobs nav treatment.
- Whether the Job Details page should include a richer empty state for sparse Adzuna snippets, or simply render the saved `about_role` text until Feature 13.
