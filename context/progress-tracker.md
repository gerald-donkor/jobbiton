# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation
**Last completed:** 01 Homepage
**Next:** 02 Auth

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [ ] 02 Auth
- [ ] 03 PostHog Initialization
- [ ] 04 Database Schema

### Phase 2 — Profile Page

- [ ] 05 Profile Page — Full UI
- [ ] 06 Profile Save Logic
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

---

## Notes

- 2026-06-08 — `npm run build` initially failed because restricted network blocked Google Fonts for `next/font/google`; rerunning with network approval completed successfully.
- 2026-06-08 — Dev preview hit a Turbopack corrupted `.next/dev` cache after a stale lock; cleared generated `.next/dev` and verified `/` returns 200 on `http://localhost:3003`.
- 2026-06-08 — Landing-page CTA buttons were corrected to the compact charcoal/white style shown in the browser screenshot and re-imprinted into `ui-registry.md`.
- 2026-06-08 — Primary CTA hover was corrected to a slightly lighter indigo-charcoal using accent and overlay tokens to match the hovered reference screenshot.
- 2026-06-08 — Final CTA supporting copy and footer navigation were corrected to the softer gray text tone shown in the reference screenshot.
- 2026-06-08 — Footer navigation hover was flattened to the same `text-text-secondary` tone as the final CTA supporting copy for an exact color match.
- 2026-06-08 — Final CTA supporting copy and footer navigation now share the same global `.supporting-text-tone` class, and footer links were softened to normal weight so the visual tone truly matches.
