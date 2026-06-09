# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** 06 Profile Save Logic
**Next:** 07 AI Profile Extraction from Resume

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
- [ ] 07 AI Profile Extraction from Resume
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
- 2026-06-09 — End-of-session verification: the profile save flow, data preservation after failed saves, 100% complete banner copy, and post-save completion percentage recalculation have all been linted and production-built successfully. `npm run build` still requires network access for `next/font` to fetch Inter.
- 2026-06-09 — Resume section now shows `Resume uploaded successfully.` in success styling below the upload well whenever a resume is selected or already saved.
- 2026-06-09 — Global interactive cursor rule added: anchors, enabled buttons, role buttons, file-input labels, and summary controls now receive Tailwind `cursor-pointer` from `app/globals.css`, and future custom controls should preserve the same hand cursor behavior.
- 2026-06-09 — Resume upload visibility improved: selected PDFs now render an embedded preview immediately through a browser object URL, saved resumes reuse `resume_pdf_url`, and the resume card includes a `View full resume` link.
- 2026-06-09 — Resume preview review issues resolved: selected PDFs now show pending-upload copy until Save Profile succeeds, saved resume previews use authenticated `/api/resume/current` storage download, and the raw private storage URL is no longer embedded in the UI.
