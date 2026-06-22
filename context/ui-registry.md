# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Global Interactive Cursor

File: app/globals.css
Last updated: 2026-06-09

| Property         | Class / Selector                                                               |
| ---------------- | ------------------------------------------------------------------------------ |
| Background       | none                                                                           |
| Border           | none                                                                           |
| Border radius    | none                                                                           |
| Text — primary   | inherited                                                                      |
| Text — secondary | inherited                                                                      |
| Spacing          | none                                                                           |
| Hover state      | `cursor-pointer` via `a[href]`, `button`, `[role="button"]`, `label[for]`, `summary`; disabled buttons use `cursor-not-allowed` |
| Shadow           | none                                                                           |
| Accent usage     | none                                                                           |

**Pattern notes:**
All semantic interactive elements should expose the hand cursor without each component repeating the class. Buttons and `a[href]` links receive Tailwind's `cursor-pointer` globally; disabled buttons are overridden to `cursor-not-allowed`. Use real anchors/buttons/labels for clickable UI whenever possible. If a future custom interactive element cannot use a semantic control, add `role="button"` and keyboard handling or add `cursor-pointer` directly with the required accessibility behavior.

### Global Theme and Page Motion

File: app/globals.css, app/layout.tsx, components/layout/PageTransition.tsx, components/layout/ScrollToTopButton.tsx, components/motion/Reveal.tsx
Last updated: 2026-06-22

| Property         | Class / Selector                                                               |
| ---------------- | ------------------------------------------------------------------------------ |
| Background       | light/dark `--color-*` token overrides, body token linear background           |
| Border           | inherited token border overrides                                               |
| Border radius    | none                                                                           |
| Text — primary   | body `color: var(--color-text-primary)`                                        |
| Text — secondary | inherited from token overrides                                                 |
| Spacing          | layout wrapper `flex min-h-full flex-col`                                      |
| Hover state      | none                                                                           |
| Shadow           | none                                                                           |
| Accent usage     | theme is selected by `html[data-theme]`; page entry uses Motion opacity/y transition |

**Pattern notes:**
The root layout runs a small pre-paint theme script before rendering page content, reading `jobbiton-theme` from local storage and falling back to system preference. Theme mode is represented by `html[data-theme="light|dark"]`, and dark mode works by overriding existing design tokens rather than adding raw `dark:` color utilities to components. `PageTransition` is a client-only Motion wrapper that keys by pathname, fades/slides route content, wraps app pages in `MotionConfig reducedMotion="user"`, and renders the shared non-interactive background effects layer outside the transformed route `motion.div`. Keep the background outside route transforms/filters; fixed descendants inside transformed route wrappers can become visually trapped and covered. Reveal wrappers must always animate to a visible state through `animate` as well as `whileInView`, so protected page content cannot remain hidden if in-view observation misses during client-side navigation. Future app-wide animation should stay in focused client wrappers and preserve token-only colors.

### App Background Effects

Files: components/loading/AppBackgroundEffects.tsx, components/animate-ui/backgrounds/gradient.tsx, components/animate-ui/backgrounds/stars.tsx, components/animate-ui/backgrounds/hexagon.tsx, components/layout/PageTransition.tsx
Last updated: 2026-06-22

| Property         | Class / Selector                                                               |
| ---------------- | ------------------------------------------------------------------------------ |
| Background       | Animate UI `GradientBackground`, `StarsBackground`, `HexagonBackground`, `.app-background-gradient`, `.app-background-stars`, `.app-background-hex-*`, landing `bg-transparent` and `bg-surface/24` |
| Border           | hex cells use tokenized pseudo-element fills via `.app-background-hex-cell::before/::after` |
| Border radius    | none for page layer; cells use clipped hexagons                                |
| Text             | none; effect is decorative and `aria-hidden`                                   |
| Spacing          | full page layer `fixed inset-0`, right/bottom hex fields use large viewport-sized layers |
| Hover state      | none; effect uses `pointer-events-none`                                        |
| Shadow           | none                                                                           |
| Accent usage     | tokenized light/dark gradient fields, theme-specific star color, accent/info/success radial washes, tokenized hex cell fills |

**Pattern notes:**
The background layer uses manually installed Animate UI registry components: `GradientBackground`, `StarsBackground`, and two `HexagonBackground` layers. The registry source is adapted only where needed for Jobbiton's token system, local `cn()` helper, and React lint rules. It must be a fixed viewport layer at `z-0` inside the isolated `PageTransition` stack, as a sibling before the route transition `motion.div` with page content at `z-10`; do not use a negative z-index, place it inside the transformed route wrapper, or cover it with opaque page wrappers because that makes the effects invisible. Light mode needs stronger effect contrast than dark mode: `.app-background-stars` uses normal/multiply-style visibility instead of screen blending, `.app-background-gradient` adds tokenized accent/info/success radial fields, and the landing shell stays at `bg-surface/24` so the animated layer remains visible behind the content. Dark mode restores the calmer screen-blended stars and deeper token gradient. Cards/tables/forms stay solid for readability. The layer is decorative, non-interactive, and respects reduced-motion preferences through `useReducedMotion()` / `MotionConfig`.

### Process Loading Overlay

File: components/loading/ProcessOverlay.tsx
Last updated: 2026-06-22

| Property         | Class / Selector                                                               |
| ---------------- | ------------------------------------------------------------------------------ |
| Background       | overlay `bg-surface/95`, inner panel `bg-surface-secondary`, step cards/current step `bg-surface`, active cards `bg-accent-muted` |
| Border           | overlay/panel/cards `border border-border`, process accents use token alpha borders |
| Border radius    | overlay/panel `rounded-xl`, step cards `rounded-lg`, glyphs `rounded-full`     |
| Text — primary   | title `text-[24px] font-semibold leading-8 text-text-primary`, current step `text-[16px] font-semibold leading-6` |
| Text — secondary | description `text-[14px] font-normal leading-6 text-text-secondary`, details `text-[12px]/[13px] font-medium` |
| Spacing          | overlay `absolute inset-0 z-20 px-5 py-6`, panel `max-w-[760px] px-5/px-6 py-5/py-6`, visual grid `lg:grid-cols-[220px_1fr]`, step grid `mt-5 gap-3` |
| Hover state      | none while active; overlay blocks underlying interaction                       |
| Shadow           | overlay and panel token shadows using `var(--color-overlay)`                  |
| Accent usage     | active process visuals use `bg-accent`, `text-accent`, `border-accent`, or success tokens depending on variant |

**Pattern notes:**
Use `ProcessOverlay` inside a `relative overflow-hidden` panel whenever a button starts an async operation that should cover stale content until completion. The overlay is intentionally section-contained rather than fixed to the viewport and must remain active until the async work resolves. Current variants are `jobs`, `auth`, `resume-upload`, `resume-extract`, `resume-generate`, and `save`; choose a different visual variant for different background processes instead of reusing one spinner everywhere. Prefer object steps with `title` and `detail` so users see the process stage, the current stage card, progress rail, and compact variant pipeline while waiting.

### Route Loading Shells

