# Memory — Foundation Auth Session

Last updated: 2026-06-08 18:09 GMT

## What was built

- Completed Phase 1 `02 Auth` with InsForge Google/GitHub OAuth.
- Installed `@insforge/sdk` and created InsForge helpers in `lib/insforge-client.ts`, `lib/insforge-server.ts`, and `lib/auth.ts`.
- Added server-owned OAuth routes:
  - `app/api/auth/oauth/start/route.ts` starts Google/GitHub OAuth and stores the PKCE verifier in an httpOnly cookie.
  - `app/auth/callback/route.ts` exchanges `insforge_code` in server mode and sets InsForge access + refresh cookies before redirecting to `/profile`.
  - `app/api/auth/refresh/route.ts` exposes the InsForge refresh handler.
  - `app/api/auth/session/route.ts` now only clears auth cookies on sign-out.
- Added `/login` UI in `app/login/page.tsx` and `components/auth/LoginForm.tsx`, matching the supplied split-panel auth design.
- Added protected placeholder pages for `/dashboard`, `/profile`, `/find-jobs`, and `/find-jobs/[id]` using `components/protected/ProtectedShell.tsx` and `components/auth/SignOutButton.tsx`.
- Added Next 16 `proxy.ts` route protection for `/dashboard`, `/profile`, `/find-jobs`, and `/find-jobs/[id]`.
- Updated homepage `components/homepage/FeatureText.tsx` so active feature rails use `border-success` green instead of accent blue/purple.
- Updated `context/project-overview.md`, `context/build-plan.md`, `context/architecture.md`, `context/library-docs.md`, `context/progress-tracker.md`, and `context/ui-registry.md` to reflect auth behavior and UI patterns.

## Decisions made

- OAuth is server-owned for this app. Client components navigate to `/api/auth/oauth/start?provider=...`; they do not call `signInWithOAuth()` directly.
- Successful auth redirects to `/profile` for onboarding/profile setup, not `/dashboard`.
- The OAuth callback must set both InsForge access and refresh cookies. Missing `refreshToken` is treated as an auth failure because access-token-only sessions are not durable for protected server-rendered routes.
- Next.js 16 route protection uses `proxy.ts`, not legacy `middleware.ts`.
- `.env.local` should use:
  - `NEXT_PUBLIC_INSFORGE_URL=https://c5g2jgr3.us-east.insforge.app`
  - `NEXT_PUBLIC_INSFORGE_ANON_KEY=<anon JWT>`
- Auth UI uses the split-panel login pattern recorded in `ui-registry.md`; temporary protected pages use the compact protected auth shell pattern.

## Problems solved

- Fixed OAuth start failure caused by `NEXT_PUBLIC_INSFORGE_URL` being set to an API-key-shaped value instead of the InsForge backend URL.
- Fixed post-login loop back to `/login` by moving OAuth callback/session persistence to server-owned routes that set SSR-readable InsForge cookies.
- Fixed review findings:
  - Docs now match `/profile` onboarding redirect.
  - The custom browser-token-to-cookie bridge was replaced with server-side PKCE/code exchange.
  - Login error messages now distinguish OAuth start, provider callback, and session persistence failures.
- Removed stale `AuthCallback` UI/page references from the UI registry after replacing the callback screen with a route handler.
- Corrected the active homepage feature rail color to success green and updated the registry.

## Current state

- `01 Homepage` and `02 Auth` are marked complete.
- `npm run lint` passes.
- `npm run build` passes when network access is approved for Google Fonts.
- In restricted sandbox mode, `npm run build` still fails on `next/font/google` fetching Inter; this is an environment/network issue, not a source error.
- The workspace is dirty with intentional feature changes plus pre-existing/untracked files including `.claude/` and `.mcp.json`.
- Dev server should be restarted before testing auth because `.env.local` and route handlers changed.

## Next session starts with

- Begin Phase 1 `03 PostHog Initialization` from `context/build-plan.md`.
- Before coding, re-read the required context files from `AGENTS.md`.
- Add PostHog browser/server clients, initialize PostHog in the root app layout, and wire identify/reset around the completed auth flow.

## Open questions

- Confirm whether the product should permanently keep post-login onboarding at `/profile`, or later switch completed-profile users to `/dashboard`.
- Confirm OAuth redirect URLs are configured in InsForge for the active dev port, especially `http://localhost:3000/auth/callback` or the actual port being used.
