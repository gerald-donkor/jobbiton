# Memory - Feature 13 Company Research Agent

Last updated: 2026-06-13 20:52 GMT

## What was built

Feature 13, Company Research Agent, is implemented.

Created:
- `agent/research.ts` - user-scoped research workflow for loading a job/profile, resolving the employer homepage, collecting Browserbase/Stagehand page context, synthesizing a nine-field dossier with OpenRouter `openai/gpt-4o`, saving `jobs.company_research`, and logging research progress against the job's existing `run_id` when present.
- `app/api/agent/research/route.ts` - `POST /api/agent/research` with `runtime = "nodejs"`, `dynamic = "force-dynamic"`, auth, body validation, PostHog `company_researched`, and path revalidation.
- `components/job-details/CompanyResearchButton.tsx` - client interaction layer for the Job Details research button with inline loading, compact error text, overwrite support through `Research Again`, and `router.refresh()` after success.
- `lib/browserbase.ts`, `lib/stagehand.ts`, and `lib/agent-logs.ts` - small wrappers for Browserbase sessions, Stagehand initialization, and shared agent log inserts.

Modified:
- `components/job-details/JobDetailsPageContent.tsx` - wires the existing company research card button to `CompanyResearchButton`.
- `agent/types.ts` - adds shared company research dossier/route response types.
- `agent/adzuna.ts` - reuses shared `logAgentMessage`.
- `package.json` and `package-lock.json` - adds `@browserbasehq/sdk` and `@browserbasehq/stagehand`.
- `context/ui-registry.md` and `context/progress-tracker.md` - imprinted Feature 13 UI behavior and marked the feature complete.
- Review fixes after live click testing: `app/api/agent/research/route.ts` now treats malformed JSON as the planned safe 400 invalid-body response, and `components/job-details/CompanyResearchButton.tsx` now narrows API responses at runtime instead of asserting the response type.
- Provider correction: company research now supports the existing server-side `GEMINI_API_KEY` for Stagehand extraction and final dossier synthesis. OpenRouter is still preferred when `OPENROUTER_API_KEY` is configured, but Gemini is sufficient for the local environment.
- Source-link hardening: new company research dossiers normalize `sources` to valid absolute `http(s)` URLs from collected/visited research pages, and the Job Details sources area filters older saved source strings before rendering anchors.
- Dossier UI polish: the company research card now displays each dossier section inside a soft token panel with a descriptive CSS icon chip. Sources were corrected after screenshot feedback to match the compact reference exactly: a full-width top-bordered strip below the dossier body with uppercase `Sources` label and simple live absolute URL links underneath, not card-style source links.
- Source URL correction: Adzuna, ATS, and job-board domains are filtered from new and existing research sources. The Job Details page now tries to resolve a live employer website by following the saved apply/source URL server-side. It does not invent company-name URL fallbacks; if no verified employer URL exists, the Sources strip is hidden instead of showing a generic URL.
- Company source ordering: when a verified live employer website is resolved, the bottom `SOURCES` strip includes that company URL first and deduplicates it against any saved research source URLs.
- Research loading UX: added Motion for React (`motion`, imported from `motion/react`) and replaced the standalone research button with `components/job-details/CompanyResearchPanel.tsx`. The panel owns the button, request state, inline errors, animated multistep loading card, dossier rendering, and compact `SOURCES` strip. Loading steps are: finding the company site, browsing public pages, reading useful signals, and building the dossier. Animations respect `useReducedMotion()`.
- Research loading animation polish: the loading card now includes a moving token scan band, breathing search glyph, step counter pill, animated progress highlight, active-step pulse rings, and small status dots for the active step.

## Decisions made

- The research route waits inline instead of introducing a queue or polling state.
- Browser research uses one Browserbase/Stagehand session and extracts the homepage plus up to three same-domain internal pages.
- A server-side AI key is required for synthesis. The agent prefers `OPENROUTER_API_KEY` when present and otherwise uses `GEMINI_API_KEY`; if all configured providers fail, the route returns a safe error and preserves any existing dossier.
- Browserbase/Stagehand failures do not hard fail the feature. The agent falls back to synthesizing from saved job/profile context when browsing is unavailable or thin.
- Existing company research can be overwritten by clicking the same button again.
- Research logs attach only to the job's existing `run_id`; no new search-shaped run is created for research.

## Problems solved

- Confirmed installed package APIs after dependency installation: `@browserbasehq/sdk@2.14.0` and `@browserbasehq/stagehand@3.5.0`.
- Avoids wasting Browserbase sessions when no supported AI key is configured by checking for either `OPENROUTER_API_KEY` or `GEMINI_API_KEY` before browser collection.
- Hardened Stagehand cleanup so a close failure is logged without masking a collected research result.
- Kept the shared Adzuna logging behavior by moving the duplicate helper into `lib/agent-logs.ts`.
- The dev server has a stale `.next/dev` lock pointing to dead PID `4312`; `next dev` exits because of that lock. `next start -p 3003` works from the built app.
- Live click testing originally showed `Company research AI is not configured.` because the first implementation only checked `OPENROUTER_API_KEY`. This was corrected to support the existing `GEMINI_API_KEY`.
- Source links were hardened after review so model output such as company names, page titles, or relative paths cannot render as invalid source-area anchors.

## Current state

- `npm run lint` passes.
- `npm run build` passes.
- `git diff --check` passes.
- Built-server smoke check on `http://localhost:3003` confirms unauthenticated `POST /api/agent/research` returns `401` with `{"success":false,"error":"Please sign in before researching a company."}`.
- Full authenticated Browserbase/Gemini smoke still needs to be run after restarting the running Next.js server so it picks up the patched provider logic.
- Build still emits the existing Node `module.register()` deprecation warning.
- Installing Browserbase/Stagehand dependencies reported npm audit warnings: 19 vulnerabilities, 17 low and 2 moderate. No automatic dependency fixes were applied.
- A `next start -p 3003` process was left running for local trial unless the shell/session is closed.

## Next session starts with

Restart the running Next.js server, then click `Research Company` on a valid saved job to complete the authenticated Browserbase/Gemini smoke. After that, run `/remember restore` in the next session and start Feature 14 Dashboard Page - Full UI.

## Open questions

- Whether to remove the stale `.next/dev` lock/dead PID state before the next visual verification session.
- Whether to run a live authenticated company research smoke once the server has been restarted with the patched Gemini-capable code and a valid logged-in browser session is available.
