# Memory — Top 10 Find Jobs Results and Loading UX

Last updated: 2026-06-21 18:35 GMT

## What was built

- Find Jobs now uses a top-10-only search flow:
  - `lib/adzuna.ts` requests one Adzuna page with `results_per_page=10`.
  - `agent/adzuna.ts` batch-scores the returned jobs and stores only those roles.
  - `app/find-jobs/page.tsx` loads only 10 saved jobs ordered by `match_score` descending.
  - `components/find-jobs/FindJobsClient.tsx` no longer supports live search pagination, sort modes, or total available job counts.
  - The footer now says the visible roles are top matched roles ordered by match score, without "found X jobs" copy.
- Loading UX was expanded:
  - Added `components/loading/ProcessOverlay.tsx` with distinct Motion variants for jobs, auth, resume upload/removal, resume extraction, resume generation, and profile save.
  - Added route loading shells through `components/loading/RouteLoadingShell.tsx`.
  - Added route `loading.tsx` files for `/dashboard`, `/profile`, `/find-jobs`, `/find-jobs/[id]`, and `/compare`.
  - Wired overlays into login OAuth handoff, Find Jobs search, Resume section operations, and Profile save.
- Kept existing specialized loaders:
  - Company research already has its own staged Motion loading card and remains unchanged.
  - Sign out keeps button-level loading because it is a tiny nav action that immediately routes away.

## Decisions made

- Current product direction supersedes the earlier live Adzuna pagination work: Jobbiton should not spend time fetching all available jobs or advertising total available results for now.
- "Highest match" means the 10 roles returned for the current Adzuna request are scored and sorted by match score before display.
- Loading overlays are section-contained (`absolute` inside `relative` panels), not viewport-fixed, to stay aligned with project UI rules.
- Motion is already installed and is used via `motion/react`; no new animation dependency was added.

## Problems solved

- Removed stale Find Jobs total-available and live pagination behavior.
- Removed the sort dropdown and always orders by match score.
- Kept compare scoping/history behavior from the previous work while making fresh searches show a new top-10 result set.
- Added visually distinct loading states for the main async user actions so stale content is covered until operations finish.
- Added route-level loading shells to avoid blank or partially painted protected pages during navigation.

## Verification

- `npm run lint` passes.
- `npm run build` passes.
- Build still reports the existing Node `module.register()` deprecation warning, but compilation succeeds.

## Next session starts with

1. Run `/remember restore`.
2. Manually test `/find-jobs`: run a search and confirm only 10 ranked roles appear, no total available count appears, and compare selection resets for the new search scope.
3. Test `/profile`: save profile, upload/remove resume, extract resume, and generate resume to confirm each operation displays the correct overlay until completion.
4. Navigate between `/dashboard`, `/profile`, `/find-jobs`, job details, and `/compare` to confirm route loading shells appear when server data is pending.

## Open questions

- Should Jobbiton eventually fetch more than 10 Adzuna jobs in the background and rank a larger pool, or keep the current fast top-10-only mode?
- Should sign-out receive a page-level pending screen if routing ever becomes slow?
- Should comparison history eventually sync across devices through InsForge?
