<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Read Before Anything Else

Read in this exact order before any implementation:

1. context/project-overview.md
2. context/architecture.md
3. context/ui-tokens.md
4. context/ui-rules.md
5. context/ui-registry.md
6. context/code-standards.md
7. context/library-docs.md
8. context/build-plan.md
9. context/progress-tracker.md

## Rules That Never Change

- Never use hardcoded hex values or raw Tailwind color classes
- Update `progress-tracker.md` and `ui-registry.md` after every feature
- Before any third party library — load its installed skill first,
  then read `context/library-docs.md` for project-specific rules
- If the same problem persists after one corrective prompt —
  stop immediately and run /recover

## Available Skills

- `/architect` — before any complex feature. Think before building.
- `/imprint` — after any new UI component. Capture patterns.
- `/review` — before demo or when something feels off.
- `/recover` — when something breaks after one failed correction.
- `/remember save` — when a feature spans multiple sessions.
- `/remember restore` — when returning after a multi-session feature.

## InsForge Backend Rules

- InsForge is the backend platform for auth, database, storage, realtime, serverless functions, AI integration, and payments.
- Before writing or editing any InsForge integration code, call InsForge MCP `fetch-docs` or `fetch-sdk-docs` for the relevant area.
- Use the InsForge SDK for application logic: auth, database CRUD, storage, AI integration, function invocation, realtime, and payments.
- Use InsForge MCP tools for infrastructure: backend metadata, schema changes, storage buckets, serverless functions, and deployment.
- API base URL: `https://c5g2jgr3.us-east.insforge.app`.
- InsForge SDK operations return `{ data, error }`; always handle `error`.
- Database inserts use array format, for example `[{ ... }]`.
- Serverless functions expose one endpoint and do not support nested route paths.
- Storage uploads go to buckets; store resulting URLs in the database.
- AI integrations should call OpenRouter directly with server-side `OPENROUTER_API_KEY` and `baseURL: "https://openrouter.ai/api/v1"`.
- Keep Tailwind CSS version guidance in sync before dependency changes; InsForge docs currently warn to use Tailwind CSS 3.4 and not upgrade to v4.
