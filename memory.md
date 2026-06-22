# Memory — Responsive Dashboard and App UI Polish

Last updated: 2026-06-22 23:50 GMT

## What was built

- Dashboard mobile responsiveness was hardened:
  - `components/dashboard/DashboardPageContent.tsx` now uses compact page intro density and `min-w-0` reveal wrappers so the dashboard does not force horizontal overflow.
  - `components/dashboard/ChartFrame.tsx` prevents chart-card overflow and shows a mobile `Swipe chart` hint.
  - `components/dashboard/DashboardMobileDataList.tsx` was added so chart data is also visible in normal vertical mobile flow.
  - `CompanyResearchChart.tsx`, `JobsFoundChart.tsx`, and `MatchDistributionChart.tsx` now use tokenized scroll areas plus the mobile data list.
  - `components/dashboard/RecentActivity.tsx` and `StatCard.tsx` have denser mobile card spacing.
- Dashboard navbar regression was corrected:
  - `components/dashboard/DashboardNavbar.tsx` was restored from a grid experiment back to the shared flex/wrap navbar structure so the logo, nav links, theme toggle, profile button, and sign-out positioning match the rest of the app.
  - The dashboard action group keeps a mobile width guard to avoid overflow.
- App-wide UI polish from this session remains in place:
  - Animate UI registry background components are installed locally under `components/animate-ui/backgrounds/` and composed by `components/loading/AppBackgroundEffects.tsx`.
  - `components/layout/PageTransition.tsx` renders the background layer outside the transformed route wrapper so effects remain visible.
  - Shared navbars and reserved spacer bands use glass styling from `app/globals.css`.
  - `components/layout/ScrollToTopButton.tsx` provides the frosted glass scroll-to-top arrow.
  - Homepage fold behavior in `components/motion/ScrollFlow.tsx` uses the restored backward/upward fold with reduced blur.
- Workflow functionality from earlier in the session remains in place:
  - Find Jobs is simplified to a top-10 salary-listed shortlist and preserves submitted role/location fields in the route.
  - Compare selections are scoped to the current search and previous selections are available through comparison history.
  - Job rows/cards navigate to `/find-jobs/[id]`.
  - Process overlays show staged loading for job search, auth, profile save, resume actions, and research.
- Documentation was updated:
  - `context/progress-tracker.md`
  - `context/ui-registry.md`

## Decisions made

- Dashboard mobile charts should keep their Recharts visualization horizontally swipeable, but must also provide a stacked mobile data list so users can see the whole dashboard without relying only on horizontal scrolling.
- Dashboard navbar should follow the same flex/wrap pattern as the shared navbar. The attempted two-row grid made button and section positioning drift and should not be reintroduced.
- App background effects must stay fixed at `z-0` outside transformed route content; opaque full-page wrappers should not cover them.
- Current Find Jobs product behavior is a curated, fast top-10 salary-listed shortlist, not full Adzuna result pagination.
- Loading states should stay visible until the async work truly resolves; avoid any blank interval between process animation and result display.

## Problems solved

- Dashboard content previously risked being clipped or only usable via chart scrolling on mobile. It now has mobile data lists and overflow guards.
- Dashboard navbar button/section positioning regressed after a grid layout experiment. It was restored to the stable flex/wrap navbar structure.
- Dashboard optional InsForge analytics errors were downgraded to normalized warnings through `lib/dashboard-log.ts`, preventing dev console error overlays for recoverable dashboard data failures.
- Animate UI backgrounds were previously invisible in light mode or hidden behind opaque wrappers; they are now mounted in the correct stacking context with translucent page shells.
- Find Jobs no longer displays salary-missing roles as "Not listed" in the search result list.

## Current state

- `npm run lint`, `git diff --check`, and `npm run build` passed after the latest dashboard navbar correction.
- The production build still shows the existing Node `module.register()` deprecation warning, but completes successfully.
- The working tree is intentionally dirty with many UI and feature edits from this session. Important untracked files are:
  - `components/dashboard/DashboardMobileDataList.tsx`
  - `lib/dashboard-log.ts`
- No browser automation tool was available locally in `package.json` or `node_modules/.bin`; mobile responsiveness was verified by code inspection plus lint/build, not screenshot automation.

## Next session starts with

1. Run `/remember restore`.
2. Start the dev server and manually inspect `/dashboard` on mobile widths first, especially the navbar positions, compact intro, stat cards, Recent Activity, chart swipe areas, and chart mobile data lists.
3. If the dashboard navbar still looks off visually, adjust only `components/dashboard/DashboardNavbar.tsx`; do not switch it back to a grid layout.
4. Re-run `npm run lint`, `git diff --check`, and `npm run build` after any follow-up changes.

## Open questions

- Should dashboard chart mobile data lists show all points, only nonzero points, or a fixed latest subset when there are many data points?
- Should the dashboard use the shared `Navbar` component directly instead of maintaining a separate `DashboardNavbar` now that their layouts are closer again?
