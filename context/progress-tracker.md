# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 5 — Dashboard
**Last completed:** 16 Recent Activity — Real Data
**Next:** 17 Analytics Charts — PostHog Data

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [x] 09 Find Jobs Page — Full UI
- [x] 10 Adzuna Job Discovery
- [x] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [x] 12 Job Details Page — Full UI
- [x] 13 Company Research Agent

### Phase 5 — Dashboard

- [x] 14 Dashboard Page — Full UI
- [x] 15 Stats Bar — Real Data
- [x] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- 2026-06-08 — Homepage implemented as a static App Router Server Component using `next/link` and `next/image`; no client component needed.
- 2026-06-08 — Used existing public assets for the dashboard preview, jobs list, agent log, logo, and testimonial avatar to match `context/designs/landing-page.png`.
- 2026-06-08 — Added token-based global helpers `soft-gradient-panel` and `diagonal-band` for the screenshot's gradient hero/CTA areas and separator bands without hardcoded component colors.
- 2026-06-08 — Added InsForge MCP operating rules to `AGENTS.md` without replacing existing project instructions.

---

## Notes

- 2026-06-08 — `npm run build` initially failed because restricted network blocked Google Fonts for `next/font/google`; rerunning with network approval completed successfully.
- 2026-06-08 — Dev preview hit a Turbopack corrupted `.next/dev` cache after a stale lock; cleared generated `.next/dev` and verified `/` returns 200 on `http://localhost:3003`.
- 2026-06-08 — Landing-page CTA buttons were corrected to the compact charcoal/white style shown in the browser screenshot and re-imprinted into `ui-registry.md`.
- 2026-06-08 — Primary CTA hover was corrected to a slightly lighter indigo-charcoal using accent and overlay tokens to match the hovered reference screenshot.
- 2026-06-08 — Final CTA supporting copy and footer navigation were corrected to the softer gray text tone shown in the reference screenshot.
- 2026-06-08 — Footer navigation hover was flattened to the same `text-text-secondary` tone as the final CTA supporting copy for an exact color match.
- 2026-06-08 — Final CTA supporting copy and footer navigation now share the same global `.supporting-text-tone` class, and footer links were softened to normal weight so the visual tone truly matches.
- 2026-06-08 — Auth implemented with latest `@insforge/sdk` SSR helpers, Google/GitHub OAuth buttons, `/auth/callback`, `/api/auth/refresh`, and Next 16 `proxy.ts` protection for dashboard/profile/jobs routes.
- 2026-06-08 — Added local public InsForge env values from MCP-generated anon key in `.env.local`; the file is gitignored and needed for OAuth/dev checks.
- 2026-06-08 — Login page restyled to match the supplied split-panel auth screenshot with navbar, left explanatory pane, right provider selector, and callback error alert.
- 2026-06-08 — Recovered OAuth start failure caused by `NEXT_PUBLIC_INSFORGE_URL` being set to an API-key-shaped value instead of the InsForge backend URL; verified Google and GitHub OAuth start return provider URLs.
- 2026-06-08 — Recovered post-OAuth login loop with server-owned OAuth callback: `/api/auth/oauth/start` stores PKCE, `/auth/callback` exchanges the code and sets InsForge access + refresh cookies before routing to `/profile`.
- 2026-06-08 — Homepage active feature rail corrected from accent blue/purple to success green to match the supplied reference image and re-imprinted in `ui-registry.md`.
- 2026-06-08 — Shared charcoal primary button hover was retuned to show a more visible light-blue tint across navbar, hero, and final CTA buttons, and the updated hover pattern was re-imprinted in `ui-registry.md`.
- 2026-06-08 — Shared charcoal primary button hover was refined again to be darker and only slightly bluish after the brighter hover overshot the reference feel; `ui-registry.md` now treats it as a restrained bluish-charcoal lift.
- 2026-06-08 — Shared charcoal primary button hover was tuned one more step toward a darker blue-charcoal mix so the hover reads more bluish without becoming light.
- 2026-06-09 — PostHog initialization completed with `lib/posthog-client.ts`, `lib/posthog-server.ts`, typed allowed-event definitions, client instrumentation, authenticated user identification, and logout reset. Unsupported wizard-added auth/CTA event names were removed to keep the project limited to `job_search_started`, `job_found`, `profile_completed`, and `company_researched`.
- 2026-06-09 — Shared navbar brand link was made explicit across pages: the full JobPilot logo/wordmark anchor points to `/` and uses a stable inline-flex click target.
- 2026-06-09 — Root homepage navigation was corrected by allowing `/` through `proxy.ts` even when authenticated; JobPilot logo/wordmark links in navbar and footer point to `/` so they land on the homescreen URL.
- 2026-06-09 — Database schema foundation completed in InsForge with `profiles`, `agent_runs`, `jobs`, and `agent_logs` tables, own-row RLS policies, constraints, indexes, and a private `resumes` storage bucket.
- 2026-06-09 — Profile Page Full UI completed with mock data only, matching `context/designs/profile.png`; `/profile` now renders the attention banner, resume panel, and complete profile form while leaving save/upload/extract logic for later features.
- 2026-06-09 — Protected navbar can now receive `activeHref` and `showCta` props, allowing profile UI to match the active navigation state without changing homepage CTA behavior.
- 2026-06-09 — Auth review fix completed: homepage CTAs now reflect logged-in state, `/profile` redirects logged-out users to `/login?next=/profile`, OAuth start preserves the safe protected `next` path, and callback redirects to that destination after setting InsForge auth cookies.
- 2026-06-09 — Profile top viewport visually corrected to match `Screenshot_20260609_130730.png`: retained full navbar with CTA, narrowed profile column, orange attention state, purple completion ring, Connected Accounts card, and updated Resume upload copy/style.
- 2026-06-09 — Profile Save Logic completed with a `saveProfile` server action, private `resumes` bucket PDF upload at `{user_id}/resume.pdf`, profile upsert, app-calculated completion state, `/profile` revalidation, prefilled return visits, and `profile_completed` PostHog capture on first completion.
- 2026-06-09 — Profile empty-state correction completed: brand-new profiles no longer count auth email, default experience level, or default work authorization toward completion, so the attention banner starts at 0% and profile fields render empty until the user fills them.
- 2026-06-09 — Profile save failure resolved: blank constrained dropdown values are stored as `null`, cover letter tone options now match the database constraint, save errors log useful SDK details, and failed submits return the submitted profile snapshot so typed data is preserved.
- 2026-06-09 — Profile completion banner corrected: any 100% profile now renders the complete-state title and success styling instead of warning/attention language.
- 2026-06-09 — Profile completion percentage now recalculates from the latest save-action profile snapshot inside `ProfileEditor`, so clearing previously completed fields and saving drops the banner percentage and restores missing-field tags.
- 2026-06-09 — Profile completion banner behavior updated: completed 100% profiles no longer render the banner at all; incomplete profiles still show the warning card and missing-field tags.
- 2026-06-09 — End-of-session verification: the profile save flow, data preservation after failed saves, 100% complete banner copy, and post-save completion percentage recalculation have all been linted and production-built successfully. `npm run build` still requires network access for `next/font` to fetch Inter.
- 2026-06-09 — Resume section now shows `Resume uploaded successfully.` in success styling below the upload well whenever a resume is selected or already saved.
- 2026-06-09 — Global interactive cursor rule added: anchors, enabled buttons, role buttons, file-input labels, and summary controls now receive Tailwind `cursor-pointer` from `app/globals.css`, and future custom controls should preserve the same hand cursor behavior.
- 2026-06-09 — Resume upload visibility improved: selected PDFs now render an embedded preview immediately through a browser object URL, saved resumes reuse `resume_pdf_url`, and the resume card includes a `View full resume` link.
- 2026-06-09 — Resume preview review issues resolved: selected PDFs now show pending-upload copy until Save Profile succeeds, saved resume previews use authenticated `/api/resume/current` storage download, and the raw private storage URL is no longer embedded in the UI.
- 2026-06-09 — AI Profile Extraction from Resume completed with `/api/resume/extract`, `lib/resume-extraction.ts`, server-side PDF text extraction, Gemini JSON extraction, Zod validation, and client-side draft population in `ProfileEditor`.
- 2026-06-09 — Resume extraction supports both currently selected unsaved PDFs and previously saved private resumes; extraction never writes to the database, preserves existing draft values when the resume has no value for a field, and requires the user to click Save Profile to persist changes.
- 2026-06-09 — Global cursor rule corrected: all semantic buttons and `a[href]` links now receive Tailwind `cursor-pointer` from `app/globals.css`, with disabled buttons globally overridden to `cursor-not-allowed`.
- 2026-06-09 — Resume upload format support expanded from PDF-only to PDF, DOC, DOCX, TXT, and RTF; saved/current downloads now resolve the stored resume path and content type from `profiles.resume_pdf_url`.
- 2026-06-09 — Resume upload well copy corrected: once any resume file is selected or saved, the circled upload copy is replaced by the single line `View current resume`; empty state keeps the upload prompt and supported-format note.
- 2026-06-09 — Resume multi-format preview corrected: PDF/TXT keep embedded previews, DOC/DOCX/RTF show an open/download panel instead of a broken iframe, and extraction controls only appear for PDF/TXT.
- 2026-06-09 — Resume DOCX preview implemented through `mammoth` raw-text extraction in `/api/resume/preview`; PDF stays iframe-based, TXT/DOCX show readable text previews, and DOC/RTF remain open/download only.
- 2026-06-10 — Resume extraction worker failure resolved: `/api/resume/extract` now uses `pdf2json` server-side buffer parsing instead of the `pdf-parse` PDF.js worker path, protected resume preview/extract fetches include same-origin credentials, and lint/build/parser smoke checks pass.
- 2026-06-10 — Resume extraction OpenAI quota handling resolved: OpenAI SDK `APIError`s are now translated into safe provider-specific responses, including a clear 429 quota message when the configured key has no available quota instead of the generic resume extraction failure.
- 2026-06-10 — Root layout hydration warning resolved for Grammarly/body extension attributes by adding `suppressHydrationWarning` to the root `<body>` in `app/layout.tsx`; lint, diff check, and production build pass.
- 2026-06-10 — Resume extraction provider switched from OpenAI to Gemini REST using server-side `GEMINI_API_KEY`, `gemini-3.5-flash`, structured JSON response formatting, and the existing Zod profile validation; the unused `openai` dependency was removed.
- 2026-06-10 — Gemini resume extraction payload corrected: REST JSON mode now sends `generationConfig.responseMimeType = "application/json"` instead of the rejected nested `responseFormat.text.mimeType` shape; local Gemini docs were corrected and lint/build pass.
- 2026-06-10 — Gemini resume extraction model corrected to `gemini-2.5-flash` after live smoke tests showed `gemini-3.5-flash` returning unusable one-letter text and `gemini-2.5-flash` returning valid JSON with the same API key.
- 2026-06-11 — Gemini resume extraction truncation/invalid JSON resolved: output budget increased to 4096 tokens, the route now validates Gemini text before accepting it, falls back from `gemini-2.5-flash` to `gemini-2.5-flash-lite` on provider/JSON failures, and a sample resume smoke test returned complete parseable JSON.
- 2026-06-11 — Resume section status colors polished: selected/uploaded/extracted success messages now use `text-success`, failed extraction messages use `text-error`, and the Extract from Resume button uses the same accent-purple filled style as primary resume actions; `ui-registry.md` was imprinted with the updated pattern.
- 2026-06-11 — Resume extraction session expiry resolved: `proxy.ts` now refreshes InsForge sessions for `/api/resume/*` before route handlers run, preventing stale access tokens from producing `Please sign in again before extracting your resume.` after idle time.
- 2026-06-11 — Resume extraction now fills Years of Experience more reliably by requesting digits-only output, normalizing values like `5 years` to `5`, and estimating from extracted work dates when Gemini leaves the field blank.
- 2026-06-11 — Resume extraction now fills Key Responsibilities more reliably by prompting Gemini to preserve role bullets/duties and by recovering likely responsibility lines from the raw resume text when a matched work role comes back with blank responsibilities.
- 2026-06-11 — Resume selection now uploads immediately through a dedicated server action, saves the resulting InsForge storage URL to `profiles.resume_pdf_url`, and keeps the resume available after refresh without requiring Save Profile.
- 2026-06-11 — Resume extraction now normalizes LinkedIn and Portfolio/GitHub values into absolute `https://` URLs before filling profile URL inputs, preventing browser URL validation from blocking Save Profile.
- 2026-06-11 — Feature 07 resume upload/extraction flow user-verified: extracted profile fields save successfully, uploaded resumes persist after refresh, and extracted Portfolio/GitHub URLs no longer block browser URL validation.
- 2026-06-11 — Resume PDF Generation from Profile completed with `POST /api/resume/generate`, AI-polished resume content from the saved profile row, server-side `@react-pdf/renderer` PDF rendering via `renderToBuffer`, shared active-resume storage replacement, `profiles.resume_pdf_url` update, and immediate Resume card state refresh.
- 2026-06-11 — Resume generation prefers `OPENROUTER_API_KEY` through OpenRouter model `openai/gpt-4o`; local development can fall back to the already configured Gemini REST path when OpenRouter is absent.
- 2026-06-12 — Resume removal control added to the Resume card: users can click `Remove resume` to delete known active resume objects from InsForge storage, clear `profiles.resume_pdf_url`, reset local preview/input state, and return to the empty upload state before uploading another resume or generating a fresh one.
- 2026-06-12 — Generated resume PDF layout polished to match a conventional resume structure more closely: left-aligned header, clearer name/title separation, calmer contact lines, title-case sections, improved experience hierarchy, and removal of app-style preference content from the PDF output.
- 2026-06-12 — Generated resume header spacing hardened with an explicit identity block and line-height separation so the title no longer collides with the candidate name, and Gemini resume generation now falls back from `gemini-2.5-flash` to `gemini-2.5-flash-lite` on temporary `503 UNAVAILABLE` provider spikes.
- 2026-06-12 — Connected Accounts now supports a real layered LinkedIn flow instead of a static button: `/api/linkedin/connect` and `/api/linkedin/callback` perform a verified OAuth round-trip when `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET` are configured, the profile card can fall back to a saved LinkedIn URL through a server action, disconnect is supported, and `/profile` now surfaces honest `Not connected` / `Using saved profile URL` / `OAuth connected` states.
- 2026-06-12 — LinkedIn OAuth connect flow hardened after live testing: the connect/callback routes now use the cookie-aware InsForge server client, default requested LinkedIn scopes were reduced from `openid profile email` to `openid profile`, provider scope/configuration failures are surfaced as dedicated profile states instead of a misleading cancellation message, and `LINKEDIN_OAUTH_SCOPES` can override the requested scope set for app-specific LinkedIn products.
- 2026-06-12 — Connected Accounts section removed from the top of `/profile` per product direction; the Personal Info LinkedIn URL field remains in place and no other profile page sections were changed.
- 2026-06-12 — Feature 09 Find Jobs Page Full UI completed with screenshot-matched mock search controls, success message, filter/sort bar, jobs table, match score bars, and pagination. `/find-jobs` now renders the full mock UI using protected auth and active icon navbar state. Feature 08 Resume PDF Generation remains outstanding because Feature 09 was built out of sequence by request.
- 2026-06-12 — Feature 09 verification: `npm run lint` passes and `npm run build` passes after retrying the known network-dependent Inter font fetch; the build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-12 — Feature 09 visual correction completed against `Screenshot_20260612_160043.png`: search fields now use placeholders instead of filled test values, the layout is centered/narrowed, navbar CTA is visible, the success banner is removed, filter controls are separate, the jobs table includes a `SOURCE` badge column, and pagination/count sit outside the table card.
- 2026-06-12 — Feature 09 filter controls corrected: All Matches and Match Score are native dropdown selects, stay on one line, and open option lists instead of behaving as static buttons.
- 2026-06-12 — Feature 09 interaction polish: Match Score select widened so its label fits cleanly in the focused box, and mock job listings are now full-row links to `/find-jobs/[id]` placeholders.
- 2026-06-12 — Feature 10 Adzuna Job Discovery completed with `app/api/agent/find/route.ts`, new `agent/` job-discovery and matching modules, `lib/adzuna.ts`, shared `MATCH_THRESHOLD`, and a client-side Find Jobs wrapper that submits live searches and renders saved results immediately.
- 2026-06-12 — Feature 10 follows the project Adzuna and InsForge patterns: `category=it-jobs` search, `agent_runs` + `jobs` writes scoped to `user_id`, `agent_logs` warning/error logging, `job_search_started` + `job_found` PostHog events, and `proxy.ts` session refresh for `/api/agent/*`.
- 2026-06-12 — Feature 10 matching prefers OpenRouter `openai/gpt-4o` when `OPENROUTER_API_KEY` is configured and falls back to a local heuristic scorer when that key is absent or the provider call fails, so local searches still return usable scores instead of hard failing.
- 2026-06-12 — Feature 10 verification: `npm run lint` passes and `npm run build` passes. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-12 — Feature 11 Filter + Sort + Pagination completed with server-side InsForge querying in `app/find-jobs/page.tsx`, URL-driven `/find-jobs` filters, `q` text search across company/title, high/low match filtering, score/newest/oldest ordering, exact total counts, and 20-per-page pagination.
- 2026-06-12 — Feature 11 keeps the instant post-search UX from Feature 10 by showing the latest returned jobs immediately after a successful Adzuna search, then returning to the DB-backed saved jobs list whenever filters, sorting, or pagination change.
- 2026-06-12 — Feature 11 verification: `npm run lint` passes and `npm run build` passes. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-12 — Feature 11 review fixes completed: saved-jobs query failures now surface a safe UI error instead of silently rendering zero jobs, text search is tokenized before building the InsForge OR filter, and Find Jobs filter/sort types were moved out of `agent/types.ts` into `components/find-jobs/types.ts`.
- 2026-06-12 — Feature 11 review-fix verification: `npm run lint` passes and `npm run build` passes. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-12 — Feature 11 filter/sort follow-up completed: the temporary latest-search results now respect the active filter query, High/Low Match select, and score/newest/oldest sort select, so controls like `High Match` + `Oldest` match the visible rows immediately after a live Adzuna search.
- 2026-06-12 — Feature 11 filter/sort follow-up verification: `npm run lint` passes and `npm run build` passes. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-12 — Matcher fallback scoring improved after High Match appeared empty for relevant searches: heuristic matching now uses skill aliases, word/phrase boundaries, title-token overlap, skill coverage, and a lower true no-match floor so relevant local-dev matches can cross `MATCH_THRESHOLD` while unrelated jobs score lower.
- 2026-06-12 — Matcher fallback fix applies to newly scored jobs; existing saved jobs retain their stored `match_score` until rediscovered or explicitly rescored in a future feature.
- 2026-06-12 — Matcher fallback verification: `npm run lint` passes and `npm run build` passes. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-12 — Find Jobs stale-results leak resolved: each successful Adzuna search now returns its `agent_runs.id`, `/find-jobs` stores that as a `run` URL param, and saved DB listings are scoped to the active run so refreshes, filters, sorting, and pagination no longer revive older Backend Developer rows after a Frontend Developer search.
- 2026-06-12 — Find Jobs run-scope verification: `npm run lint` passes and `npm run build` passes after allowing the known network-dependent Inter font fetch. A local dev-server smoke check was blocked by a stale `.next/dev` lock pointing at a dead PID, not by the app build.
- 2026-06-13 — Feature 12 Job Details Page Full UI completed with a real user-scoped InsForge query for `/find-jobs/[id]`, screenshot-matched header/info/match/skills/description/research sections, external job links, and company research display support for existing dossiers while leaving research generation for Feature 13.
- 2026-06-13 — Feature 12 verification: `npm run lint` passes and `npm run build` passes. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-13 — Feature 12 review fix completed: Job Description now renders all saved text without clamping, preserves paragraph breaks, and shows an inline `Open full job description` callout when the saved Adzuna preview ends mid-sentence. Circled job-details icon treatments from `Screenshot_20260613_114144.png` were refined and imprinted.
- 2026-06-13 — Feature 12 review-fix verification: `npm run lint` passes and `npm run build` passes. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-13 — Feature 12 metadata layout follow-up completed: job-details cards widened to `max-w-[1040px]`, the desktop metadata grid now gives Location extra space, and info-card values wrap instead of truncating so long location names remain visible.
- 2026-06-13 — Feature 12 metadata layout verification: `npm run lint` passes and `npm run build` passes. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-13 — Feature 13 Company Research Agent completed with `POST /api/agent/research`, Browserbase session creation, Stagehand extraction of the company homepage plus up to three internal pages, OpenRouter `openai/gpt-4o` JSON synthesis, user-scoped `jobs.company_research` updates, `company_researched` PostHog capture, and an inline Job Details research button that refreshes the dossier after success.
- 2026-06-13 — Feature 13 preserves existing dossiers when OpenRouter is missing or fails, falls back to job/profile-only synthesis when Browserbase or Stagehand browsing fails, logs research messages to the job's existing `run_id` when present, and allows the same button to overwrite existing research as `Research Again`.
- 2026-06-13 — Feature 13 verification: `npm run lint` passes and `npm run build` passes. A built-server smoke check confirms unauthenticated `POST /api/agent/research` returns the safe 401 JSON response. The build still shows the existing Node `module.register()` deprecation warning. Installing Browserbase/Stagehand dependencies reported existing npm audit warnings; no automatic dependency fixes were applied.
- 2026-06-13 — Feature 13 review fixes completed: malformed JSON request bodies now return the planned safe 400 response instead of falling into the 500 catch, and the Job Details research button now narrows the API response at runtime instead of asserting the response type.
- 2026-06-13 — Feature 13 review-fix verification: `npm run lint` passes and `npm run build` passes. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-13 — Feature 13 provider correction completed: company research now supports the existing server-side `GEMINI_API_KEY` for both Stagehand extraction and final dossier synthesis, while still preferring OpenRouter when `OPENROUTER_API_KEY` is configured. Gemini synthesis follows the project resume-generation pattern with `gemini-2.5-flash` and `gemini-2.5-flash-lite` fallback.
- 2026-06-13 — Feature 13 Gemini provider verification: `npm run lint` passes and `npm run build` passes. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-13 — Feature 13 source-link hardening completed: company research prompts now require source entries to be absolute `http(s)` URLs from collected research, saved dossiers normalize sources to visited valid URLs, and the Job Details sources area filters any older invalid source strings before rendering links.
- 2026-06-13 — Feature 13 source-link verification: `npm run lint` passes and `npm run build` passes. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-13 — Feature 13 research dossier UI polish completed: the Job Details company research dossier now renders each section as a token card with descriptive CSS icon chips, and the Sources area renders live external-link cards with readable domain/page labels plus absolute URLs instead of plain text links.
- 2026-06-13 — Feature 13 research dossier UI verification: `npm run lint` passes and `npm run build` passes. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-13 — Feature 13 sources UI corrected to match the supplied compact reference: sources now render as a flat top-bordered strip with uppercase `Sources` label and simple live absolute URL links, while the rest of the research dossier keeps the polished section cards and icons.
- 2026-06-13 — Feature 13 compact sources verification: `npm run lint` passes and `npm run build` passes. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-13 — Feature 13 sources strip alignment corrected again from screenshot feedback: the `Sources` section is now a full-width sibling below the dossier body, so its top border spans the entire research card and the label/URL padding matches the reference instead of being nested inside the dossier body spacing.
- 2026-06-13 — Feature 13 full-width sources strip verification: `npm run lint` passes and `npm run build` passes. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-13 — Feature 13 source URL correction completed: Adzuna tracking domains are filtered out of both newly saved research sources and existing rendered dossier sources.
- 2026-06-13 — Feature 13 source URL correction verification: `npm run lint` passes and `npm run build` passes. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-13 — Feature 13 verified employer-source correction completed: the Job Details page now resolves a live employer website by following the saved apply/source URL server-side, rejects Adzuna/ATS/job-board domains, and only renders verified employer URLs in `SOURCES`. Generic company-name URL fallbacks were removed from both rendering and research-source saving.
- 2026-06-13 — Feature 13 verified employer-source verification: `npm run lint` passes and `npm run build` passes. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-13 — Feature 13 research loading UX completed: added Motion for React (`motion`) and replaced the standalone research button with a client `CompanyResearchPanel` that shows an animated multistep loading card while company research runs, including progress, active/queued/completed steps, reduced-motion handling, inline errors, and route refresh after success.
- 2026-06-13 — Feature 13 research loading UX verification: `npm run lint` passes and `npm run build` passes. Installing Motion preserved the existing npm audit warnings: 17 low and 2 moderate. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-13 — Feature 13 research loading animation polish completed: the Motion loading card now has a moving token scan band, breathing search glyph, step counter pill, animated progress highlight, active-step pulse rings, and status dots while preserving reduced-motion handling.
- 2026-06-13 — Feature 13 research loading animation polish verification: `npm run lint` passes and `npm run build` passes. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-13 — Feature 13 company source ordering completed: when the Job Details page resolves a verified live employer website, the compact bottom `SOURCES` strip now includes that company URL first and deduplicates it against any saved research source URLs.
- 2026-06-13 — Feature 14 Dashboard Page Full UI completed against `context/designs/dashboard.png` with a screenshot-matched protected dashboard shell, active icon navbar, four mock stat cards, recent activity timeline, company research bar chart, jobs-found line chart, and match-score distribution bar chart.
- 2026-06-13 — Feature 14 remains mock-data only by design; Features 15-17 will replace the dashboard arrays with real InsForge and PostHog data without changing the visual structure.
- 2026-06-13 — Feature 14 verification: `npm run lint` passes and `npm run build` passes. A built-server unauthenticated smoke check confirms `/dashboard` still redirects to `/login?next=%2Fdashboard`. The build still shows the existing Node `module.register()` deprecation warning.
- 2026-06-14 — Feature 14 recovered after review: the dashboard was rebuilt around the actual `context/designs/dashboard.png` proportions with a local 90px full-width `DashboardNavbar`, 70px desktop gutters, 34px grid gaps, taller stat cards, and larger chart/timeline typography so the UI tracks the screenshot instead of the narrower shared app shell.
- 2026-06-15 — Feature 14 dashboard interactivity recovered after screenshot feedback: stat cards now lift on hover, Recent Activity rows highlight and focus, bar-chart data points show hover/focus tooltips, and the Jobs Found line chart exposes focusable point tooltips while remaining mock-data only for Features 15-17.
- 2026-06-15 — Feature 14 Jobs Found line chart interactivity follow-up completed: tiny point-only targets were replaced with full-height day hit bands, hover/focus guide lines, visible accent markers, and matching tooltips so the chart responds while scanning across it.
- 2026-06-15 — Feature 14 chart hover-flow follow-up completed: Company Research Activity and Match Score Distribution now use the same full-height data lanes as the Jobs Found chart, with lane wash, vertical guide line, lifted active bar, and tooltip beside the active data point.
- 2026-06-15 — Feature 14 chart tooltip placement follow-up completed: the shared chart tooltip now supports a `chartTop` placement, and all dashboard charts pin hover/focus tooltips near the top of the active lane instead of letting short bars or low points place the tooltip down in the chart body.
- 2026-06-15 — Feature 15 Stats Bar Real Data completed: `/dashboard` now loads user-scoped InsForge `jobs` rows server-side through `lib/dashboard-stats.ts`, replacing the mock stat array with all-time jobs, average match rate, researched-company count, current-week jobs, and week-over-week trend values.
- 2026-06-15 — Dashboard layout screenshot follow-up completed: `/dashboard` now uses the compact 80px top navbar with centered text links and right-side profile/sign-out controls, plus a centered `max-w-[824px]` dashboard track with 16px gaps, 128px stat cards, and 340px activity/chart cards matching the latest positioning reference.
- 2026-06-15 — Feature 16 Recent Activity Real Data completed: `/dashboard` now loads recent completed `agent_runs` and researched `jobs` for the current user through `lib/dashboard-activity.ts`, merges them by timestamp, formats human-readable activity labels and relative times, and renders a compact empty state when no activity exists.
