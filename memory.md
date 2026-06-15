# Memory — Dashboard Phase Handoff

Last updated: 2026-06-15 16:15:48 GMT

## What was built

- Completed Feature 15, Stats Bar Real Data: `app/dashboard/page.tsx` now loads user-scoped dashboard stats through `lib/dashboard-stats.ts` and passes them into `components/dashboard/DashboardPageContent.tsx`.
- Completed Feature 16, Recent Activity Real Data: added `lib/dashboard-activity.ts`, loads completed `agent_runs` and researched `jobs`, merges/sorts them, formats labels and relative times, and passes the result into `components/dashboard/RecentActivity.tsx`.
- Recovered dashboard interactivity and positioning across the dashboard: chart hover/focus lanes and `ChartTooltip` placement are in `components/dashboard/ChartTooltip.tsx`, `CompanyResearchChart.tsx`, `JobsFoundChart.tsx`, and `MatchDistributionChart.tsx`; dashboard layout now uses compact 80px navbar, centered `max-w-[824px]` content track, 16px gaps, 128px stat cards, and 340px activity/chart cards.
- Updated `context/progress-tracker.md` and `context/ui-registry.md`; current tracker marks Features 14, 15, and 16 complete and Feature 17 next.

## Decisions made

- Dashboard data loading stays server-side in `app/dashboard/page.tsx` and `lib/` helpers. UI components remain props-only and do not query InsForge directly.
- Dashboard activity uses existing available timestamps: completed job searches use `agent_runs.completed_at` with `started_at` fallback; researched company entries use `jobs.found_at` because company research currently has no dedicated `researched_at` column.
- Recent Activity is capped at five entries so it fits the compact 340px card height.
- Dashboard chart UI remains custom SVG/CSS for now; Feature 17 is the planned point where chart data should move to PostHog-backed real analytics.

## Problems solved

- Dashboard tooltip placement was fixed so tooltips stay near the top of active chart lanes instead of dropping below short bars or low line points.
- Dashboard hit targets were expanded to full-height chart lanes, making all charts hover/focus interactive instead of requiring tiny point/bar targets.
- The dashboard had drifted into an oversized full-width shell; it was corrected to the latest screenshot positioning with centered compact cards and a compact navbar.

## Current state

- `/dashboard` now has real stat cards and a real recent activity feed.
- Feature 17, Analytics Charts — PostHog Data, is not implemented yet. The three chart components still use mock data but keep the corrected interactive UI and `chartTop` tooltip behavior.
- Last verification after Feature 16: `npm run lint`, `npm run build`, `git diff --check`, and raw Tailwind color scans passed. Build still shows the existing Next/Turbopack Node `module.register()` deprecation warning, but it does not fail.
- No known functional blocker remains from Feature 16.

## Next session starts with

Implement Feature 17, Analytics Charts — PostHog Data. Start by reading the required context files and InsForge/PostHog project docs, then inspect `lib/posthog-server.ts`, `lib/posthog-events.ts`, and the three dashboard chart components. Wire Jobs Found Over Time, Match Score Distribution, and Company Research Activity to current-user PostHog events while preserving the existing compact chart layout and hover/focus behavior.

## Open questions

- Whether to follow the build plan literally and introduce `recharts` for Feature 17, or preserve the current custom SVG/CSS chart implementation and replace only the data layer. Prefer preserving the existing implementation unless the user explicitly wants Recharts, because the current charts already match the screenshot and have custom hover lanes.
- Company research activity currently has no separate researched timestamp in the jobs table. Feature 17 should use PostHog `company_researched` event timestamps for accurate chart dates.
