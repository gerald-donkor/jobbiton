# Memory — Database Schema Foundation

Last updated: 2026-06-09 10:50 GMT

## What was built

- Feature 4 Database Schema was completed in InsForge.
- Created `profiles`, `agent_runs`, `jobs`, and `agent_logs` tables with the columns from `context/architecture.md`.
- Added practical defaults, check constraints, foreign keys, and indexes for upcoming profile, job search, job details, and agent logging flows.
- Enabled RLS on all four tables and added own-row select/insert/update/delete policies using `auth.uid()`.
- Created private `resumes` storage bucket.
- Updated `context/progress-tracker.md` to mark Feature 4 complete and set the next feature to `05 Profile Page — Full UI`.
- Updated `context/ui-registry.md` with a non-visual InsForge Database Schema entry.

## Decisions made

- InsForge MCP tools are the source of truth for infrastructure changes: raw SQL for schema and MCP storage tools for buckets.
- `profiles.id` is the authenticated user UUID and other app-owned tables use `user_id` references to `profiles(id)`.
- `jobs.source` is constrained to `search | url` even though URL import is currently out of scope, because the schema is already planned for that shape.
- The `resumes` bucket is private, not public; future app logic should store uploaded/generated resume references on `profiles.resume_pdf_url`.
- The project remains on the strict four-event PostHog standard for now: `job_search_started`, `job_found`, `profile_completed`, and `company_researched`.

## Problems solved

- The backend had no app tables or storage buckets; Feature 4 created the full schema foundation from a clean InsForge project.
- Verified via InsForge schema tools that all four tables exist, RLS is enabled, policies are present, indexes exist, and the `resumes` bucket is private.

## Current state

- Phase 1 Foundation is complete.
- `npm run lint` passes.
- `npx tsc --noEmit` passes.
- InsForge backend now has the app schema and private resume storage bucket.
- Only repo files changed this session are `context/progress-tracker.md`, `context/ui-registry.md`, and `memory.md`; the table and bucket changes live in InsForge backend state.

## Next session starts with

Start Phase 2, Feature 5: build the complete Profile Page UI with mock data only. Before implementation, use `/architect` because it is a full page feature, then follow the UI tokens/rules and update `ui-registry.md` and `progress-tracker.md` after completion.

## Open questions

- Should homepage access for authenticated users remain allowed permanently, even though the older project overview said logged-in homepage visits redirect during onboarding?
