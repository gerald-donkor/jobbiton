# Memory — Staged Loading, Animated Backgrounds, and Salary-Listed Top Jobs

Last updated: 2026-06-22 00:00 GMT

## What was built

- Find Jobs now ranks a salary-listed candidate pool:
  - `lib/adzuna.ts` requests one small Adzuna candidate page with `results_per_page=30`.
  - `agent/adzuna.ts` removes jobs without salary estimates before matching.
  - Only the strongest 10 salary-listed jobs are saved and returned for the active search.
  - `app/find-jobs/page.tsx` also filters old salary-missing rows, so `/find-jobs` should not show "Not listed" in Salary Est.
- Loading UX was upgraded:
  - `components/loading/ProcessOverlay.tsx` now shows a staged task board with current step details, progress, completed/active cards, and variant-specific pipeline labels.
  - Find Jobs, OAuth handoff, profile save, resume upload/removal, resume extraction, and resume generation all use process-specific steps.
  - Route-level loading shells remain in place for dashboard, profile, find jobs, job details, compare, and login.
- App-wide visual motion was expanded:
  - `components/animate-ui/backgrounds/gradient.tsx`, `stars.tsx`, and `hexagon.tsx` manually install the actual Animate UI registry background components.
  - `components/loading/AppBackgroundEffects.tsx` composes Animate UI `GradientBackground`, `StarsBackground`, and two `HexagonBackground` layers.
  - `components/layout/PageTransition.tsx` wraps page transitions in `MotionConfig reducedMotion="user"` and renders the background layer outside the transformed route `motion.div`.
  - Page shells, navbars, intro bands, footer, hero gradient, and diagonal bands use translucent backgrounds while cards/tables/forms stay readable.
  - Recovery note: the background effects must stay as a fixed `z-0` viewport layer inside an isolated `PageTransition` stack, but outside the animated route wrapper; do not return them to `-z-10`, put them inside transformed route content, or put opaque `bg-surface` / `bg-background` wrappers over full pages, because that hides the animations behind the page background.
- Navigation and scroll utility:
  - Shared, dashboard, and job-details navbars now use sticky glass surfaces with `bg-surface/58`, `backdrop-blur-xl`, and a soft overlay shadow.
  - `components/layout/ScrollToTopButton.tsx` adds a global fixed glass arrow that appears after scrolling and smooth-scrolls to the top.
- Compare page was corrected:
  - Prep-gap notes now render as full-width violet note panels.
  - Short strongest-overlap skills remain compact pills.

## Decisions made

- Current product direction is a fast curated shortlist: do not fetch every available Adzuna job, show total available counts, or expose live Previous/Next Adzuna pagination.
- "Highest match" means strongest by `match_score` after filtering to salary-listed roles.
- Animate UI is treated as a copy-first registry. No new Animate UI package dependency was added; selected registry components are installed locally and tokenized for Jobbiton.
- Loading overlays are section-contained and must stay active until the async process resolves.

## Problems solved

- Removed the boring generic Find Jobs waiting state and replaced it with a visible stage-by-stage process.
- Prevented salary-missing Find Jobs rows from displaying "Not listed" in the Salary Est. column.
- Fixed uneven Compare prep-gap violet backgrounds behind wrapped text.
- Replaced the imitation background with real Animate UI registry Gradient, Stars, and Hexagon components.
- Recovered initially invisible background effects by fixing their stacking context and adding a more visible token ribbon/scan layer.
- Recovered the second visibility issue by making full-page landing/app shells translucent; the real Animate UI components were mounted, but opaque page wrappers covered them.
- Recovered the third visibility issue by moving the fixed background outside the transformed route `motion.div` and increasing the gradient/star/hex contrast.

## Verification

- Run `npm run lint`, `git diff --check`, raw color/style scans, and `npm run build` before final handoff.
- Build may still report the existing Node `module.register()` deprecation warning; that warning predates this work.

## Next session starts with

1. Run `/remember restore`.
2. Test `/find-jobs`: search a role/location and confirm the overlay stages stay visible until results render, only 10 salary-listed ranked rows appear, and row clicks open `/find-jobs/[id]`.
3. Test `/compare`: open a comparison with long prep notes and confirm each prep note has a full-width violet background.
4. Navigate between main pages to confirm the subtle background effects and route loading shells do not hide or clip page content.

## Open questions

- Should Compare and Job Details also hide old salary-missing jobs, or is the salary requirement only for the Find Jobs search results list?
- Should comparison history eventually sync across devices through InsForge?
