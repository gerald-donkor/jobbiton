# Memory - Feature 10 Adzuna Job Discovery

Last updated: 2026-06-12 19:30 GMT

## What was built

- Completed Phase 2 Feature 08: Resume PDF Generation from Profile, including generated PDF upload, active resume replacement, and remove-resume support.
- Connected Accounts now supports LinkedIn OAuth routes plus saved-profile fallback states.
- Completed Phase 3 Feature 09: Find Jobs Page Full UI with the centered screenshot-matched layout and table.
- Completed Phase 3 Feature 10: Adzuna Job Discovery.
- Added `app/api/agent/find/route.ts` for authenticated job search requests.
- Added `agent/adzuna.ts` and `agent/matcher.ts` for Adzuna discovery, profile scoring, DB writes, agent logs, and PostHog events.
- Added `lib/adzuna.ts` and `lib/utils.ts` for shared Adzuna helpers and `MATCH_THRESHOLD`.
- Added `components/find-jobs/FindJobsClient.tsx` so `/find-jobs` submits live searches and renders saved results immediately.
- Updated `proxy.ts` so `/api/agent/*`, `/api/linkedin/*`, and `/api/resume/*` all refresh InsForge sessions before route handlers run.

## Decisions made

- Adzuna search stays server-side and always includes `category=it-jobs`.
- Search writes create an `agent_runs` row first, then save `jobs` rows scoped to `user_id`, and log failures to `agent_logs`.
- Job matching prefers OpenRouter `openai/gpt-4o` when `OPENROUTER_API_KEY` exists, with a local heuristic fallback so searches still work without that key.
- The Find Jobs page keeps the screenshot-matched navbar and layout while using a client wrapper for live search state.
- Feature 11 still owns real filter, sort, and pagination logic; the current filter bar remains presentational.

## Problems solved

- Fixed the build break caused by unresolved Git conflict markers in `proxy.ts`.
- Cleaned related merge-conflict markers from `context/progress-tracker.md` and `memory.md`.
- Prevented stale InsForge sessions from breaking the new search route by adding `/api/agent/:path*` to the proxy matcher.
- Kept searches functional even without `OPENROUTER_API_KEY` by falling back to heuristic matching.

## Current state

- Phase 1 Foundation is complete.
- Phase 2 Features 05, 06, 07, and 08 are complete.
- Phase 3 Features 09 and 10 are complete.
- Phase 3 Feature 11 Filter + Sort + Pagination is still incomplete.
- `/find-jobs` now performs real Adzuna-backed searches, saves jobs, and renders live results.
- `/find-jobs/[id]` is still a protected placeholder; saved job links route there successfully but no real job details UI exists yet.
- `npm run lint` passes.
- `npm run build` passes and still shows the existing Node `module.register()` deprecation warning.

## Next session starts with

Run `/remember restore`, then begin Phase 3 Feature 11: Filter + Sort + Pagination.

Start by reading the current Next.js docs required by `AGENTS.md`, then wire the existing filter bar, sort select, and pagination UI to InsForge job queries using the saved `jobs` rows and shared `MATCH_THRESHOLD`.

## Open questions

- Whether to add `OPENROUTER_API_KEY` in local development so job scoring uses GPT-4o instead of the heuristic fallback.
- Whether `/find-jobs/[id]` should switch from placeholder routing to real job UUID-backed details immediately as part of Feature 11 or wait for Feature 12.
- Whether the Find Jobs navbar should stay homepage-like once the authenticated jobs experience is fully wired.
