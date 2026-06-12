# Memory - Feature 08 Resume PDF Generation

Last updated: 2026-06-12 11:01 GMT

## What was built

- Completed Phase 2 Feature 8: Resume PDF Generation from Profile.
- Added `app/api/resume/generate/route.ts` for authenticated resume generation from the saved profile row.
- Added `lib/resume-generation.ts` for AI-polished resume content generation, Zod validation, safe provider errors, OpenRouter/GPT-4o preference, Gemini fallback when OpenRouter is not configured, and Gemini model fallback from `gemini-2.5-flash` to `gemini-2.5-flash-lite` on temporary provider spikes.
- Added `lib/resume-pdf.tsx` for server-side `@react-pdf/renderer` PDF rendering through `renderToBuffer`.
- Added `lib/resume-storage.ts` to centralize active-resume replacement, active-resume removal, and shared InsForge error description.
- Updated `actions/profile.ts` so uploaded resumes use the shared active-resume replacement helper and users can remove the active resume with a `removeResume` server action.
- Updated `components/profile/ProfileEditor.tsx` and `components/profile/ResumeSection.tsx` so `Generate Resume from Profile` calls `/api/resume/generate`, and the Resume card includes a clickable `Remove resume` button when a resume exists.
- The remove flow deletes known active resume objects from InsForge storage, clears `profiles.resume_pdf_url`, resets local preview/input/extraction state, and returns the card to the empty upload state.
- Refined `lib/resume-pdf.tsx` so generated resumes follow a cleaner conventional structure: left-aligned header, stronger name/title spacing, explicit identity block and line-height separation, cleaner contact lines, title-case sections, better experience hierarchy, and education formatting closer to a real resume.
- Installed approved dependency `@react-pdf/renderer`.
- Updated `context/code-standards.md`, `context/library-docs.md`, and `context/progress-tracker.md` for Feature 08 and the related recovery fixes. `ui-registry.md` was already current after the Resume card UI changes and did not need another update for the backend/PDF-only fixes.

## Decisions made

- Resume generation uses the saved `profiles` table row, not unsaved form draft edits.
- Generated PDF replaces the active resume at the canonical `resume.pdf` path and updates only `profiles.resume_pdf_url`; it does not mutate profile fields.
- OpenRouter model `openai/gpt-4o` is preferred when `OPENROUTER_API_KEY` exists, matching current InsForge AI guidance.
- Gemini REST with the existing `GEMINI_API_KEY` is allowed as a local fallback so generation works in the current environment where Gemini is already configured.
- InsForge storage uploads do not use a fake `upsert` option; the app removes known active resume paths first, then uploads the new current resume.
- Resume removal is explicit and user-clicked; it clears the current resume but leaves profile details intact so the user can upload another file or generate a fresh resume.
- Generated PDFs should look like a conventional resume reference, not a centered app export; preference-style metadata stays out of the PDF, and the AI prompt avoids invented metrics and overly dense bullets.
- Resume generation should be resilient to temporary AI provider spikes; when OpenRouter is unavailable or not configured and Gemini returns `503 UNAVAILABLE` on `gemini-2.5-flash`, generation falls back to `gemini-2.5-flash-lite` before failing.

## Problems solved

- Avoided duplicate storage behavior by extracting `replaceUserResume()` and reusing it for both upload and generated resumes.
- Preserved the one-active-resume product rule across PDF, DOC, DOCX, TXT, RTF uploads, generated PDFs, and explicit removal.
- Kept React PDF server-only and avoided writing generated buffers to disk.
- Fixed the missing UX escape hatch where users could not intentionally clear an uploaded/generated resume before uploading another or generating from profile details.
- Fixed remove-resume failures caused by InsForge returning `404 STORAGE_NOT_FOUND` for resume formats that were not present; active-resume removal is now idempotent and ignores missing known paths while still failing on real storage errors.
- Fixed the generated PDF’s cramped centered header and raw document feel by moving to a left-aligned layout with clearer section rhythm, more readable experience blocks, and explicit header spacing so the title no longer collides with the candidate name.
- Fixed resume-generation failures caused by temporary Gemini high-demand `503 UNAVAILABLE` responses by adding the same `gemini-2.5-flash` to `gemini-2.5-flash-lite` fallback pattern already used in resume extraction.
- Cleaned the new PDF helper to keep new code ASCII-only.

## Current state

- Phase 1 Foundation is complete.
- Phase 2 Profile Page is complete through Feature 08.
- `POST /api/resume/generate` is present in the production route manifest.
- Resume card has a visible `Remove resume` button whenever a resume exists.
- Remove resume now treats already-missing storage objects as successfully removed.
- Generated resume PDFs now use the polished left-aligned structure and no longer include the old app-like preferences footer.
- Resume generation now retries across Gemini models instead of failing immediately on the first temporary provider-availability error.
- `npm run lint` passes.
- `git diff --check` passes.
- `npm run build` passes; it still shows the existing Node `module.register()` deprecation warning but completes successfully.
- `npm install @react-pdf/renderer` completed and still reports 2 moderate vulnerabilities plus pending install-script approval warnings; no audit fix was run.
- Working tree remains dirty with uncommitted Feature 08 and earlier changes. `context/build-plan.md` still has a pre-existing one-line diff.

## Next session starts with

Run `/remember restore`, then begin Phase 3 Feature 09: Find Jobs Page - Full UI.

Start by reading the Next.js docs required by AGENTS, then build the complete mock-data Find Jobs UI: search controls card, success message area, filter/sort bar, jobs table, pagination, and Adzuna credit. Use existing UI tokens and update `ui-registry.md` and `progress-tracker.md` after the feature.

## Open questions

- Whether to address the 2 moderate npm audit findings and pending install-script approval warnings before starting Phase 3.
- Whether to manually browser-test upload, remove, generated resume, and generated-after-remove flows against a real saved profile and AI key before moving on.
- Whether to clean or intentionally keep the existing `context/build-plan.md` one-line diff.
