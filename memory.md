# Memory — Foundation Review And Handoff

Last updated: 2026-06-09 09:47 GMT

## What was built

- Homepage, auth, and protected placeholder shells are present.
- InsForge OAuth flow exists with `/api/auth/oauth/start`, `/auth/callback`, `/api/auth/session`, `/api/auth/refresh`, and `proxy.ts` protection for `/dashboard`, `/profile`, and `/find-jobs`.
- PostHog packages are installed and current code contains `instrumentation-client.ts`, `lib/posthog-client.ts`, `lib/posthog-server.ts`, `lib/posthog-events.ts`, and `components/auth/PostHogIdentify.tsx`.
- JobPilot logo/wordmark links in `components/layout/Navbar.tsx` and `components/layout/Footer.tsx` point to `/`.
- `proxy.ts` now allows `/` through even when authenticated, so the logo can land on the homepage URL instead of redirecting to `/profile`.
- `context/progress-tracker.md` and `context/ui-registry.md` were updated for PostHog initialization and homepage logo navigation.

## Decisions made

- Project standards still define only four allowed PostHog product events: `job_search_started`, `job_found`, `profile_completed`, and `company_researched`.
- Root homepage navigation should remain available to authenticated users; only `/login` redirects authenticated users to `/profile`.
- Shared navbar/footer own the JobPilot logo behavior across pages.

## Problems solved

- Clicking the JobPilot logo did not reliably show the homepage because `proxy.ts` redirected authenticated users from `/` to `/profile`. That redirect has been narrowed to `/login`.
- Turbopack `.next/dev` cache corruption previously caused dev-server 500s; clearing `.next/dev` and restarting fixed it.
- `npm run build` is blocked in the sandbox because `next/font` needs network access to Google Fonts and unrestricted build escalation was rejected by the reviewer.

## Current state

- `npm run lint` passes.
- `npx tsc --noEmit` passes.
- Local route checks passed after starting dev server:
  - `http://localhost:3000` returns `200 OK`.
  - `http://localhost:3000` with an auth cookie returns `200 OK`, not `/profile`.
  - `/login` with an auth cookie still redirects to `/profile`.
- Review finding remains unresolved: the user said PostHog had already been initialized by the PostHog Wizard, but the current tree has the wizard's broader event captures removed/overridden and only project-approved typed events remain. Decide whether to restore wizard-generated tracking or keep the stricter project event list.

## Next session starts with

1. Decide the PostHog direction:
   - Restore the wizard's generated auth/CTA events and config if the wizard setup is the desired source of truth.
   - Or keep the current strict four-event project standard and do not restore wizard-only events.
2. After that decision, reconcile `context/progress-tracker.md`, `context/ui-registry.md`, and `memory.md` if needed.
3. Continue with Phase 1, item 04 Database Schema.

## Open questions

- Should PostHog follow the wizard's generated event set, or the project standards that allow only `job_search_started`, `job_found`, `profile_completed`, and `company_researched`?
- Should homepage access for authenticated users remain allowed permanently, even though the older project overview said logged-in homepage visits redirect during onboarding?
