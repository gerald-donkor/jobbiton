# Memory — Feature 07 Resume Extraction Verified

Last updated: 2026-06-11 12:14 GMT

## What was built

- Completed Phase 2 Feature 7: AI Profile Extraction from Resume.
- Added `app/api/resume/extract/route.ts` for authenticated resume text extraction and profile draft generation.
- Added `lib/resume-extraction.ts` with Gemini REST extraction, Zod validation, output normalization, provider error handling, and fallback handling for years of experience and responsibilities.
- Added `lib/resume-files.ts` to centralize resume formats, accepted input types, storage paths, content types, and preview/extraction capability checks.
- Added `app/api/resume/current/route.ts` and `app/api/resume/preview/route.ts` for authenticated current-resume access and text previews.
- Updated `actions/profile.ts` with resume upload/save support plus a dedicated `uploadResume` server action that persists selected resumes immediately.
- Updated `components/profile/ProfileEditor.tsx` and `components/profile/ResumeSection.tsx` so resume selection uploads immediately, saved resumes survive refresh, extraction fills the editable draft, and status messages show success/error colors.
- Updated `components/profile/ProfileAttentionBanner.tsx` so complete 100% profiles render no banner.
- Updated `app/globals.css` so semantic buttons and links use Tailwind `cursor-pointer`, with disabled buttons using `cursor-not-allowed`.
- Updated `app/layout.tsx` with root body hydration warning suppression for browser extension attributes.
- Updated `proxy.ts` so `/api/resume/*` participates in InsForge session refresh before route handlers run.
- Removed the unused `openai` package dependency and added the approved resume parsing/preview dependencies already reflected in `package.json`.
- Updated `context/library-docs.md`, `context/ui-registry.md`, and `context/progress-tracker.md` for the completed resume upload/extraction behavior.

## Decisions made

- Resume extraction uses server-side `GEMINI_API_KEY` with Gemini REST, trying `gemini-2.5-flash` first and falling back to `gemini-2.5-flash-lite`.
- Extraction writes only to the client-side editable profile draft; profile fields are persisted only when the user clicks Save Profile.
- Resume file selection persists immediately to InsForge storage and saves `profiles.resume_pdf_url`; Save Profile is not required just to keep the uploaded document across refreshes.
- PDF text extraction uses `pdf2json` instead of PDF.js-based packages to avoid Turbopack worker resolution failures.
- DOCX previews use Mammoth raw text, not converted HTML, to avoid unsanitized document HTML.
- Upload/current download supports PDF, DOC, DOCX, TXT, and RTF. AI extraction currently supports PDF and TXT.
- Extracted URL fields must be normalized to absolute `https://` URLs before filling browser `type="url"` inputs.
- Profile completion is app-calculated; at 100%, the attention banner is hidden completely.

## Problems solved

- Fixed the PDF worker failure by replacing `pdf-parse` with `pdf2json`.
- Fixed OpenAI quota failures by moving resume extraction to Gemini.
- Fixed Gemini invalid/truncated JSON by using the correct `responseMimeType`, `responseJsonSchema`, a 4096-token output budget, and fallback model handling.
- Fixed idle-session extraction failures by including `/api/resume/*` in `proxy.ts` so InsForge can refresh expired access tokens before API handlers run.
- Fixed missing Years of Experience by normalizing numeric strings and estimating from extracted work dates when Gemini leaves it blank.
- Fixed missing Key Responsibilities by prompting for role bullets/duties and backfilling likely responsibility lines from raw resume text when a matched role has blank responsibilities.
- Fixed refresh losing selected resumes by uploading the file immediately and saving the resulting storage URL to the profile row.
- Fixed Portfolio/GitHub browser URL validation failures by normalizing extracted links like `github.com/name` to `https://github.com/name`.
- Fixed Grammarly/body-level hydration mismatch noise with `suppressHydrationWarning` on the root body.
- User confirmed the resume upload/extraction/save flow is working.

## Current state

- Phase 1 Foundation is complete.
- Phase 2 Feature 5 Profile Page Full UI is complete.
- Phase 2 Feature 6 Profile Save Logic is complete.
- Phase 2 Feature 7 AI Profile Extraction from Resume is complete and user-verified.
- Uploaded resumes persist after refresh and are served through authenticated resume routes.
- Extracted profile data fills the form draft, including years of experience, responsibilities, and normalized `https://` profile URLs.
- `GEMINI_API_KEY` is expected in `.env.local`; restart the dev server after changing it.
- `npm run lint` passes.
- `git diff --check` passes.
- `npm run build` passes when network access is available for `next/font` to fetch Inter from Google Fonts.
- The final build still shows a dependency deprecation warning for Node `module.register()`, but completes successfully.
- `npm install` previously reported 2 moderate vulnerabilities and pending install-script approval warnings; no audit fix was run.
- Working tree remains dirty with uncommitted Feature 7 and earlier profile changes.

## Next session starts with

Run `/remember restore`, then begin Phase 2 Feature 8: Resume PDF Generation from Profile.

Start by fetching the relevant current docs for PDF generation, AI provider use, and InsForge storage. The first implementation target should be `POST /api/resume/generate`: read the saved profile, generate polished resume content, render a PDF server-side with `@react-pdf/renderer`, upload it to the private `resumes` bucket, save the resulting URL to `profiles.resume_pdf_url`, and update the Resume card state.

## Open questions

- Whether Feature 8 should use Gemini for resume generation too, or follow the existing build-plan wording that still references GPT-4o/OpenAI.
- Whether to address the 2 moderate npm audit findings before starting Feature 8.
- Whether to add browser-level regression tests for selected resume upload persistence, extraction, draft population, and Save Profile.
