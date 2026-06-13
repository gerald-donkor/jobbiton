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
Last updated: 2026-06-09

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-surface`                                                          |
| Border           | `border-b border-border`                                              |
| Border radius    | none                                                                  |
| Text — primary   | active `text-accent`, inactive `text-text-dark text-[14px] font-medium leading-5` |
| Text — secondary | none                                                                  |
| Spacing          | `h-16 px-6 gap-12`, nav links `inline-flex h-16 items-center gap-2`   |
| Hover state      | inactive `hover:text-accent`                                          |
| Shadow           | none                                                                  |
| Accent usage     | active link text and bottom rule `absolute inset-x-0 bottom-0 h-0.5 bg-accent` |

**Pattern notes:**
Protected pages can pass `activeHref` to the shared navbar to render the active nav item with a token-purple text state and a 2px bottom rule. Nav icons are hidden by default; pass `showNavIcons` only for a design that explicitly includes them. The screenshot-matched profile page uses the plain navbar with the visible `Start for free` CTA.

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
Last updated: 2026-06-12

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
The table stays dense and scan-friendly with uppercase headers, 14px row text, bordered white rows, circular company marker chips, inline score bars, a `SOURCE` column with purple `Search` pills, and no internal pagination footer. Post-search state uses a dedicated narrow icon rail as the first grid column so the circular building glyphs stack cleanly down the left edge, with the `COMPANY` header spanning both the icon rail and company-name column. The marker should read like a soft bordered circle with a muted building glyph inside, matching the supplied screenshot rather than a square badge. Individual rows are full-width links to `/find-jobs/[id]` so the whole listing is clickable and keyboard focusable. Feature 11 renders the server-provided saved jobs page by default, scoped to the active search run when one exists, shows a centered muted empty state when filters return no rows, and keeps pagination/count controls outside the table shell. The pagination uses compact text Previous/Next buttons with chevrons, circular page buttons, and the active page as `bg-accent text-accent-foreground`. Avoid broad all-user saved-job queries in this table unless a separate saved-jobs archive mode is explicitly designed.

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

File: components/job-details/JobDetailsPageContent.tsx
Last updated: 2026-06-13

| Property         | Class                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Background       | card `bg-surface`, empty icon `bg-surface-secondary`, research icon `bg-accent-muted` |
| Border           | card `border border-border`, header divider `border-b border-border` |
| Border radius    | card `rounded-xl`, button `rounded-md`, icon chips `rounded-full`   |
| Text — primary   | title `text-[18px] font-semibold leading-7 text-text-primary`, empty title `text-[15px] font-semibold` |
| Text — secondary | empty copy `text-[14px] font-normal leading-5 text-text-muted`, sources `text-text-secondary` |
| Spacing          | header `px-6 py-4`, empty state `min-h-[246px] px-6 py-14`, dossier body `px-6 py-6 space-y-6` |
| Hover state      | research/apply buttons `hover:bg-accent-dark`, source links `hover:text-accent` |
| Shadow           | shared token card shadow                                            |
| Accent usage     | research CTA `bg-accent text-accent-foreground`, tags `bg-accent-muted text-accent` |

**Pattern notes:**
Feature 12 only renders the company research surface. The button is present and visually active to match the design, but the Browserbase/Stagehand generation flow belongs to Feature 13. Empty state copy should stay centered and company-specific. If `jobs.company_research` already contains a dossier, the same card renders all nine planned fields: overview, tech stack, culture, why this role, your edge, gaps, smart questions, interview prep, and sources.

### Job Details Navbar

File: components/job-details/JobDetailsNavbar.tsx
Last updated: 2026-06-13

| Property         | Class                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Background       | `bg-surface`                                                        |
| Border           | `border-b border-border`                                            |
| Border radius    | none                                                                |
| Text — primary   | active find-jobs link `text-accent text-[14px] font-medium leading-5` |
| Text — secondary | inactive links/sign-out `text-text-dark` / `text-text-secondary`    |
| Spacing          | header `h-16 px-6`, nav `gap-8`, auth actions `gap-5`, profile shell `.job-details-user-control` |
| Hover state      | inactive nav/sign-out `hover:text-accent`                           |
| Shadow           | none                                                                |
| Accent usage     | active Find Jobs text only                                          |

**Pattern notes:**
The job-details reference uses a protected top bar with the logo, compact nav links, a profile glyph in a soft circular shell, and a text sign-out control instead of the homepage CTA. Keep this treatment local to job-details until other protected pages are redesigned to match it. The sign-out control uses `SignOutButton variant="nav"` for the compact token text treatment.

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
Last updated: 2026-06-12

**Pattern notes:**
Feature 10 keeps the Adzuna and matching flow entirely server-side. The client submits JSON to `POST /api/agent/find`; the route validates input, captures `job_search_started`, and calls the agent orchestration module. The agent creates an `agent_runs` row, searches Adzuna with `category=it-jobs`, scores each result against the saved profile, inserts saved `jobs` rows, records warnings/errors in `agent_logs`, and emits one `job_found` event per saved job. Matching prefers OpenRouter `openai/gpt-4o` when `OPENROUTER_API_KEY` exists, but falls back to a deterministic heuristic scorer so local development still returns usable results. The fallback matcher must use skill aliases, word/phrase boundaries, title-token overlap, and skill coverage rather than raw substring matching so relevant jobs can cross the 70-point High Match threshold while weak matches remain low. `proxy.ts` includes `/api/agent/:path*` so stale InsForge sessions refresh before authenticated search requests run.

### Saved Jobs Filtering and Pagination

Files: app/find-jobs/page.tsx, components/find-jobs/FindJobsClient.tsx, components/find-jobs/JobFilterBar.tsx, components/find-jobs/types.ts
Last updated: 2026-06-12

**Pattern notes:**
Feature 11 loads saved jobs from InsForge in the `/find-jobs` Server Component, not in the client component. The route module owns the single-use user-scoped query shape: exact count plus paginated rows, active `run` scoping by `agent_runs.id`, `q` search across `company` or `title`, `match_score >= 70` for High Match, `match_score < 70` for Low Match, score/newest/oldest ordering, and 20 rows per page. Text search is tokenized before building the InsForge OR filter so punctuation-heavy user input does not produce malformed query syntax. Query failures return a safe `We could not load your saved jobs right now.` message and the client renders it as a bordered token error banner above the table. The client wrapper uses `router.replace(..., { scroll: false })` to update URL params and resets to page 1 for filter/sort changes while preserving the active `run` param. A successful Adzuna search still renders the returned jobs immediately as a temporary latest-search view, navigates to `/find-jobs?run={runId}`, and that temporary view applies the active filter query, match filter, and sort selection before rendering; changing filter, sort, or page clears that temporary view and returns to the DB-backed saved jobs list for the same run.

### Homepage Navbar

File: components/layout/Navbar.tsx
Last updated: 2026-06-09

| Property         | Class                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Background       | `bg-surface`                                                                                   |
| Border           | `border-b border-border`                                                                       |
| Border radius    | none                                                                                           |
| Text — primary   | `text-text-dark text-[14px] font-medium leading-5`                                             |
| Text — secondary | none                                                                                           |
| Spacing          | `h-16 px-6 gap-12`, brand link `inline-flex items-center`                                      |
| Hover state      | `hover:text-accent`, primary CTA via `.button-primary:hover` with a darker bluish-charcoal lift |
| Shadow           | primary CTA uses `.button-primary` layered shadow                                              |
| Accent usage     | `text-accent` for link hover; focus ring uses `outline: 2px solid var(--color-accent)`        |

**Button pattern (Primary CTA):**
`.button-primary .button-primary-sm`

**Pattern notes:**
Top navigation uses a full-width white surface with a constrained 1440px inner row. The full JobPilot logo/wordmark brand link points to `/`, and `proxy.ts` allows `/` through even when authenticated so it lands on the homescreen URL (`localhost:3000` in local dev) from every page that renders the shared navbar. Primary header CTAs use the shared compact charcoal button system defined in `app/globals.css` with 38px height, white text, a soft elevated shadow, and a darker bluish-charcoal hover. On the homepage, `app/page.tsx` passes auth-aware CTA props: logged-out users see `Start for free` to `/login`, logged-in users see `Go to Profile` to `/profile`.

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
Footer mirrors the navbar logo treatment and keeps links on the same restrained white surface used throughout the landing page. The footer logo/wordmark also points to `/` and relies on the same root-route proxy behavior. Footer nav text uses the exact same shared `supporting-text-tone` class as the final CTA supporting copy, including on hover.

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
Last updated: 2026-06-08

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
| Text — primary   | `.button-primary { color: var(--color-surface) }`                     |
| Text — secondary | `.button-secondary { color: var(--color-text-slate) }`                |
| Spacing          | `.button-primary-sm`, `.button-primary-lg`, `.button-secondary-lg`    |
| Hover state      | `.button-primary:hover` adds a darker bluish-charcoal tint, `.button-secondary:hover` remains neutral |
| Shadow           | layered CTA shadows in `.button-primary` and `.button-secondary`      |
| Accent usage     | focus rings and secondary hover border pick up `--color-accent`       |

**Pattern notes:**
Use shared global button classes for every landing-page CTA instead of repeating raw utility strings. The correct landing-page button direction is compact 38px-tall charcoal primary buttons with white text, a darker bluish-charcoal hover, and compact bright-surface secondary buttons with subtle borders.

### Auth Login Card

File: components/auth/LoginForm.tsx
Last updated: 2026-06-08

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
Auth entry uses a centered split panel beneath the normal navbar. The left pane carries the large sign-in headline on the shared token gradient; the right pane stays white and focused on provider selection. Provider buttons remain white, bordered, compact, and full width with restrained text sizing.

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