File: components/loading/RouteLoadingShell.tsx, app/*/loading.tsx
Last updated: 2026-06-21

| Property         | Class / Selector                                                               |
| ---------------- | ------------------------------------------------------------------------------ |
| Background       | page `bg-background`, intro band/card `bg-surface`, skeleton blocks `bg-surface-secondary` |
| Border           | intro/card/rows `border-border`                                                |
| Border radius    | card `rounded-xl`, skeletons `rounded-md`                                      |
| Text — primary   | route title `text-[52px] md:text-[64px] font-bold leading-[1.05] text-text-primary` |
| Text — secondary | route copy `text-[19px] font-normal leading-8 text-text-secondary`             |
| Spacing          | intro `px-6 py-16 md:px-10`, body `px-6 py-10 md:px-10`, content `max-w-[1180px]` |
| Hover state      | none                                                                           |
| Shadow           | card token shadow through child containers                                     |
| Accent usage     | eyebrow `text-accent`, detail radar `bg-accent` / `border-accent`              |

**Pattern notes:**
Use route-level `loading.tsx` files for protected pages whose server data can stream after navigation. The shell mirrors each page's intro-first layout so route transitions never show a blank or half-painted page. Keep route loading skeletons token-based and page-specific through copy and the `variant` prop; in-page async work should still use `ProcessOverlay`.

### Scroll To Top Control

File: components/layout/ScrollToTopButton.tsx, app/globals.css
Last updated: 2026-06-22

| Property         | Class / Selector                                                               |
| ---------------- | ------------------------------------------------------------------------------ |
| Background       | fixed glass `bg-surface/62 backdrop-blur-xl`                                   |
| Border           | `border border-border`, hover `border-accent`                                  |
| Border radius    | `rounded-full`                                                                 |
| Text/Icon        | CSS arrow `.scroll-top-arrow`, default `text-accent`, hover `text-accent-foreground` |
| Spacing          | `fixed bottom-5 right-5 sm:bottom-7 sm:right-7`, `size-12 sm:size-13`          |
| Hover state      | `hover:bg-accent hover:text-accent-foreground`                                 |
| Shadow           | `shadow-[0_18px_40px_color-mix(in_srgb,var(--color-overlay)_18%,transparent)]` |
| Accent usage     | arrow and hover fill use accent tokens                                         |

**Pattern notes:**
Mount `ScrollToTopButton` once in `PageTransition` so it is available across landing and protected pages. It should appear only after meaningful scrolling and call `window.scrollTo({ top: 0, behavior: "smooth" })`, falling back to instant scrolling when reduced motion is preferred. Use a CSS arrow rather than visible text so it behaves like a compact utility control.

### Homepage Fold Sections

Files: components/motion/ScrollFlow.tsx, app/page.tsx, app/globals.css
Last updated: 2026-06-22

| Property         | Class / Selector                                                               |
| ---------------- | ------------------------------------------------------------------------------ |
| Background       | inherited from each landing band; parent landing shell remains `bg-surface/24` |
| Border           | inherited from section content                                                 |
| Border radius    | inherited from section content                                                 |
| Text             | inherited from section content                                                 |
| Spacing          | sticky sheet top `clamp(4.5rem, 9vw, 5.75rem)`, track overlap `margin-top: -4.5rem`, track fold runway `padding-bottom: min(14vh, 7rem)` |
| Hover state      | none at wrapper level                                                          |
| Shadow           | token sheet shadow using `var(--color-overlay)`                                |
| Accent usage     | none at wrapper level; accent remains inside section content                   |

**Pattern notes:**
Use `FoldSection` from `components/motion/ScrollFlow.tsx` around major homepage bands when the page should feel like vertical stacked sheets folding over one another. `FoldSection` intentionally separates the scroll-measured outer `.homepage-fold-track` from the inner sticky `.homepage-fold-section`; the track owns z-index, perspective, overlap, and runway spacing, while the sheet sticks under the navbar and visually folds. Each next track has a higher z-index, so downward scrolling brings the next section over the previous one. As the outgoing sheet leaves its scroll range, Motion eases `rotateX`, `scale`, `y`, opacity, and only a very light blur; keep exit blur around `1px` and opacity near `0.82` so folded sections remain readable instead of becoming smeared. Keep the transform origin at the top center through `.homepage-fold-section`, preserve `transform-style: preserve-3d`, and respect reduced motion through `useReducedMotion()`. Do not apply this wrapper to dense operational app pages unless the page is explicitly editorial/landing-style; dashboards, tables, forms, and job workflow screens should prioritize scan stability.

### Login Form Skeleton

File: components/auth/LoginFormSkeleton.tsx, app/login/loading.tsx
Last updated: 2026-06-21

| Property         | Class / Selector                                                               |
| ---------------- | ------------------------------------------------------------------------------ |
| Background       | card `bg-surface`, left pane `soft-gradient-panel`, skeleton blocks `bg-surface-secondary` |
| Border           | card/pane/buttons `border border-border` / `border-b border-border`            |
| Border radius    | card `rounded-xl`, placeholders `rounded-md` / badge `rounded-full`            |
| Text — primary   | none visible; skeleton uses `aria-label` for loading state                     |
| Text — secondary | none visible                                                                   |
| Spacing          | card `max-w-[760px]`, panes `px-8 py-8` / `px-8 py-10`, rows `space-y-3`       |
| Hover state      | none                                                                           |
| Shadow           | card `shadow-[0_14px_30px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)]` |
| Accent usage     | none; skeleton remains neutral while auth options hydrate                      |

**Pattern notes:**
Use `LoginFormSkeleton` anywhere the split OAuth card is suspended or route-loading. It intentionally matches `LoginForm` dimensions and split-pane structure so `/login` does not flash a blank auth panel while `useSearchParams()` resolves. Keep it server-renderable and token-only; interactive OAuth progress belongs in `ProcessOverlay`.

### Brand Logo

File: components/layout/BrandLogo.tsx, app/globals.css
Last updated: 2026-06-20

| Property         | Class / Selector                                                               |
| ---------------- | ------------------------------------------------------------------------------ |
| Background       | `.brand-logo-mark` token gradient from `--color-accent` and `--color-accent-dark` |
| Border           | `.brand-logo-cell` uses token foreground color mix                             |
| Border radius    | mark `10px`, inline mark `0.34em`, cells `3px`                                 |
| Text — primary   | nav wordmark `text-text-darkest text-[19px] font-bold leading-7`, inline brand inherits parent text |
| Text — secondary | none                                                                           |
| Spacing          | link `inline-flex items-center gap-3`, inline brand `inline-flex items-center gap-2`, mark `36px`, inline mark `1.35em` |
| Hover state      | `hover:text-accent`, `.group:hover .brand-logo-mark` lifts 1px                 |
| Shadow           | mark token shadow using `var(--color-accent)` and `var(--color-overlay)`       |
| Accent usage     | mark background and hover text use accent tokens                               |

**Pattern notes:**
All actual product-logo placements now go through `BrandLogo` for linked navigation wordmarks or `BrandName` for non-link brand-heading placements such as the login welcome title. The mark is code-native and token-driven so it adapts to dark mode without separate image files. Future navs and footers should import `BrandLogo` rather than using `/logo.png`. Do not replace every body-copy mention of `Jobbiton` with a logo mark; ordinary sentence text should remain plain text unless the design position is explicitly a logo/brand lockup.

### Theme Toggle

File: components/theme/ThemeToggle.tsx
Last updated: 2026-06-15

| Property         | Class                                                                         |
| ---------------- | ----------------------------------------------------------------------------- |
| Background       | `bg-surface-secondary`, switch track `bg-surface`, knob `bg-accent`           |
| Border           | `border border-border`, hover `hover:border-accent`                           |
| Border radius    | control/track/knob `rounded-full`                                             |
| Text — primary   | hover `hover:text-text-primary`                                               |
| Text — secondary | `text-text-secondary text-[12px] font-semibold leading-4`                     |
| Spacing          | `h-9 gap-2 px-2.5`, track `h-5 w-9`                                           |
| Hover state      | `hover:border-accent hover:text-text-primary`                                 |
| Shadow           | subtle token control shadow and knob shadow                                   |
| Accent usage     | active knob and focus outline use `bg-accent` / `focus-visible:outline-accent` |

**Pattern notes:**
The theme toggle reads the current `data-theme` value through `useSyncExternalStore`, writes `jobbiton-theme` to local storage, and dispatches a local theme-change event after toggles. It is intentionally compact for nav placement: text hides on small screens while the switch remains visible. Future theme controls should use this component rather than duplicating local storage or DOM theme logic.

### Profile Page Layout

File: components/profile/ProfilePageContent.tsx
Last updated: 2026-06-09

| Property         | Class                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Background       | page `bg-background`, main `bg-background`                          |
| Border           | main `border-x border-border`                                       |
| Border radius    | none                                                                |
| Text — primary   | main `text-text-primary`                                            |
| Text — secondary | inherited by child cards                                            |
| Spacing          | main `px-6 py-8`, profile column `max-w-[940px] gap-6`              |
| Hover state      | none                                                                |
| Shadow           | none                                                                |
| Accent usage     | none at layout level                                                |

**Pattern notes:**
Screenshot-matched profile pages keep the full shared navbar visible, use the app background behind a centered profile column, and place profile cards in a `max-w-[940px]` column with `gap-6`. Attention, Resume, and Profile Information cards should all share this same column width so the page reads as one streamlined vertical stack. Keep page-level styling unframed; individual profile sections provide the white card shells and shadows.

### Protected Navbar Active State

File: components/layout/Navbar.tsx
Last updated: 2026-06-22

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | fixed custom `.navbar-glass` gradient glass with backdrop blur/saturation |
| Border           | `.navbar-glass` tokenized translucent bottom border                    |
| Border radius    | none                                                                  |
| Text — primary   | active `text-accent`, inactive `text-text-dark text-[14px] font-medium leading-5` |
| Text — secondary | none                                                                  |
| Spacing          | fixed header `min-h-16 px-4/px-6 py-3`, nav links `inline-flex h-9 lg:h-16`, spacer `h-[105px] lg:h-16` |
| Hover state      | inactive `hover:text-accent`                                          |
| Shadow           | `.navbar-glass` inset highlight plus soft overlay/accent shadows       |
| Accent usage     | active link text and bottom rule `absolute inset-x-0 bottom-0 h-0.5 bg-accent` |

**Pattern notes:**
Protected pages can pass `activeHref` to the shared navbar to render the active nav item with a token-purple text state and a 2px bottom rule. Nav icons are hidden by default; pass `showNavIcons` only for a design that explicitly includes them. Shared protected navbars are fixed to the top of the viewport with the custom `.navbar-glass` surface; it layers translucent surface gradients, subtle accent/info light blooms, an inset top reflection, soft shadow, `backdrop-filter: blur(22px) saturate(1.55)`, and a dark-mode override. Keep the spacer immediately after the header so page content does not slide underneath the fixed bar. Page-level route transitions must remain opacity-only because transforms/filters on the route wrapper break viewport-fixed descendants and make the navbar scroll away with content.

### Dashboard Page Layout

File: components/dashboard/DashboardPageContent.tsx, components/dashboard/DashboardNavbar.tsx
Last updated: 2026-06-15

| Property         | Class                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Background       | page/main `bg-background`, navbar `bg-surface`                      |
| Border           | navbar `border-b border-border`; page content unframed              |
| Border radius    | none at page level                                                  |
| Text — primary   | main `text-text-primary`, dashboard nav active `text-text-primary text-[14px] font-medium leading-5` |
| Text — secondary | inactive nav `text-text-dark`                                       |
| Spacing          | navbar `h-20 px-10`, nav `gap-12`, main `px-6 pt-8 pb-16`, content grid `max-w-[824px] gap-4` |
| Hover state      | navbar links inherit shared `hover:text-accent`                     |
| Shadow           | none at page level                                                  |
| Accent usage     | active Dashboard nav uses `text-accent` and `bg-accent` underline   |

**Pattern notes:**
Dashboard is a dense operational page with no hero, footer, or nested layout shell. The corrected dashboard reference uses a compact 80px top bar: logo on the left, text-only nav links centered absolutely in the viewport, and a profile icon plus `Sign out` action on the right. The dashboard content sits in a narrow centered `max-w-[824px]` column with 16px gaps so the four stat cards and two-column chart rows align like the screenshot. Feature 15 feeds the stat cards from real user-scoped data; later dashboard data features should replace activity/chart data without changing this compact spatial structure.

### Dashboard Stat Cards

File: components/dashboard/StatCard.tsx, lib/dashboard-stats.ts
Last updated: 2026-06-15

| Property         | Class                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Background       | `bg-surface`                                                        |
| Border           | `border border-border`                                              |
| Border radius    | `rounded-xl`                                                        |
| Text — primary   | value `text-text-primary text-[30px] font-semibold leading-9`        |
| Text — secondary | label `text-text-secondary text-[14px] font-medium leading-5`, helper `text-text-muted text-[12px] font-normal leading-4` |
| Spacing          | card `min-h-[128px] px-6 py-6`, trend row `mt-2 gap-2`              |
| Hover state      | `hover:-translate-y-1`                                               |
| Shadow           | shared card shadow plus hover lift `hover:shadow-[0_14px_32px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_2px_6px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]` |
| Accent usage     | trend text uses `text-success-darker`                                |

**Pattern notes:**
Dashboard stat cards are compact white metric surfaces sized for four cards inside the `max-w-[824px]` dashboard track. Use a muted 14px label, a 30px metric, and a small inline success trend text before the helper copy. Stat cards keep a subtle hover lift so the dashboard feels inspectable. Feature 15 feeds these cards from `lib/dashboard-stats.ts`: total jobs and average match rate use all user-scoped jobs, trends compare the current UTC week with the previous UTC week, companies researched counts jobs with saved `company_research`, and Jobs This Week counts jobs whose `found_at` is inside the current UTC week.

### Dashboard Activity Timeline

File: components/dashboard/RecentActivity.tsx, lib/dashboard-activity.ts
Last updated: 2026-06-15

| Property         | Class                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Background       | `bg-surface`                                                        |
| Border           | card/header `border border-border` / `border-b border-border`       |
| Border radius    | `rounded-xl`, dots `rounded-full`                                   |
| Text — primary   | title `text-[16px] font-semibold leading-6 text-text-primary`, items `text-[14px] font-medium leading-5 text-text-primary` |
| Text — secondary | timestamps/empty state `text-[12px] font-normal leading-4 text-text-muted` |
| Spacing          | card `min-h-[340px] px-6 py-6`, body `mt-5`, item gap `gap-4`, connector `h-7`, empty state `mt-5 min-h-[236px] px-6` |
| Hover state      | rows `hover:bg-surface-secondary focus-visible:bg-surface-secondary focus-visible:ring-2 focus-visible:ring-accent`, row text `group-hover:text-accent group-focus-visible:text-accent`, dots `group-hover:scale-125` |
| Shadow           | shared token card shadow                                            |
| Accent usage     | timeline dots use `bg-info` for company research and `bg-success` for completed job searches |

**Pattern notes:**
Recent Activity uses the same compact white card shell as the dashboard charts. Keep the header unseparated inside the card, then start the timeline at `mt-5`. Feature 16 feeds this card from `lib/dashboard-activity.ts`, merging completed `agent_runs` and researched `jobs` for the current user, sorting by timestamp, and limiting the list to five entries so the 340px card stays readable. Dots use token-colored fills with a soft surface ring, and the connector line is `bg-border`. Activity rows are focusable and hoverable so users can scan the feed with mouse or keyboard. When there is no activity, show the dashed `bg-surface-secondary` empty state instead of mock rows.

### Dashboard Chart Cards

File: components/dashboard/ChartFrame.tsx, components/dashboard/DashboardChartEmptyState.tsx, components/dashboard/DashboardRechartsTooltip.tsx, components/dashboard/CompanyResearchChart.tsx, components/dashboard/JobsFoundChart.tsx, components/dashboard/MatchDistributionChart.tsx, lib/dashboard-analytics.ts
Last updated: 2026-06-15

| Property         | Class                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Background       | card `bg-surface`, empty state `bg-surface-secondary`, Recharts bars `var(--color-info)` / `var(--color-success)` |
| Border           | card `border border-border`, chart grid `border-t border-dashed border-border` |
| Border radius    | card `rounded-xl`, bars `rounded-sm`                                |
| Text — primary   | titles `text-[16px] font-semibold leading-6 text-text-primary`      |
| Text — secondary | axes and empty state `text-[12px] font-normal leading-4 text-text-muted` |
| Spacing          | card `px-6 py-6`, charts `min-h-[340px]`, Recharts area/empty state `mt-7 h-[228px]` |
| Hover state      | cards `hover:shadow-[0_14px_32px_color-mix(...)]`, Recharts tooltip hover/focus cursor, empty states non-interactive |
| Shadow           | shared token card shadow, tooltip `shadow-[0_10px_24px_color-mix(in_srgb,var(--color-overlay)_12%,transparent)]` |
| Accent usage     | jobs line `stroke="var(--color-accent)"`; research bars use info blue, score bars use success green |

**Pattern notes:**
Feature 17 replaces mock chart arrays with DB-backed analytics from `lib/dashboard-analytics.ts` and Recharts internals. Keep each chart in the compact 340px `ChartFrame` shell with a 228px plot area. Jobs Found Over Time uses 30-day user-scoped `jobs.found_at` counts, Match Score Distribution uses 30-day user-scoped `jobs.match_score` buckets from 50-100%, and Company Research Activity uses 7-day successful company research `agent_logs.created_at` with researched-job fallback. Recharts colors must use project CSS variables, and charts with all-zero values must show `DashboardChartEmptyState` instead of fake data.

### Job Workflow Controls

File: components/find-jobs/JobsTable.tsx, components/job-workflow/useJobWorkflow.ts, components/job-workflow/JobApplicationWorkspace.tsx
Last updated: 2026-06-21

| Property         | Class                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Background       | toolbar/card/history `bg-surface`, inactive tabs/selects/history items `bg-surface-secondary`, active controls `bg-accent` / `bg-accent-light` |
| Border           | `border border-border`, active/hover `border-accent`                |
| Border radius    | cards `rounded-xl`, tabs `rounded-full`, controls `rounded-md`      |
| Text — primary   | card/history headings `text-text-primary`, selects `text-[13px] font-medium leading-5`, action buttons `text-[12px] font-semibold leading-4` |
| Text — secondary | helper copy `text-text-muted`, inactive controls `text-text-secondary` |
| Spacing          | toolbar `px-4 py-4 gap-3`, history panel `px-5 py-5`, history item `px-4 py-4`, mobile/tablet/laptop cards `px-4 py-4`, desktop table cells `px-3 py-4`, icon cell `px-2 py-4`, action buttons `px-2.5 gap-2`, detail workspace `px-6 py-6` |
| Hover state      | inactive controls `hover:border-accent hover:text-accent`, table rows `hover:bg-surface-secondary` |
| Shadow           | shared token card shadows, active tabs/compare CTA use accent token shadow |
| Accent usage     | active workflow filters, compare CTA, saved/compared state, history labels/open action, prep bullets |

**Pattern notes:**
Job workflow state is persisted client-side under `jobbiton-job-workflow-v1` because the available InsForge MCP tools expose DB reads/docs but no safe schema migration command in this environment. Active compare selection is scoped to the current search run: when the Find Jobs search scope changes, any active compare group with at least two jobs is archived into comparison history and the visible Compare count returns to zero for the new result set. The History control opens a compact panel of previous comparison groups with `Open comparison`, `Make active`, and `Remove` actions; old groups must not appear as active compare state on a fresh search unless the user explicitly restores them. Find Jobs now intentionally searches a small Adzuna candidate pool, filters out salary-missing rows, scores salary-listed candidates, and saves/displays only the strongest 10 jobs ordered by match score; do not show Adzuna total-available counts or live-search Previous/Next controls until the product direction changes again. The Find Jobs list uses cards through `xl` and only switches to the dense desktop table at extra-large widths, so medium and laptop screens do not squeeze eight columns. Desktop workflow tables must fit the parent content track without a forced `min-w-*`; use compact `px-3` cells, flexible `minmax()` columns, wrapping text in company/role/salary cells, top-aligned icon cells (`items-start`) so icons sit on the same row line as company/role text, a dedicated 270px Actions column, full labels (`Save`, `Compare`/`Added`, `Hide`/`Restore`), and a `flex-nowrap gap-2` action row so all three buttons stay on one line. Do not use `truncate`, `text-ellipsis`, or literal `...` in the Find Jobs workflow controls; content should remain readable or move to the card layout rather than disappear. Job cards and desktop rows act as full-row links to the job details page with `role="link"`, keyboard Enter/Space support, token focus outlines, and hover/focus `router.prefetch()` so manual row navigation stays warm like native `Link` navigation; embedded controls (`a`, `button`, `select`, inputs, labels) must be excluded from row navigation so workflow actions stay independent. The workflow toolbar filters Active, Saved, Tracked, and Hidden jobs locally per visible result set. Detail pages use `JobApplicationWorkspace` for status, private notes, save/hide/compare actions, and an interview prep mode that reuses saved company research plus matched/missing skills.

### Company Comparison View

File: app/compare/page.tsx
Last updated: 2026-06-20

| Property         | Class                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Background       | page `bg-background`, cards/table `bg-surface`, label cells `bg-surface-secondary` |
| Border           | cards/table `border border-border`, matrix separators `border-b border-border` and `border-l border-border` |
| Border radius    | cards/table `rounded-xl`, pills/buttons `rounded-md` / `rounded-full` |
| Text — primary   | headings `text-text-primary`, matrix body `text-[14px] font-medium leading-6` |
| Text — secondary | labels and empty copy `text-text-muted` / `text-text-secondary`      |
| Spacing          | page `px-4 py-6 sm:px-6 sm:py-8`, cards `px-5 py-5`, matrix cells `px-4 py-4` |
| Hover state      | links/buttons `hover:border-accent hover:text-accent` or `hover:bg-accent-dark` |
| Shadow           | shared token card shadows and accent CTA shadow                     |
| Accent usage     | match pills, skill pills, apply CTA, empty-state CTA                |

**Pattern notes:**
`/compare` is a protected server-rendered route. It accepts up to four selected job IDs via `?jobs=...`, scopes the InsForge query to the signed-in user, and renders responsive comparison cards plus a horizontal decision matrix. The cards emphasize company, role, match score, salary, location, strongest overlaps, prep gaps, and apply/detail actions. Short strongest-overlap items use compact accent pills; prep gaps and longer advisory notes use full-width `bg-accent-light` note panels so the violet background covers the entire text area instead of forming uneven islands behind wrapped copy. The matrix stays horizontally scrollable on smaller screens instead of compressing dense text into unreadable columns.

### Profile Attention Banner

File: components/profile/ProfileAttentionBanner.tsx
Last updated: 2026-06-09

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-surface`                                                          |
| Border           | `border border-border`                                                |
| Border radius    | `rounded-xl`                                                          |
| Text — primary   | `text-text-primary text-[14px] font-semibold leading-5`               |
| Text — secondary | `text-text-secondary text-[14px] font-normal leading-5`               |
| Spacing          | `px-6 py-6 gap-6`, missing tags `flex-wrap gap-2 lg:flex-nowrap lg:gap-1.5` |
| Hover state      | none                                                                  |
| Shadow           | `shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]` |
| Accent usage     | `bg-warning text-warning-foreground` for incomplete alert/tags, progress ring uses neutral track at 0% and accent purple once progress exists |

**Pattern notes:**
Profile status banners are white cards with default borders, compact 14px text, orange warning tags, and a token CSS progress ring. Missing-field tags should render as a single compact horizontal strip on desktop (`lg:flex-nowrap`) and wrap only on smaller screens. Desktop tags use tighter spacing (`lg:gap-1.5`, `lg:px-1.5`, `lg:text-[11px]`) so they fit in one line like the reference. The banner is data-driven from app-calculated completion state; a brand-new unsaved profile must render at 0% with an unfilled neutral gray ring, and must not count auth email or dropdown defaults as completed fields. Positive progress states use the purple accent fill. At 100%, the banner is not rendered at all; complete profiles should move straight into the Connected Accounts and Resume sections without a success card.

### Profile Resume Section

File: components/profile/ResumeSection.tsx
Last updated: 2026-06-12

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-surface`, upload area `bg-surface-secondary`, extraction panel `bg-surface`, text preview `bg-surface` inside `bg-surface-secondary` |
| Border           | card `border border-border`, upload area `border border-dashed border-border-muted`, preview/extraction/unavailable panel `border border-border` |
| Border radius    | `rounded-xl`, buttons `rounded-md`                                    |
| Text — primary   | `text-text-primary text-[16px] font-semibold leading-6`, upload/extraction title `text-[14px] font-semibold leading-5` |
| Text — secondary | `text-text-secondary text-[14px] font-normal leading-5`, upload/extraction note `text-[12px] font-normal leading-4`, preview text `text-[13px] leading-6` |
| Spacing          | card `px-6 py-6`, upload `px-6 py-10`, extraction panel `px-4 py-4 gap-3`, text preview wrapper `px-6 py-6`, preview unavailable panel `px-6 py-12`, upload gap `mt-4`, preview header `px-4 py-3`, footer `border-t border-border pt-6` |
| Hover state      | select/preview/open buttons `hover:border-accent hover:text-accent`, remove button `hover:border-error`, extract/generate buttons `hover:bg-accent-dark` |
| Shadow           | card shared profile shadow, upload icon/select button subtle token shadows |
| Accent usage     | upload glyph uses text-secondary, success messages use `text-success`, failed extraction/status messages use `text-error`, remove button uses `text-error`, extract/generate buttons use `bg-accent text-accent-foreground` |

**Pattern notes:**
Resume management UI is a white card with a soft secondary upload well and centered neutral upload icon stack. Empty upload wells use the title `Click to upload or drag and drop` plus format copy `PDF, DOC, DOCX, TXT, or RTF. Maximum file size 2MB.` Once a resume file is selected or a saved resume exists, the whole upload-well copy block collapses to a single `View current resume` link; do not keep the format note in that state. That link opens the selected file object URL or the authenticated `/api/resume/current` saved-resume route in a new tab. The visible select control is a label styled as the existing button and opens a hidden resume document input. Selecting a resume starts an immediate upload to InsForge storage and saves the resulting URL to the profile row so refreshes keep the document; do not require Save Profile just to persist the file. When a resume exists, show a bordered `Remove resume` button beside `Select Resume`; it uses error-red text on a white secondary surface, changes to `Removing...` while pending, clears the preview and saved resume URL on success, and leaves the generate action available. Show the selected or already saved resume name as a muted 12px caption under the button row. PDF resumes render an embedded bordered preview. TXT and DOCX resumes render readable text previews through `/api/resume/preview`; DOCX uses Mammoth raw-text extraction rather than injected HTML. DOC and RTF must not be embedded in an iframe because browsers do not preview them reliably, and should show a centered `Preview unavailable for this file type` panel with an `Open resume` link. Saved/uploading/generated/removed resumes show success-green status copy such as `Uploading resume...`, `Resume uploaded successfully.`, `Resume generated successfully.`, or `Resume removed.`, and successful AI extraction shows `Resume extracted. Review the fields below before saving.` in success green. Failed upload/extraction/generation/removal/status messages use error red. Show the compact extraction panel only for formats that can be parsed for extraction, currently PDF and TXT. Its extract action is an accent-purple filled button matching other primary resume actions. Include a compact preview header and `View full resume` link. The lower generate action stays below the preview, uses the same accent-purple filled button treatment, changes to `Generating...` while pending, disables with the same muted disabled state as extract, and writes its status message below the footer row.

### Profile Information Form

File: components/profile/ProfileInformationForm.tsx
Last updated: 2026-06-09

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-surface`, work role subpanel `bg-surface-secondary`               |
| Border           | card `border border-border`, section separators `border-t border-border` |
| Border radius    | card `rounded-xl`, inputs via `.profile-field` use `var(--radius-md)` |
| Text — primary   | title `text-text-primary text-[22px] font-semibold leading-8`, section `text-[16px] font-semibold leading-6` |
| Text — secondary | intro `text-text-secondary text-[13px] font-medium leading-5`, labels `.profile-field` 11px uppercase |
| Spacing          | card `px-8 py-8`, form `space-y-12`, sections `pt-10`, fields `grid gap-5 md:grid-cols-2` |
| Hover state      | `.profile-add-button:hover`, tags removable via `.profile-tag`, save/generate `hover:bg-accent-dark` |
| Shadow           | card shared profile shadow                                            |
| Accent usage     | focused fields use accent border/ring, work checkbox uses `.profile-checkbox` accent, add role text `text-accent`, save button `bg-accent` |

**Pattern notes:**
Profile forms use compact uppercase labels, 42px token-bordered controls, 2-column desktop grids, full-width rows for long fields, and simple token dividers between sections. Generic `.profile-field` text-input rules must exclude `input[type="checkbox"]`; checkbox controls inside profile fields use `.profile-checkbox` so they stay 13px square and never inherit the 42px text-input sizing. Brand-new profiles should show empty text inputs and blank dropdowns until the user explicitly enters values. Feature 06 makes these fields server-action backed; keep save feedback as centered 13px secondary text above the full-width accent submit button. Dropdown values must match the InsForge `profiles` constraints exactly; blank constrained dropdowns are submitted as blank UI state and stored as `null` by the server action.

### Profile Editor Wrapper

File: components/profile/ProfileEditor.tsx
Last updated: 2026-06-09

| Property         | Class           |
| ---------------- | --------------- |
| Background       | none            |
| Border           | none            |
| Border radius    | none            |
| Text — primary   | inherited       |
| Text — secondary | inherited       |
| Spacing          | `contents`      |
| Hover state      | delegated       |
| Shadow           | none            |
| Accent usage     | delegated       |

**Pattern notes:**
Profile editor is a non-visual client wrapper around the attention banner, connected accounts card, resume card, and information card. Keep it `className="contents"` so it does not add another card, spacing layer, or nested visual shell around the profile sections. Failed server-action saves return the submitted profile snapshot; the editor keys/remounts the uncontrolled form fields from that snapshot so user-entered data is preserved instead of falling back to the last saved backend row. The attention banner must calculate completion from the editor's active profile snapshot, not a stale server-only prop, so clearing saved fields and saving immediately lowers the displayed percentage and missing-field tags.

### Find Jobs Page Layout

File: components/find-jobs/FindJobsPageContent.tsx
Last updated: 2026-06-12

| Property         | Class                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Background       | page `bg-background`, main `bg-background`                          |
| Border           | none                                                                |
| Border radius    | none                                                                |
| Text — primary   | main `text-text-primary`                                            |
| Text — secondary | inherited by child sections                                         |
| Spacing          | main `px-6 py-8`, centered content stack `max-w-[1192px] gap-6`     |
| Hover state      | none                                                                |
| Shadow           | none                                                                |
| Accent usage     | pagination active page `bg-accent text-accent-foreground`           |

**Pattern notes:**
Find Jobs uses a centered wide work area on the standard app background, with the post-search state opening up to roughly a 1192px content width so the search card, filter row, and jobs table can breathe like the supplied reference image. The shared navbar stays in its homepage-like state with the `Start for free` CTA visible and no active icon/underline treatment. Pagination sits outside the table card, not in the card footer. A non-visual client wrapper now owns live search feedback and URL control state while the saved jobs list itself is loaded server-side from InsForge. Key the client wrapper by query/filter/sort/page so URL-driven changes remount cleanly without effect-based state syncing.

### Find Jobs Search Card

File: components/find-jobs/JobSearchCard.tsx
Last updated: 2026-06-12

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | card `bg-surface`, inputs `bg-surface`                                |
| Border           | card `border border-border`, inputs `border border-border`            |
| Border radius    | card `rounded-xl`, inputs/buttons `rounded-md`                        |
| Text — primary   | input values `text-text-primary text-[14px] font-normal leading-5`, button `whitespace-nowrap text-accent-foreground text-[14px] font-medium leading-5` |
| Text — secondary | labels `text-text-secondary text-[12px] font-semibold leading-4`, placeholders `placeholder:text-text-muted`, success banner `text-success-foreground` |
| Spacing          | card `px-6 py-6`, control gap `gap-4`                                 |
| Hover state      | primary action `hover:bg-accent-dark`, inputs `focus-within:border-accent focus-within:ring-1 focus-within:ring-accent`, disabled button `disabled:opacity-70` |
| Shadow           | shared card shadow, inputs subtle token shadow                        |
| Accent usage     | primary button `bg-accent`, success banner icon `text-warning`        |

**Pattern notes:**
Search controls match the supplied pre-search screenshot with uppercase 12px labels, 40px bordered input shells, placeholder-only example values, and a compact accent-purple action button. Do not use `defaultValue` for the example text; the fields should be controlled and empty with placeholders. Keep the Find Jobs action wide enough and `whitespace-nowrap` so the icon and label stay together inside one button. Post-search success state should look like the supplied reference image: the same shell stays in place, the submitted values remain in the inputs, and feedback becomes a full-width soft success banner directly under the controls using `border-success-light bg-success-lightest text-success-foreground` instead of plain inline text. Error feedback reuses the same banner structure with `border-error bg-surface text-error`.

### Find Jobs Filter Bar

File: components/find-jobs/JobFilterBar.tsx
Last updated: 2026-06-12

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | search/selects `bg-surface`                                           |
| Border           | search/selects `border border-border`                                 |
| Border radius    | controls `rounded-md`                                                 |
| Text — primary   | selects `text-text-primary text-[14px] font-normal leading-5`         |
| Text — secondary | filter input `text-text-secondary`, placeholder `placeholder:text-text-muted`, query error banner `text-error` |
| Spacing          | controls `px-3`, grid `gap-3`                                         |
| Hover state      | selects `hover:border-accent focus:border-accent focus:ring-1 focus:ring-accent` |
| Shadow           | each control uses subtle token shadow                                 |
| Accent usage     | focus border/ring only                                                |

**Pattern notes:**
The filter controls are three separate 40px white controls, not one combined toolbar card: wide filter input, All Matches select, and Match Score select. Use native `select` controls with `appearance-none`, enough column width, and a custom caret overlay so labels stay on one line and the control rolls down an option list. The Match Score control needs extra width/padding so the label does not crowd the caret or focus ring. Feature 11 wires all three controls to URL search params (`q`, `match`, `sort`) and resets pagination to page 1 whenever a filter or sort changes. Filter and sort value types live in `components/find-jobs/types.ts`, along with parser helpers that avoid unchecked type assertions in select handlers. Temporary latest-search rows must also be filtered/sorted in the client using the active controls, so selected states like `High Match` + `Oldest` always match the visible rows after a live search. Successful searches add a `run` URL param from the created `agent_runs.id`; filter, sort, pagination, and refresh behavior must preserve that run param so the table remains scoped to the current search instead of mixing rows from older searches.

### Find Jobs Table

File: components/find-jobs/JobsTable.tsx
Last updated: 2026-06-21

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | card/header `bg-surface`, row hover `hover:bg-surface-secondary`      |
| Border           | card `border border-border`, rows/header `border-border`              |
| Border radius    | card `rounded-xl`, company icon `rounded-full`, source `rounded-full`, score bars `rounded-full` |
| Text — primary   | company `text-text-primary text-[14px] font-semibold leading-5`, role/salary `text-text-primary text-[14px] font-normal leading-5` |
| Text — secondary | headers `text-text-secondary text-[12px] font-semibold leading-4`, dates `text-text-muted text-[14px] font-normal leading-5` |
| Spacing          | headers `px-6/px-4 py-4`, rows `px-3/px-2/px-4 py-4`                 |
| Hover state      | linked rows `hover:bg-surface-secondary focus-visible:outline-accent` |
| Shadow           | shared card shadow                                                    |
| Accent usage     | source badges `bg-accent-light text-accent`, score fills/text use `bg-success text-success`, `bg-info text-info`, or `bg-warning text-warning` |

**Pattern notes:**
The table stays dense and scan-friendly with uppercase headers, 14px row text, bordered white rows, circular company marker chips, inline score bars, a `SOURCE` column with purple `Search` pills, and no internal pagination footer. Post-search state uses a dedicated narrow icon rail as the first grid column so the circular building glyphs stack cleanly down the left edge, with the `COMPANY` header spanning both the icon rail and company-name column. The marker should read like a soft bordered circle with a muted building glyph inside, matching the supplied screenshot rather than a square badge. Individual rows are full-width links to `/find-jobs/[id]` so the whole listing is clickable and keyboard focusable. The `/find-jobs` Server Component renders saved rows scoped to the active `run` when one exists, filters out salary-missing records, orders by match score, and caps the visible list at 10 rows. Avoid total-count footers, live Adzuna Previous/Next controls, and broad all-user saved-job queries unless a separate archive mode is explicitly designed.

### Job Details Page Layout

File: components/job-details/JobDetailsPageContent.tsx
Last updated: 2026-06-13

| Property         | Class                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Background       | page `bg-background`, cards `bg-surface`                            |
| Border           | page `border-x border-border`, cards `border border-border`         |
| Border radius    | cards `rounded-xl`, buttons `rounded-md`, badges `rounded-full`     |
| Text — primary   | headings `text-text-primary font-semibold`, body `text-[15px] font-medium leading-6 text-text-primary` |
| Text — secondary | labels `text-text-secondary text-[12px] font-semibold leading-4`, muted copy `text-text-muted` |
| Spacing          | main `px-6 py-9`, content `max-w-[1040px] gap-6`, cards `px-6 py-6`, metadata grid `gap-3` |
| Hover state      | back/job links `hover:text-accent`, bordered actions `hover:border-accent hover:text-accent`, primary actions `hover:bg-accent-dark` |
| Shadow           | shared token card shadow                                            |
| Accent usage     | active badges/buttons `bg-accent text-accent-foreground`, research icon/tag accents, missing-skill badges `bg-accent-muted text-accent` |

**Pattern notes:**
Job details pages use a centered `max-w-[1040px]` work column so real job metadata has room to breathe while keeping the same white rounded cards and full-width purple apply CTA. The metadata row uses `lg:grid-cols-[1fr_1.55fr_1fr_1fr]`, intentionally giving Location more horizontal space than Salary, Job Type, and Date Found. Info-card values use `break-words` rather than `truncate`, so longer location names wrap inside the card instead of being hidden. The header card uses a token CSS building placeholder and a green match badge next to the company name. AI match reasoning keeps an uppercase 12px label with a success icon chip; skill comparison uses green pills for matched skills and accent-muted pills for gaps. The description card renders every saved character without clamping, preserves paragraph breaks with `whitespace-pre-wrap`, renders saved structured arrays when present, and shows a bordered `bg-surface-secondary` callout with an `Open full job description` link when the saved Adzuna preview ends mid-sentence.

### Job Details Icon Treatments

File: app/globals.css
Last updated: 2026-06-13

| Property         | Class                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Background       | profile shell `bg-surface`, building/research empty `bg-surface-secondary`, info chips use token soft backgrounds |
| Border           | profile/building shells `border border-border`                      |
| Border radius    | profile `rounded-full`, building `rounded-xl`, info chips `rounded-lg`, match chip `rounded-full` |
| Text — primary   | inherited                                                           |
| Text — secondary | muted glyphs `text-text-muted` / `text-info-muted`, colored glyphs `text-success`, `text-info-medium`, `text-accent` |
| Spacing          | icon shells are fixed-size CSS glyph controls; component spacing comes from the parent cards |
| Hover state      | none at icon level                                                  |
| Shadow           | subtle token inset/low elevation via `color-mix(... var(--color-overlay) ...)` |
| Accent usage     | location/info/research icons use info/accent/success token families |

**Pattern notes:**
The circled elements from the job details screenshot are CSS glyphs, not image assets: `.job-details-user-control`, `.job-details-building-icon`, `.job-details-info-icon-*`, and `.job-details-match-icon`. Keep them token-only and sized as stable fixed-format controls so card layout does not shift. The navbar profile glyph is wrapped in a 34px round shell. Header and empty-state building marks use a soft secondary surface, muted glyph color, and subtle shadow. Salary/location/job-type/date info chips use 42px rounded token backgrounds, and match/research/document chips use 34px circular shells.

### Job Details Company Research Card

File: components/job-details/CompanyResearchPanel.tsx, components/job-details/JobDetailsPageContent.tsx
Last updated: 2026-06-22

| Property         | Class                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Background       | card `bg-surface`, loading/dossier panels `bg-surface-secondary`, loading scan band `bg-accent-light`, loading step items `bg-surface`, empty icon `bg-surface-secondary`, research icon/loading pulse `bg-accent-muted` |
| Border           | card/panels/queued steps `border border-border`, active loading step `border-accent`, header divider and sources strip `border-b/border-t border-border` |
| Border radius    | card/panels `rounded-xl`, button `rounded-md`, icon chips `rounded-full` |
| Text — primary   | title/loading heading/panel headings `text-[14px/18px] font-semibold text-text-primary`, source URLs `text-[12px] font-medium leading-4 text-text-primary`, button `text-[14px] font-semibold leading-5 text-accent-foreground` |
| Text — secondary | loading body `text-[13px] font-medium leading-5 text-text-secondary`, step status/source label `text-[12px] font-semibold/medium leading-4 text-text-muted/text-text-secondary`, empty copy `text-[14px] font-normal leading-5 text-text-muted`, button error `text-[12px] font-medium leading-4 text-error` |
| Spacing          | header `px-6 py-4`, loading wrapper `px-6 py-6`, loading panel `px-5 py-5`, loading step rows `px-3 py-3`, loading step grid `mt-5 gap-3`, empty state `min-h-[246px] px-6 py-14`, dossier body `px-6 py-6 space-y-5`, panels `px-4 py-4`, sources full-width strip `px-6 pb-5 pt-4` with URL row `mt-3 gap-x-5 gap-y-2`, research button wrapper `gap-2`, button `h-10 gap-2 px-4` |
| Hover state      | research/apply buttons `hover:bg-accent-dark`, source links `hover:text-accent`, disabled research button `disabled:opacity-70` |
| Shadow           | shared token card shadow, loading/panel subtle `shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_3/4%,transparent)]`, progress track inset shadow |
| Accent usage     | research CTA/progress fill/active steps `bg-accent text-accent-foreground`, loading pulse and tags `bg-accent-muted text-accent`, section icons rotate through `bg-info-lightest text-info-medium`, `bg-success-lightest text-success`, and `bg-accent-muted text-accent` |

**Pattern notes:**
The company research surface is now a client panel because the header button, loading body, error state, and route refresh share interaction state. While `POST /api/agent/research` is running, render the animated multistep loading card with Motion (`motion/react`), an accent progress bar, a soft moving scan band, a breathing search glyph, a step counter pill, active-step pulse rings, and subtle animated status dots. The four status rows are resolving site, browsing pages, reading signals, and building the dossier. Keep the loading card mounted until the returned dossier is placed in local optimistic state; then call `router.refresh()` in a transition so the route updates in the background without flashing the empty/static state. Preserve `window.scrollY` before the request and restore it after the refresh settles so the user stays at the research panel rather than jumping to the top of the page. Respect `useReducedMotion()` for looping/decorative animation. Completed dossiers render as polished token cards with section-specific CSS icon chips. Source entries intentionally match the compact reference treatment: a flat top-bordered strip with the literal `SOURCES` label and simple live absolute `http(s)` URL links underneath. Sources must be verified employer-site URLs; Adzuna, ATS, and job-board domains are filtered, and the UI must not invent a company-domain fallback. Existing dossiers can be overwritten by the same control, which changes to `Research Again`.

### Job Details Navbar

File: components/job-details/JobDetailsNavbar.tsx
Last updated: 2026-06-22

| Property         | Class                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Background       | fixed custom `.navbar-glass` gradient glass with backdrop blur/saturation |
| Border           | `.navbar-glass` tokenized translucent bottom border                  |
| Border radius    | none                                                                |
| Text — primary   | active find-jobs link `text-accent text-[14px] font-medium leading-5` |
| Text — secondary | inactive links/sign-out `text-text-dark` / `text-text-secondary`    |
| Spacing          | fixed header `min-h-16 px-4/px-6 py-3`, spacer `h-[105px] lg:h-16`, nav `gap-8`, auth actions `gap-5`, profile shell `.job-details-user-control` |
| Hover state      | inactive nav/sign-out `hover:text-accent`                           |
| Shadow           | `.navbar-glass` inset highlight plus soft overlay/accent shadows     |
| Accent usage     | active Find Jobs text only                                          |

**Pattern notes:**
The job-details reference uses a protected top bar with the logo, compact nav links, a profile glyph in a soft circular shell, and a text sign-out control instead of the homepage CTA. The bar is fixed to the top with the shared `.navbar-glass` surface and a matching spacer immediately after it so content remains visible below the locked navbar. The sign-out control uses `SignOutButton variant="nav"` for the compact token text treatment.

## Non-Visual Integrations

### InsForge Database Schema

Files: InsForge backend tables and storage bucket
Last updated: 2026-06-09

**Pattern notes:**
The backend foundation lives in InsForge, not app-side UI files. Feature 4 created `profiles`, `agent_runs`, `jobs`, and `agent_logs` with own-row RLS policies, practical constraints, query indexes, and the private `resumes` bucket. No visual components or reusable classes were introduced.

### PostHog Initialization

Files: instrumentation-client.ts, lib/posthog-client.ts, lib/posthog-server.ts, lib/posthog-events.ts, components/auth/PostHogIdentify.tsx
Last updated: 2026-06-09

**Pattern notes:**
PostHog is initialized through the root `instrumentation-client.ts` file and kept out of visual component styling. Authenticated pages identify users through `PostHogIdentify`, logout resets the browser identity, and event capture is restricted to the typed event names in `lib/posthog-events.ts`.

### Adzuna Job Discovery

Files: app/api/agent/find/route.ts, agent/adzuna.ts, agent/matcher.ts, lib/adzuna.ts, lib/utils.ts, proxy.ts
Last updated: 2026-06-22

**Pattern notes:**
Feature 10 keeps the Adzuna and matching flow entirely server-side. The client submits JSON to `POST /api/agent/find`; the route validates input, captures `job_search_started`, and calls the agent orchestration module. The agent creates an `agent_runs` row, searches Adzuna with `category=it-jobs`, filters out salary-missing candidates, scores the remaining candidate pool against the saved profile, inserts only the strongest 10 saved `jobs` rows, records warnings/errors in `agent_logs`, and emits one `job_found` event per saved job. Matching prefers OpenRouter when `OPENROUTER_API_KEY` exists, otherwise uses server-side Gemini when `GEMINI_API_KEY` exists, then falls back to a deterministic heuristic scorer so local development still returns usable results. The fallback matcher must use skill aliases, word/phrase boundaries, title-token overlap, and skill coverage rather than raw substring matching so relevant jobs can cross the 70-point High Match threshold while weak matches remain low. `proxy.ts` includes `/api/agent/:path*` so stale InsForge sessions refresh before authenticated search requests run.

### Saved Jobs Filtering and Pagination

Files: app/find-jobs/page.tsx, components/find-jobs/FindJobsClient.tsx, components/find-jobs/JobFilterBar.tsx, components/find-jobs/types.ts
Last updated: 2026-06-22

**Pattern notes:**
Feature 11 loads saved jobs from InsForge in the `/find-jobs` Server Component, not in the client component. The route module owns the current user-scoped top-10 query shape: active `run` scoping by `agent_runs.id`, `q` search across `company` or `title`, `match_score >= 70` for High Match, `match_score < 70` for Low Match, salary-required row mapping, and score-desc ordering. Text search is tokenized before building the InsForge OR filter so punctuation-heavy user input does not produce malformed query syntax. Query failures return a safe `We could not load your saved jobs right now.` message and the client renders it as a bordered token error banner above the table. The client wrapper uses `router.replace(..., { scroll: false })` to update URL params while preserving the active `run` param. A successful Adzuna search renders the returned jobs immediately as a temporary latest-search view, navigates to `/find-jobs?run={runId}`, and that temporary view applies the active filter query and match filter before rendering.

### Homepage Navbar

File: components/layout/Navbar.tsx
Last updated: 2026-06-22

| Property         | Class                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Background       | sticky glass `bg-surface/58 backdrop-blur-xl`                                                   |
| Border           | `border-b border-border`                                                                       |
| Border radius    | none                                                                                           |
| Text — primary   | `text-text-dark text-[14px] font-medium leading-5`                                             |
| Text — secondary | none                                                                                           |
| Spacing          | `h-16 px-6 gap-12`, brand link `inline-flex items-center`                                      |
| Hover state      | `hover:text-accent`, primary CTA via `.button-primary:hover` with a darker bluish-charcoal lift |
| Shadow           | navbar glass shadow `shadow-[0_10px_30px_color-mix(in_srgb,var(--color-overlay)_10%,transparent)]`, primary CTA uses `.button-primary` layered shadow |
| Accent usage     | `text-accent` for link hover; focus ring uses `outline: 2px solid var(--color-accent)`        |

**Button pattern (Primary CTA):**
`.button-primary .button-primary-sm`

**Pattern notes:**
Top navigation uses a sticky full-width glass token surface with a constrained 1440px inner row. The reusable `BrandLogo` wordmark link points to `/`, and `proxy.ts` allows `/` through even when authenticated so it lands on the homescreen URL (`localhost:3000` in local dev) from every page that renders the shared navbar. The right side includes the compact `ThemeToggle` before the optional CTA. Primary header CTAs use the shared compact charcoal button system defined in `app/globals.css` with 38px height, white text, a soft elevated shadow, and a darker bluish-charcoal hover. On the homepage, `app/page.tsx` passes auth-aware CTA props: logged-out users see `Start for free` to `/login`, logged-in users see `Go to Profile` to `/profile`. Keep shared, dashboard, and job-details navbars visually aligned as sticky glass surfaces so the Animate UI background remains visible behind them.

### Homepage Footer

File: components/layout/Footer.tsx
Last updated: 2026-06-08

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-surface`                                       |
| Border           | `border-x border-border`                           |
| Border radius    | none                                               |
| Text — primary   | `supporting-text-tone text-[16px] font-normal leading-6` |
| Text — secondary | none                                               |
| Spacing          | `px-6 py-12 gap-8 md:px-16`, brand link `inline-flex items-center` |
| Hover state      | none                                               |
| Shadow           | none                                               |
| Accent usage     | none                                               |

**Pattern notes:**
Footer mirrors the shared `BrandLogo` treatment and keeps links on the same restrained token surface used throughout the landing page. The footer logo/wordmark points to `/` and relies on the same root-route proxy behavior. Footer nav text uses the exact same shared `supporting-text-tone` class as the final CTA supporting copy, including on hover.

### Homepage Hero

File: components/homepage/Hero.tsx
Last updated: 2026-06-09

| Property         | Class                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Background       | `soft-gradient-panel bg-surface-tertiary`                                                       |
| Border           | `border border-border border-t`                                                                |
| Border radius    | `rounded-xl` for preview image                                                                 |
| Text — primary   | `text-text-primary text-[48px] md:text-[64px] font-bold`                                       |
| Text — secondary | `supporting-text-tone text-[20px] font-normal leading-8`                                       |
| Spacing          | `px-6 pt-16 md:px-16 md:pt-20`                                                                 |
| Hover state      | primary via `.button-primary:hover` with a darker bluish-charcoal lift, secondary via `.button-secondary:hover` |
| Shadow           | shared button classes provide the CTA shadows                                                  |
| Accent usage     | `text-accent`, `border-accent`, focus ring via shared button classes                           |

**Button pattern (Primary):**
`.button-primary .button-primary-lg`

**Button pattern (Secondary):**
`.button-secondary .button-secondary-lg`

**Pattern notes:**
Landing-page hero sections use the global `soft-gradient-panel` helper with compact dark charcoal primary buttons, white text, and soft bordered secondary buttons. Both CTAs use the same 38px height and 14px type seen in the reference screenshot, and the primary hover shifts into a darker blue-charcoal without getting washed out. The hero accepts CTA href/label props so the homepage can render logged-out `Get Started` to `/login` and logged-in `Go to Profile` to `/profile`.

### Homepage Feature Text

File: components/homepage/FeatureText.tsx
Last updated: 2026-06-08

| Property         | Class                                                       |
| ---------------- | ----------------------------------------------------------- |
| Background       | none                                                        |
| Border           | `border-b border-border`, active `border-l-2 border-success` |
| Border radius    | none                                                        |
| Text — primary   | `text-text-slate text-[22px] font-semibold leading-8`       |
| Text — secondary | `text-text-secondary text-[20px] font-normal leading-8`     |
| Spacing          | `px-8 py-9 md:px-16 pl-8`                                   |
| Hover state      | none                                                        |
| Shadow           | none                                                        |
| Accent usage     | `border-success` for selected feature rail                  |

**Pattern notes:**
Feature rows are full-width bordered rows, not cards. The active row uses a slim success-green rail like the design reference.

### Homepage Product Feature Sections

File: components/homepage/ProductFeatures.tsx
Last updated: 2026-06-08

| Property         | Class                                                       |
| ---------------- | ----------------------------------------------------------- |
| Background       | `bg-surface-muted` for image panels                         |
| Border           | `border-t border-b border-r border-l border-border`         |
| Border radius    | `rounded-xl` for product images                             |
| Text — primary   | `text-text-primary text-[48px] md:text-[56px] font-bold`    |
| Text — secondary | inherited from Homepage Feature Text                        |
| Spacing          | `px-8 py-16 md:px-16 md:py-24`, image panels `px-6 py-16`   |
| Hover state      | none                                                        |
| Shadow           | none                                                        |
| Accent usage     | inherited from Homepage Feature Text                        |

**Pattern notes:**
Landing feature sections use two-column bordered bands with image panels on muted surfaces and typography scaled to screenshot section headings.

### Homepage Testimonial

File: components/homepage/Testimonial.tsx
Last updated: 2026-06-08

| Property         | Class                                                            |
| ---------------- | ---------------------------------------------------------------- |
| Background       | none                                                             |
| Border           | none                                                             |
| Border radius    | `rounded-md` for avatar                                          |
| Text — primary   | `text-text-slate text-[32px] md:text-[40px] font-medium`         |
| Text — secondary | `text-text-secondary text-[14px] font-normal leading-5`          |
| Spacing          | `px-6 py-24 md:px-16`                                            |
| Hover state      | none                                                             |
| Shadow           | none                                                             |
| Accent usage     | `text-accent` for uppercase eyebrow                              |

**Pattern notes:**
Testimonials are centered, text-led sections with compact identity rows and no card container.

### Homepage Final CTA

File: components/homepage/FinalCta.tsx
Last updated: 2026-06-09

| Property         | Class                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Background       | `soft-gradient-panel diagonal-band`                                                            |
| Border           | `border-y border-border border-t`                                                              |
| Border radius    | none                                                                                           |
| Text — primary   | `text-text-primary text-[48px] md:text-[64px] font-bold`                                       |
| Text — secondary | `text-text-secondary text-[20px] font-normal leading-8`                                        |
| Spacing          | `px-6 py-20 md:px-16 md:py-28`                                                                 |
| Hover state      | primary via `.button-primary:hover` with a darker bluish-charcoal lift, secondary via `.button-secondary:hover` |
| Shadow           | shared button classes provide the CTA shadows                                                  |
| Accent usage     | focus ring uses accent; secondary hover border softly picks up accent                          |

**Button patterns:**
Same as Hero section — `.button-primary.button-primary-lg` and `.button-secondary.button-secondary-lg`.

**Pattern notes:**
Final CTA reuses the same button styling and gradient treatment as the hero section for consistency. Supporting copy uses the shared `supporting-text-tone` class from the reference image. Diagonal bands are global token-based helpers used only as visual separators between sections. Like the hero, this component accepts CTA href/label props so logged-in homepage users are sent directly to `/profile`.

### Shared Supporting Text

File: app/globals.css
Last updated: 2026-06-20

| Property         | Class                    |
| ---------------- | ------------------------ |
| Background       | none                     |
| Border           | none                     |
| Border radius    | none                     |
| Text — primary   | `.supporting-text-tone`  |
| Text — secondary | none                     |
| Spacing          | none                     |
| Hover state      | none                     |
| Shadow           | none                     |
| Accent usage     | none                     |

**Pattern notes:**
Use `.supporting-text-tone` anywhere the landing page needs the soft gray supporting copy color. Final CTA body copy and footer navigation should both use this exact class.

### Shared Buttons

File: app/globals.css
Last updated: 2026-06-08

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `.button-primary`, `.button-secondary`                                |
| Border           | `.button-primary` uses a subtle surface-tinted border; `.button-secondary` uses token border; focus uses accent outline |
| Border radius    | `border-radius: var(--radius-md)`                                     |
| Text — primary   | `.button-primary { color: var(--color-surface) }`; dark mode overrides to `var(--color-accent-foreground)` |
| Text — secondary | `.button-secondary { color: var(--color-text-slate) }`                |
| Spacing          | `.button-primary-sm`, `.button-primary-lg`, `.button-secondary-lg`    |
| Hover state      | `.button-primary:hover` adds a darker bluish-charcoal tint in light mode and an accent lift in dark mode, `.button-secondary:hover` remains neutral |
| Shadow           | layered CTA shadows in `.button-primary` and `.button-secondary`      |
| Accent usage     | focus rings, secondary hover border, and dark-mode primary CTA background pick up `--color-accent` |

**Pattern notes:**
Use shared global button classes for every landing-page CTA instead of repeating raw utility strings. In light mode, primary CTAs stay compact 38px-tall charcoal buttons with white text and a darker bluish-charcoal hover. In dark mode, primary CTAs must not use `var(--color-surface)` for text because that token becomes a dark panel color; dark mode overrides `.button-primary` and `.button-caret` to `var(--color-accent-foreground)` and uses an accent gradient so navbar, hero, and final CTA buttons remain readable.

### Auth Login Card

File: components/auth/LoginForm.tsx
Last updated: 2026-06-21

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-surface` shell, `soft-gradient-panel` left pane                   |
| Border           | `border border-border`, pane divider `md:border-r`, error alert `border-error` |
| Border radius    | `rounded-xl` shell, `rounded-md` controls                             |
| Text — primary   | `text-text-slate text-[44px] md:text-[48px] font-bold leading-[0.98]`, right title `text-text-primary text-[24px] font-semibold leading-8` |
| Text — secondary | `text-text-secondary text-[15px] leading-6`, captions `text-[12px] leading-5`, alert `text-error text-[13px] font-medium leading-5` |
| Spacing          | shell `max-w-[760px]`, left `px-8 py-8 md:px-10`, right `px-8 py-10`, alert `px-4 py-3`, button stack `space-y-3` |
| Hover state      | `hover:border-accent hover:text-text-primary`                         |
| Shadow           | `shadow-[0_14px_30px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)]` |
| Accent usage     | `text-accent` for security/provider icons and provider button hover   |

**Pattern notes:**
Auth entry uses a centered split panel beneath the normal navbar. The left pane carries the security pill, large sign-in headline, and short explanatory copy on the shared token gradient without a bottom helper footer. The right pane stays white and focused on provider selection. Provider buttons remain white, bordered, compact, and full width with restrained text sizing.

### Auth Sign Out Button

File: components/auth/SignOutButton.tsx
Last updated: 2026-06-08

| Property         | Class                                            |
| ---------------- | ------------------------------------------------ |
| Background       | `.button-secondary`                              |
| Border           | `.button-secondary` token border                 |
| Border radius    | `border-radius: var(--radius-md)`                |
| Text — primary   | `.button-secondary { color: var(--color-text-slate) }` |
| Text — secondary | none                                             |
| Spacing          | `.button-primary-sm`                             |
| Hover state      | `.button-secondary:hover`                        |
| Shadow           | `.button-secondary` subtle surface shadow        |
| Accent usage     | disabled uses `disabled:opacity-60`; focus/hover inherited from shared button styles |

**Pattern notes:**
Auth sign-out actions reuse the shared secondary button styling rather than introducing a separate destructive/auth-specific button pattern. Loading text stays inside the same fixed compact button shell.

### Protected Auth Shell

File: components/protected/ProtectedShell.tsx
Last updated: 2026-06-08

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-background` content area, `bg-surface` panel                      |
| Border           | `border-x border-border` page frame, `border border-border` panel     |
| Border radius    | `rounded-md`                                                          |
| Text — primary   | `text-text-primary text-[32px] font-semibold leading-10`              |
| Text — secondary | `text-text-secondary text-[15px] leading-6`                           |
| Spacing          | `px-6 py-16` page area, panel `px-6 py-7 sm:px-8`                     |
| Hover state      | sign-out uses shared `.button-secondary`                              |
| Shadow           | `shadow-[0_20px_50px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)]` |
| Accent usage     | `text-accent` for authenticated eyebrow                               |

**Pattern notes:**
Temporary protected-route shells keep the existing navbar/footer frame and use one compact status panel. Future full dashboard/profile/jobs pages should replace the panel content while retaining the page-frame rhythm unless the page-specific design requires a denser operational layout.

### Jobbiton Brand Mark

File: components/layout/BrandLogo.tsx
Last updated: 2026-06-20

| Property         | Class / Pattern                                                  |
| ---------------- | ---------------------------------------------------------------- |
| Background       | token-built `.brand-logo-mark` with accent surface               |
| Border           | none                                                             |
| Border radius    | `rounded-[10px]` mark, `rounded-[3px]` briefcase body            |
| Text — primary   | `text-text-primary text-[20px] font-semibold tracking-normal`    |
| Text — secondary | none                                                             |
| Spacing          | `inline-flex items-center gap-3`                                 |
| Hover state      | Motion hover/tap scale on the logo group                         |
| Shadow           | token `color-mix()` accent shadow on the mark                    |
| Accent usage     | briefcase body, latch, and spark use accent/accent-foreground tokens |

**Pattern notes:**
Use `BrandLogo` for all visible Jobbiton branding instead of `/logo.png` or text-only marks. The mark is a compact briefcase-plus-spark symbol, matching the job-search product without adding external image dependencies.

### shadcn-style Button Primitive

File: components/ui/button.tsx
Last updated: 2026-06-20

| Property         | Class / Pattern                                                  |
| ---------------- | ---------------------------------------------------------------- |
| Background       | `primary bg-accent`, `secondary bg-surface`, `ghost/nav transparent` |
| Border           | `secondary border border-border`; focus uses accent outline      |
| Border radius    | `rounded-md`                                                     |
| Text — primary   | `text-accent-foreground` or `text-text-primary`                  |
| Text — secondary | `text-text-secondary` for ghost/nav                              |
| Spacing          | sizes `sm`, `md`, `lg`, `icon`                                   |
| Hover state      | token hover colors, Motion `whileTap` scale                      |
| Shadow           | primary accent shadow; loading pulse uses token `boxShadow`      |
| Accent usage     | loading spinner, sheen, focus, and primary background            |

**Pattern notes:**
Use this primitive for repeated app actions, especially any button that can enter a pending state. Pending buttons must pass `loading` plus a meaningful `loadingLabel`; the primitive handles spinner, sheen, pulse, disabled state, and reduced-motion behavior.

### Theme Toggle

File: components/theme/ThemeToggle.tsx, components/ui/switch.tsx
Last updated: 2026-06-20

| Property         | Class / Pattern                                                  |
| ---------------- | ---------------------------------------------------------------- |
| Background       | switch track uses `bg-accent` when active, `bg-surface-secondary` when inactive |
| Border           | `border border-border`                                           |
| Border radius    | `rounded-full`                                                   |
| Text — primary   | icon-only visual state with screen-reader label                  |
| Text — secondary | none                                                             |
| Spacing          | compact navbar control, no card wrapper                          |
| Hover state      | token border/text hover inherited from control                   |
| Shadow           | switch thumb uses token overlay shadow                           |
| Accent usage     | active dark/light state uses accent tokens                       |

**Pattern notes:**
Dark mode is the primary theme. `app/layout.tsx` renders `html[data-theme="dark"]` by default and the pre-paint script honors `jobbiton-theme` from local storage. Toggle code must continue writing `jobbiton-theme` and dispatching `jobbiton-theme-change`.

### App Motion System

File: components/layout/PageTransition.tsx, components/motion/Reveal.tsx, components/motion/ScrollFlow.tsx
Last updated: 2026-06-20

| Property         | Class / Pattern                                                  |
| ---------------- | ---------------------------------------------------------------- |
| Background       | none                                                             |
| Border           | none                                                             |
| Border radius    | none                                                             |
| Text — primary   | inherited                                                        |
| Text — secondary | inherited                                                        |
| Spacing          | components preserve their own layout spacing                     |
| Hover state      | page transitions animate opacity, y, scale, and blur             |
| Shadow           | none                                                             |
| Accent usage     | none                                                             |

**Pattern notes:**
Use `Reveal`, `RevealGroup`, and `RevealItem` for page section entrances. Keep animations stateful and purposeful, respect `useReducedMotion()`, and avoid adding decorative motion that obscures core workflows.

### Scroll-Linked Motion

File: components/motion/ScrollFlow.tsx, app/page.tsx, components/homepage/Hero.tsx, components/homepage/JobbitonFlowSections.tsx, components/homepage/ProductFeatures.tsx, components/layout/PageIntro.tsx
Last updated: 2026-06-20

| Property         | Class / Pattern                                                  |
| ---------------- | ---------------------------------------------------------------- |
| Background       | progress track `bg-border`, progress fill `bg-accent`           |
| Border           | inherited section borders                                        |
| Border radius    | none                                                             |
| Text — primary   | inherited                                                        |
| Text — secondary | inherited                                                        |
| Spacing          | wrappers preserve child layout spacing                           |
| Hover state      | none                                                             |
| Shadow           | inherited from animated child surfaces                           |
| Accent usage     | sticky scroll progress fill uses accent                          |

**Pattern notes:**
Use `ScrollFloat` when an element should respond continuously to scroll position with subtle x/y drift, opacity, and optional scale. Use `ScrollProgressBand` once near the top of long editorial pages. Both helpers respect `useReducedMotion()` and must stay token-only. Avoid high intensities on form-heavy operational surfaces; PageIntro uses small opposing horizontal movement while landing page showcase images/cards can use stronger motion.

### Profile Scroll Motion

File: components/profile/ProfileEditor.tsx, components/profile/ProfileInformationForm.tsx
Last updated: 2026-06-20

| Property         | Class / Pattern                                                  |
| ---------------- | ---------------------------------------------------------------- |
| Background       | inherited profile cards `bg-surface` and form blocks             |
| Border           | inherited `border-border` card and section separators            |
| Border radius    | inherited `rounded-xl` card shells                               |
| Text — primary   | inherited profile form typography                                |
| Text — secondary | inherited profile form typography                                |
| Spacing          | profile column `gap-6`, form section `space-y-12`                |
| Hover state      | inherited button/tag/input states                                |
| Shadow           | inherited profile card shadows                                   |
| Accent usage     | inherited form actions, focus states, completion accents         |

**Pattern notes:**
Profile must show scroll-linked animation beyond the shared page intro. Wrap the attention banner, resume card, profile information card, and each major form section in `ScrollFloat` with low intensity so the long form feels alive while remaining usable. Do not increase motion so much that inputs shift away from the cursor while editing.

### Responsive App Frame

File: components/layout/Navbar.tsx, components/dashboard/DashboardNavbar.tsx, components/job-details/JobDetailsNavbar.tsx
Last updated: 2026-06-20

| Property         | Class / Pattern                                                  |
| ---------------- | ---------------------------------------------------------------- |
| Background       | `bg-surface` navbar, page content `bg-background`                |
| Border           | `border-b border-border`; page frames keep token borders         |
| Border radius    | no navbar card radius                                            |
| Text — primary   | `text-text-primary`                                              |
| Text — secondary | `text-text-secondary`                                            |
| Spacing          | mobile `px-4`, tablet `sm:px-6`, desktop constrained max widths  |
| Hover state      | nav links use token hover/active states                          |
| Shadow           | no decorative navbar shadow                                      |
| Accent usage     | active links, focus rings, and theme/action controls             |

**Pattern notes:**
Navigation wraps into a horizontal scroll row on small screens instead of hiding core routes. Protected content uses responsive padding and constrained tracks so it reads well from mobile through extra-large screens without changing data flow.

### Jobbiton Landing Flow

File: components/homepage/JobbitonFlowSections.tsx
Last updated: 2026-06-20

| Property         | Class / Pattern                                                  |
| ---------------- | ---------------------------------------------------------------- |
| Background       | `bg-surface`, `bg-surface-muted`, `bg-surface-secondary` hover   |
| Border           | `border-y`, `border-b`, `border-r`, `border-border` section grid |
| Border radius    | image showcase `rounded-xl`, badges `rounded-full`               |
| Text — primary   | section headlines `text-text-primary text-[38px]-[64px] font-semibold` |
| Text — secondary | supporting copy `text-text-secondary text-[15px]-[18px] leading-6/8` |
| Spacing          | mobile `px-6 py-12`, desktop `md:px-16 md:py-20`                 |
| Hover state      | showcase cards `hover:bg-surface-secondary`, links `group-hover:text-accent` |
| Shadow           | dashboard showcase image uses token overlay shadow               |
| Accent usage     | section eyebrows, step numbers, action links, FAQ plus marks     |

**Pattern notes:**
The homepage now uses a Jobbiton-owned editorial flow: launchpad intro, proof stats, featured flows, visual product proof, services/capabilities, process steps, FAQs, testimonial, and CTA. Keep the flow scroll-driven and adapt all language to Jobbiton job-search outcomes.

### App Page Intro Band

File: components/layout/PageIntro.tsx
Last updated: 2026-06-20

| Property         | Class / Pattern                                                  |
| ---------------- | ---------------------------------------------------------------- |
| Background       | `bg-surface`                                                     |
| Border           | `border-b border-border`                                         |
| Border radius    | none                                                             |
| Text — primary   | title `text-text-primary text-[32px] sm:text-[40px] md:text-[48px] font-semibold` |
| Text — secondary | copy `text-text-secondary text-[15px] sm:text-[16px] leading-7`  |
| Spacing          | `px-4 py-8 sm:px-6 md:py-10`, inner `max-w-[1120px]`             |
| Hover state      | none                                                             |
| Shadow           | none                                                             |
| Accent usage     | eyebrow `text-accent uppercase`                                  |

**Pattern notes:**
Use `PageIntro` at the top of operational pages when they need the same editorial pacing as the landing page. It should introduce intent without replacing the core product surface below it. Dashboard, Find Jobs, Profile, and Job Details use this band while preserving existing data fetching and actions.
