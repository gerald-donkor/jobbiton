# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** 07 AI Profile Extraction from Resume
**Next:** 08 Resume PDF Generation from Profile

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
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
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
