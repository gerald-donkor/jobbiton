# Memory — Profile Save Logic Stabilized

Last updated: 2026-06-09 21:19 GMT

## What was built

- Completed Phase 2 Feature 6: Profile Save Logic.
- Added `actions/profile.ts` with a `saveProfile` server action that reads the authenticated user, saves profile fields to InsForge `profiles`, uploads PDF resumes to the private `resumes` bucket, computes completion, revalidates `/profile`, and captures `profile_completed` when a profile first becomes complete.
- Added `lib/profile.ts` with profile normalization, default empty profile values, list helpers, work/education shapes, and app-owned completion calculation.
- Added `components/profile/ProfileEditor.tsx` as the client wrapper for the profile banner, connected accounts card, resume section, and profile form.
- Wired `/profile` in `app/profile/page.tsx` to load the saved profile row and pass normalized data into the profile UI.
- Updated `components/profile/ProfileInformationForm.tsx` so form fields submit real names, skill/industry/work-experience state is included, the save button uses the server action, and save feedback appears above the button.
- Updated `components/profile/ResumeSection.tsx` so the PDF picker is wired to the form and shows selected/saved resume context.
- Updated `components/profile/ProfileAttentionBanner.tsx` so the banner is data-driven, starts at 0% for new profiles, renders complete-state copy/styling at 100%, and updates after saves.
- Updated `context/ui-registry.md` and `context/progress-tracker.md` with the profile save and completion-banner behavior.

## Decisions made

- Profile completion is app-calculated from `lib/profile.ts`; it is not stored as a separate percentage column.
- Brand-new profiles intentionally render empty fields and 0% completion; auth email, default dropdowns, and placeholder values do not count as completed profile data.
- Blank constrained dropdown values remain blank in the UI but are stored as `null` in InsForge to satisfy database constraints.
- `ProfileEditor` owns the attention banner so it can recalculate completion from the latest server-action profile snapshot after each save.
- Failed saves return the submitted profile snapshot so the UI keeps user-entered data instead of reverting to the last saved backend row.
- The cover letter tone options now match the existing database constraint: `formal`, `casual`, and `enthusiastic`.

## Problems solved

- Fixed a Next.js server-action export issue where a `"use server"` file exported a non-async initial state object.
- Fixed profile saves failing with `POST /profiles 400` by storing blank constrained fields as `null` instead of empty strings.
- Fixed generic `{}` save-error logging by logging useful SDK error properties.
- Fixed typed form data disappearing after a failed save by returning and rendering the submitted profile snapshot.
- Fixed the 100% banner still reading like an attention warning by switching complete profiles to complete copy and success styling.
- Fixed the completion percentage staying stale after clearing fields by moving the banner into the editor state path and recalculating from the latest save-action profile snapshot.

## Current state

- Phase 1 Foundation is complete.
- Phase 2 Feature 5 Profile Page Full UI is complete.
- Phase 2 Feature 6 Profile Save Logic is complete and has been corrected after review.
- Profile saves, blank-field persistence, failed-save data preservation, 100% complete banner copy, and post-save completion percentage recalculation are implemented.
- `npm run lint` passes.
- `npm run build` passes when run with network approval for `next/font` to fetch Inter from Google Fonts.
- Working tree remains dirty with uncommitted profile feature changes and docs updates.
- No automated browser interaction test has been added yet for saving, clearing fields, and seeing the banner percentage drop.

## Next session starts with

Run `/remember restore`, then begin Phase 2 Feature 7: AI Profile Extraction from Resume. Before editing AI, storage, or InsForge integration code, fetch the relevant current docs. The first implementation target should be the resume extraction flow: upload/read PDF text, call GPT-4o/OpenRouter server-side, map extracted data to the existing `ProfileValues` shape, populate the profile form for review, and let the user save manually.

## Open questions

- Whether the resume extraction flow should use the currently selected unsaved PDF immediately or only an already-uploaded resume URL.
- Whether to add an automated Playwright-style regression check for profile save, field clearing, and completion percentage recalculation before moving deeper into Feature 7.
