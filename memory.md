# Memory — Find Jobs Compare Scope, Live Pagination, and Gemini Matching

Last updated: 2026-06-21 14:10 GMT

## What was built

- Fixed Find Jobs comparison state leaking across searches:
  - `components/find-jobs/FindJobsClient.tsx` passes the active search run as a compare scope.
  - `components/find-jobs/JobsTable.tsx` only shows active compare selections for the current search scope.
  - `components/job-workflow/useJobWorkflow.ts` archives prior active compare groups and clears the visible Compare count when a new search scope appears.
  - `components/job-workflow/types.ts` includes comparison history state.
- Added comparison history on Find Jobs:
  - The workflow toolbar includes a `History` control.
  - Previous comparison groups can be opened directly, restored as active, or removed.
  - History is capped to the latest eight groups in local storage.
- Updated Adzuna search availability and pagination:
  - `lib/adzuna.ts` now accepts an Adzuna page number and returns 10 jobs plus `totalAvailable` from Adzuna's response `count`.
  - `agent/adzuna.ts` can create a fresh search run or load an existing user-scoped run for additional pages.
  - `app/api/agent/find/route.ts` accepts optional `page` and `runId` and returns the actual page number.
  - `app/find-jobs/page.tsx` now uses 10-row saved-run pagination.
  - `components/find-jobs/FindJobsClient.tsx` caches live search pages client-side and makes Previous/Next fetch additional 10-job pages into the same run.
- Updated documentation:
  - `context/library-docs.md` records paged Adzuna search behavior.
  - `context/ui-registry.md` records scoped compare/history and functional live pagination.
  - `context/progress-tracker.md` records both completed changes and verification.
- Fixed Find Jobs matching provider selection:
  - `agent/matcher.ts` now calls OpenRouter only when `OPENROUTER_API_KEY` exists.
  - When the project is configured with `GEMINI_API_KEY`, matching uses Gemini structured JSON with `gemini-2.5-flash` then `gemini-2.5-flash-lite`.
  - Missing OpenRouter config no longer logs noisy fallback errors during Find Jobs searches.
  - Follow-up recovery: Adzuna job text is now sanitized and sent as JSON data to Gemini, and malformed Gemini output falls back to heuristic scoring with one concise warning instead of repeated stack traces.
  - Follow-up quota recovery: Find Jobs now batch-scores the current 10 Adzuna listings with one provider request through `matchJobsToProfile()` instead of one AI call per job; quota failures fall back to heuristic scoring for the whole batch.
- Fixed Find Jobs row navigation:
  - `components/find-jobs/JobsTable.tsx` now makes mobile cards and desktop rows navigate to `/find-jobs/[id]` on click or Enter/Space.
  - Embedded controls such as status, Save, Compare, Hide, and links are ignored by the row navigation guard.
- Removed the bottom helper copy from the login card:
  - `components/auth/LoginForm.tsx` no longer renders `New users are routed to profile setup after sign-in.`
  - `context/ui-registry.md` was updated so future login card changes keep the left pane without a bottom helper footer.
- Fixed content staying hidden until refresh after visiting pages:
  - `components/motion/Reveal.tsx` now uses direct `animate` visibility in addition to `whileInView`.
  - Reveal groups also animate to `show` directly, so children cannot remain stuck in hidden variants when in-view observation misses during client-side navigation.

## Decisions made

- Jobbiton scores/saves 10 jobs at a time to control AI/API work.
- Next/Previous on a live search now load more Adzuna pages into the same `agent_runs.id` rather than creating a new search.
- The compare scope remains stable while moving between pages of the same live search.
- Previous compare groups remain localStorage-backed with the rest of workflow state; no InsForge schema changes were made.
- Gemini is a first-class local provider for Find Jobs matching, matching the existing resume and company research provider pattern.

## Problems solved

- Fixed stale `Compare 3` style state appearing after a fresh Find Jobs search.
- Preserved access to previous compare selections without making them look like they belong to current/latest job results.
- Fixed the Find Jobs footer/pagination mismatch where Previous/Next looked like controls but were disabled for live searches.
- Live search pagination now fetches additional Adzuna pages and updates the table.
- Fixed terminal noise when clicking Find Jobs with `GEMINI_API_KEY` configured but no `OPENROUTER_API_KEY`.
- Fixed repeated `Provider response did not include JSON` stack traces from Gemini matching by quieting malformed-output fallback and making the prompt less vulnerable to real job-description text.
- Fixed Gemini free-tier exhaustion from per-job scoring. A single search should no longer spend up to 10 Gemini requests before saving jobs.
- Fixed jobs feeling unclickable unless the exact role title text was clicked.
- Removed the circled login helper text requested in the latest screenshot feedback.
- Fixed page content below intro sections failing to appear until manual refresh.

## Current state

- A Next dev server was already running for this project on `http://localhost:3000` with PID 7428 during the session.
- Verification passes:
  - `npm run lint`
  - `npm run build`
  - `git diff --check`
  - raw Tailwind color scan over touched Find Jobs/Adzuna files
- Build still reports the existing Node `module.register()` deprecation warning, but compilation succeeds.

## Next session starts with

1. Run `/remember restore`.
2. Manually test `/find-jobs`: select compare jobs, search a new role, confirm Compare resets to zero and History can reopen the previous group.
3. Run a live Adzuna search with more than 10 available jobs and confirm Next loads page 2, Previous returns to page 1, and the compare scope remains stable.
4. If multi-device workflow persistence is requested, plan an InsForge schema path before moving comparison history server-side.

## Open questions

- Should comparison history eventually sync across devices through InsForge?
- Should comparison history appear anywhere besides Find Jobs, such as `/compare` or Job Details?
- Should Jobbiton eventually prefetch page 2 after a successful search, or keep loading pages only when the user clicks Next?
