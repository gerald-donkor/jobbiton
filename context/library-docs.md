# Library Docs

Project-specific usage patterns for every third party library in this project. This file only covers how we use each library in this specific project — rules, patterns, and constraints specific to JobPilot.

Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

Before implementing any feature that uses a third party library:

1. **Check AGENTS.md** at the project root — it lists every skill installed for this project and how to use them. Skills contain up-to-date API documentation, usage patterns, and best practices specific to this codebase.

2. **Check if an MCP server is configured** for that library. Some tools have MCP servers that give the AI agent direct access to documentation, logs, and debugging tools. If an MCP server is available — use it before falling back to general knowledge.

3. **Read this file** for project-specific patterns that override general library knowledge.

The order of authority is:

```
MCP server (real-time docs) → Skills via AGENTS.md → This file (project rules) → General training knowledge
```

Never rely on general training knowledge alone for library APIs — they change frequently and training data may be outdated.

---

## InsForge

**Check first:** Check AGENTS.md for an installed InsForge skill. If an InsForge MCP server is configured — use it. The skill/MCP will have the latest API patterns.

### Client vs Server

Two separate instances — never mix them:

```typescript
// lib/insforge-client.ts — browser context only
import { createBrowserClient } from "@insforge/sdk/ssr";

export const insforge = createBrowserClient();
```

```typescript
// lib/insforge-server.ts — server context only
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";

export const createInsforgeServer = async () => {
  return createServerClient({
    cookies: await cookies(),
  });
};
```

**Rules:**

- Browser client — Client Components, browser-side auth state, realtime subscriptions
- Server client — Server Components, API routes, Server Actions, agent functions
- Never use browser client in server context
- Never use server client in browser context

### OAuth in This App

OAuth is server-owned so protected Server Components and Proxy can read durable InsForge cookies.

- `GET /api/auth/oauth/start?provider=google|github` starts OAuth and stores the PKCE verifier in an httpOnly cookie.
- `GET /auth/callback` exchanges `insforge_code` with InsForge in server mode.
- Callback must call `setAuthCookies(response.cookies, { accessToken, refreshToken })` when exchange succeeds.
- Treat a missing `refreshToken` from server-mode OAuth exchange as an auth failure; access-token-only cookies are not durable enough for protected server-rendered routes.
- Successful OAuth redirects to `/profile` for onboarding/profile setup.
- Client components should navigate to `/api/auth/oauth/start?...`; do not call `signInWithOAuth()` directly for this app flow.

---

### Auth

```typescript
// Get current user in server context
const insforge = await createInsforgeServer();
const {
  data: { user },
  error,
} = await insforge.auth.getCurrentUser();
if (!user) redirect("/login");
```

**Resume API session refresh:**

- `proxy.ts` must include `/api/resume/:path*` so InsForge `updateSession()` refreshes expired access tokens before authenticated resume API routes run.
- Do not redirect resume API requests from proxy; let route handlers return JSON errors so the client can show inline feedback.

---

### DB Queries

```typescript
// Read
const { data, error } = await insforge
  .from("jobs")
  .select("*")
  .eq("user_id", user.id)
  .order("found_at", { ascending: false });

// Insert
const { data, error } = await insforge
  .from("jobs")
  .insert({ user_id: user.id, title, company, match_score })
  .select()
  .single();

// Update
const { error } = await insforge
  .from("jobs")
  .update({ company_research: dossier })
  .eq("id", jobId)
  .eq("user_id", user.id); // always scope to user
```

**Rules:**

- Always scope queries to `user_id` — never query without user filter
- Always handle the `error` return — never assume success
- Use `.single()` when expecting exactly one row

---

### Storage

```typescript
// Upload file
const { data, error } = await insforge.storage
  .from("resumes")
  .upload(`${userId}/resume.pdf`, fileBuffer, {
    contentType: "application/pdf",
    upsert: true, // overwrites existing file
  });

// Get public URL
const { data } = insforge.storage
  .from("resumes")
  .getPublicUrl(`${userId}/resume.pdf`);

const url = data.publicUrl;
```

**Storage paths:**

- Base resume: `resumes/{user_id}/resume.pdf`

**Rules:**

- Always use `upsert: true` for base resume uploads — overwrites existing file
- Always save the public URL back to the DB after upload
- Never write files to disk — always upload buffer directly to storage
- Resume selection in the profile UI uploads immediately and saves `profiles.resume_pdf_url`; Save Profile should not be required just to persist the selected document across refreshes

---

## Adzuna API

**Check first:** Check AGENTS.md for an installed Adzuna skill. If none exists — use this file and the official Adzuna API docs.

### Job Search

```typescript
// lib/adzuna.ts
export async function searchJobs(
  jobTitle: string,
  location: string,
  country: string = "us",
): Promise<AdzunaJob[]> {
  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_APP_KEY!,
    what: jobTitle,
    category: "it-jobs", // always filter to IT jobs
    results_per_page: "10",
    "content-type": "application/json",
  });

  // Only add where if location is provided
  if (location) {
    params.set("where", location);
  }

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Adzuna API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
}
```

### Response Shape

Each Adzuna job result contains:

```typescript
type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string; // snippet only — not full description
  redirect_url: string; // Adzuna tracking URL → redirects to actual job
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted: "0" | "1"; // "1" means salary is estimated
  contract_type?: string;
  created: string; // ISO date string
  category: { tag: string; label: string };
};
```

### Saving Jobs to DB

```typescript
// Map Adzuna result to jobs table
const jobRecord = {
  user_id: userId,
  run_id: runId,
  source: "search", // always 'search' for Adzuna jobs
  source_url: job.redirect_url,
  external_apply_url: job.redirect_url,
  title: job.title,
  company: job.company.display_name,
  location: job.location.display_name,
  salary: job.salary_min
    ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max! / 1000)}k`
    : null,
  job_type: job.contract_type || "fulltime",
  about_role: job.description, // Adzuna returns snippet — used as description
  match_score: scoredJob.matchScore,
  match_reason: scoredJob.matchReason,
  matched_skills: scoredJob.matchedSkills,
  missing_skills: scoredJob.missingSkills,
  found_at: new Date().toISOString(),
};
```

**Rules:**

- Always include `category=it-jobs` — never search Adzuna without this filter
- Never pass `where` if location is empty — omit the parameter entirely
- `source` is always `'search'` for Adzuna jobs — never any other value
- `salary_is_predicted: "1"` means Adzuna estimated the salary — this is normal
- Adzuna description is a snippet — GPT-4o scores from it, not a full description
- Default country to `'us'` — support `gb`, `au`, `ca` as alternatives

---

## Browserbase

**Check first:** Check AGENTS.md for an installed Browserbase skill. If a Browserbase MCP server is configured — use it. The skill/MCP will have the latest session management and API patterns.

### Session Creation — Company Research

```typescript
import Browserbase from "@browserbasehq/sdk";

const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });

// Single session for company research — sequential page visits
const session = await bb.sessions.create({
  projectId: process.env.BROWSERBASE_PROJECT_ID!,
  timeout: 120, // 2 minute session — visits 3-4 pages max
});
```

**Important — Browserbase runs independently from your Next.js server:**
Browserbase sessions run on Browserbase's cloud infrastructure, not inside your Next.js API route. The API route triggers the Browserbase session and returns a response while the session continues running independently on Browserbase's platform. Do not add `maxDuration` or any timeout configuration to Next.js API routes to accommodate Browserbase session length.

**Rules:**

- Always use single sessions — never parallel sessions (free plan limit)
- Session timeout is 120 seconds — sufficient for 3-4 page visits
- Always end sessions cleanly — call stagehand.close() when done
- Project ID always from `process.env.BROWSERBASE_PROJECT_ID` — never hardcode
- Browserbase client lives in `lib/browserbase.ts` — always import from there

---

## Stagehand

**Check first:** Check AGENTS.md for an installed Stagehand skill. If a Stagehand MCP server is configured — use it. The skill/MCP will have the latest act() and extract() patterns.

### Initialisation

```typescript
import { Stagehand } from "@browserbasehq/stagehand";

const stagehand = new Stagehand({
  env: "BROWSERBASE",
  apiKey: process.env.BROWSERBASE_API_KEY!,
  projectId: process.env.BROWSERBASE_PROJECT_ID!,
  browserbaseSessionID: session.id,
  model: { modelName: "openai/gpt-4o", apiKey: process.env.OPENAI_API_KEY! },
  disablePino: true,
});

await stagehand.init();
const page = stagehand.context.activePage()!;
```

### extract()

```typescript
import { z } from "zod";

const result = await stagehand.extract({
  instruction:
    "Extract the company overview, main product description, and any technology mentions from this page.",
  schema: z.object({
    companyOverview: z.string().optional(),
    mainProduct: z.string().optional(),
    techMentions: z.array(z.string()).optional(),
    navLinks: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
        }),
      )
      .optional(),
  }),
});
```

### act()

```typescript
// Always wrap in try/catch
try {
  await stagehand.act({
    action: "Click the About link in the navigation",
  });
} catch (error) {
  await logAgentError(jobId, null, error);
}
```

## Company Research Section

Replace the existing Stagehand "Company Research Pattern" section in library-docs.md with this:

---

### Company Research Pattern

Three-step process: homepage extraction → sub-page extraction → GPT-4o synthesis.
Job description and user profile come from DB — never re-fetch what you already have.
Browser's only job is the company website.

```typescript
// Step 1 — Homepage extraction
const homepageData = await stagehand.extract({
  instruction:
    "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
  schema: z.object({
    oneLiner: z.string().describe("What the company does in one sentence"),
    productSummary: z
      .string()
      .describe("What they build/sell and who it's for"),
    signals: z
      .array(z.string())
      .describe("Funding, notable customers, scale, mission, recent news"),
    pageLinks: z
      .array(
        z.object({
          url: z.string(),
          kind: z.enum([
            "about",
            "careers",
            "blog",
            "engineering",
            "product",
            "team",
            "other",
          ]),
        }),
      )
      .describe("Internal links worth visiting"),
  }),
});

// If oneLiner and productSummary are empty — wrong site or parked domain
// Skip to synthesis with job description and profile only
if (!homepageData.oneLiner && !homepageData.productSummary) {
  await stagehand.close();
  // proceed to synthesis with empty companyResearch
}

// Step 2 — Sub-page extraction (max 3, prefer about/blog/engineering/product over careers)
const subPageData = await stagehand.extract({
  instruction:
    "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
  schema: z.object({
    keyPoints: z.array(z.string()),
    technologies: z
      .array(z.string())
      .describe("Specific languages, frameworks, tools, platforms"),
    valuesOrCulture: z
      .array(z.string())
      .describe("Stated values, working style, team norms"),
    notable: z
      .array(z.string())
      .describe("Customers, funding, scale, projects, awards"),
  }),
});

// Step 3 — GPT-4o synthesis (after browser closes)
// Feed three data sources: company research + job from DB + profile from DB
const systemPrompt = `You are a sharp career strategist preparing a candidate to apply for a specific role. You are given (a) research collected from the company's own website, (b) the job posting, and (c) the candidate's profile. Produce a concise, concrete briefing that gives this specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts. If research was thin, infer carefully from the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON matching this shape:
{
  "companyOverview": string,
  "techStack": string[],
  "culture": string[],
  "whyThisRole": string,
  "yourEdge": string[],
  "gapsToAddress": string[],
  "smartQuestions": string[],
  "interviewPrep": string[],
  "sources": string[]
}`;

const userPrompt = `COMPANY RESEARCH (from their website):
${JSON.stringify(companyResearch)}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Matched skills (already computed): ${job.matched_skills.join(", ")}
Missing skills (already computed): ${job.missing_skills.join(", ")}

CANDIDATE PROFILE:
Current title: ${profile.current_title}
Experience: ${profile.years_experience} years, level ${profile.experience_level}
Skills: ${profile.skills.join(", ")}
Work history: ${JSON.stringify(profile.work_experience)}`;

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  response_format: { type: "json_object" },
  temperature: 0.4,
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ],
});
```

**Dossier fields:**

| Field           | Type     | Purpose                                             |
| --------------- | -------- | --------------------------------------------------- |
| companyOverview | string   | What the company does                               |
| techStack       | string[] | Technologies they use                               |
| culture         | string[] | Values and working style                            |
| whyThisRole     | string   | Why this role exists                                |
| yourEdge        | string[] | Specific links between THIS candidate and this role |
| gapsToAddress   | string[] | Missing skills reframed as strategy                 |
| smartQuestions  | string[] | Questions that show real research                   |
| interviewPrep   | string[] | Topics to prepare for this role                     |
| sources         | string[] | Pages the company info came from                    |

**Rules:**

- Always use `extract()` with a Zod schema — never parse raw HTML or use regex
- Always wrap every `act()` and `extract()` in try/catch
- Always call `await stagehand.close()` when done — ends the Browserbase session
- Model is always `gpt-4o` — never use other models
- Temperature is `0.4` for synthesis — grounded but flexible enough to make real connections
- Max 3 sub-pages — never exceed this on free plan
- Always close session in finally block — never leave sessions open even if research fails
- Job description and profile always come from DB — never re-fetch via browser
- If browser research returns empty — still run synthesis with job + profile only
- yourEdge, gapsToAddress, and smartQuestions are the most valuable fields — never skip them

## Gemini API

**Check first:** Check official Google AI Gemini docs before changing request or response shapes.

### Resume Extraction Structured JSON

```typescript
const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY!,
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: "Return only valid JSON." }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: "Your prompt here" }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          properties: {
            fullName: { type: "string" },
            email: { type: "string" },
          },
          required: ["fullName", "email"],
        },
      },
    }),
  },
);
```

**Rules:**

- Use server-side `GEMINI_API_KEY`; never expose it with a `NEXT_PUBLIC_` prefix
- Use the REST API from server code for resume extraction; no client-side Gemini calls
- Try `gemini-2.5-flash` first and fall back to `gemini-2.5-flash-lite` if Gemini returns an error or non-JSON content
- Do not use `gemini-3.5-flash` for resume extraction; it returned unusable one-letter text responses in local smoke tests
- Send the API key in the `x-goog-api-key` header
- Use `generationConfig.responseMimeType = "application/json"` for structured resume extraction
- Pair JSON mode with `generationConfig.responseJsonSchema` so Gemini is constrained to the expected object shape
- Always validate parsed JSON with Zod before using it
- Ask for `yearsExperience` as digits only; normalize values like `5 years` to `5`
- If Gemini leaves `yearsExperience` blank but work dates are present, estimate it in app code from extracted work dates before filling the form
- Ask Gemini to put role bullets, achievements, duties, and summaries into `workExperience[].responsibilities`
- If Gemini leaves a role's `responsibilities` blank, recover likely responsibility lines from the raw resume text around the matched company/job-title block before filling the form
- Normalize extracted `linkedinUrl` and `portfolioUrl` to absolute `https://` URLs before they reach profile `type="url"` inputs; discard non-URL placeholder text instead of blocking Save Profile
- Provider quota/auth failures must be converted into safe user-facing `ResumeExtractionProviderError` messages

---

## PostHog

**Check first:** Check AGENTS.md for an installed PostHog skill. If a PostHog MCP server is configured — use it. The skill/MCP will have the latest client and server patterns.

### Client Setup (Browser)

```typescript
// lib/posthog-client.ts
import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      capture_pageview: false, // manual pageview tracking
    });
  }
}

// Capture event client-side
posthog.capture("job_found", {
  userId,
  source: "search",
  matchScore: score,
});
```

### Server Setup

```typescript
// lib/posthog-server.ts
import { PostHog } from "posthog-node";

export const createPostHogServer = () =>
  new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    flushAt: 1, // send immediately
    flushInterval: 0, // no batching — Next.js functions are short-lived
  });

// Always use and shutdown in the same function
const posthog = createPostHogServer();
posthog.capture({
  distinctId: userId,
  event: "company_researched",
  properties: { userId, jobId, company },
});
await posthog.shutdown(); // required — ensures event is sent
```

**Rules:**

- Always call `await posthog.shutdown()` in server-side functions — events are lost without it
- `flushAt: 1` and `flushInterval: 0` always set on server client
- Event names must match exactly the list in `code-standards.md`
- Always include `userId` as a property on every server-side event
- Call `posthog.identify(userId)` after login on client side
- Call `posthog.reset()` on logout on client side

---

## Recharts

Recharts is used only for dashboard analytics chart rendering.

**Rules:**

- Keep Recharts components inside focused Client Components because responsive chart measurement runs in the browser.
- Load and shape analytics data server-side in `lib/` helpers, then pass typed arrays into chart components.
- Use project CSS variables for Recharts colors, for example `stroke="var(--color-accent)"`; never use raw hex values or Tailwind built-in color classes.
- Keep the dashboard card shell in `ChartFrame`; Recharts owns only the chart internals.
- Show the dashboard chart empty state when all values are zero; never fall back to mock chart data.

---

## @react-pdf/renderer

**Check first:** Check AGENTS.md for an installed react-pdf skill. PDF generation APIs can differ from general training knowledge.

### Resume PDF Generation

```typescript
import { renderToBuffer } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  section: { marginBottom: 10 },
  heading: { fontSize: 14, fontWeight: 'bold' },
  text: { fontSize: 10 },
})

const ResumePDF = ({ profile }: { profile: Profile }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.heading}>{profile.fullName}</Text>
        <Text style={styles.text}>{profile.email}</Text>
      </View>
    </Page>
  </Document>
)

// Generate buffer
const buffer = await renderToBuffer(<ResumePDF profile={profile} />)

// Upload directly to InsForge Storage.
// The current SDK auto-renames existing objects, so delete known active-resume
// paths first and then upload the generated PDF to the canonical path.
await Promise.all(
  getUserResumeStoragePaths(userId).map((path) =>
    insforge.storage.from('resumes').remove(path),
  ),
)

const pdfBlob = new Blob([new Uint8Array(buffer)], {
  type: 'application/pdf',
})

const { data, error } = await insforge.storage
  .from('resumes')
  .upload(`${userId}/resume.pdf`, pdfBlob)
```

**Supported CSS properties:**
Only use these — others are silently ignored:
`padding, margin, fontSize, color, fontFamily, flexDirection, alignItems, justifyContent, borderRadius, width, height, fontWeight, textAlign, lineHeight`

**Rules:**

- Server-side only — never import in client components
- Always use `renderToBuffer` — not `renderToStream` or `PDFDownloadLink`
- PDF generation only in `app/api/resume/` routes
- Generated buffer uploaded directly to InsForge Storage — never written to disk
- Always save public URL to DB after upload
- Use the shared `replaceUserResume()` storage helper so generated resumes and uploaded resumes follow the same one-active-resume rule
- Use the shared `removeUserResume()` storage helper for explicit resume removal, then clear `profiles.resume_pdf_url`
- Generate polished resume content from the saved profile row before rendering the PDF
- Keep generated PDFs resume-like rather than app-like: clean header, contact split across readable lines, summary, skills, experience, and education only
- Do not render job preferences, remote preference, salary expectation, cover letter tone, or work authorization in generated resumes
- Prompt resume generation to avoid invented metrics, revenue, user counts, performance numbers, or business impact unless those facts are present in the saved profile
- Prefer `OPENROUTER_API_KEY` with OpenRouter model `openai/gpt-4o`; if that key is absent in local development, the existing Gemini REST path may be used as a fallback
- When using Gemini for resume generation, try `gemini-2.5-flash` first and fall back to `gemini-2.5-flash-lite` on provider or temporary availability failures such as `503 UNAVAILABLE`
- The generated PDF replaces the active `profiles.resume_pdf_url`; it does not mutate any other profile fields

---

## pdf2json

**Check first:** Check AGENTS.md for an installed pdf2json skill.

### Extract Text from Uploaded Resume

```typescript
import PDFParser from "pdf2json";

function extractTextFromPdf(pdfBuffer: Uint8Array): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser(null, true);

    parser.on("pdfParser_dataError", (errData) => {
      parser.destroy();
      reject(errData instanceof Error ? errData : errData.parserError);
    });

    parser.on("pdfParser_dataReady", () => {
      const extractedText = parser.getRawTextContent();
      parser.destroy();
      resolve(extractedText);
    });

    parser.parseBuffer(Buffer.from(pdfBuffer), 0);
  });
}
```

**Rules:**

- Server-side only — never import in client components
- `getRawTextContent()` is raw unformatted text — Gemini handles the structure extraction
- Use `parseBuffer()` for uploaded files and private storage downloads; never write resume files to disk for parsing
- Destroy parser instances after success or failure
- Always handle parse errors — some PDFs are image-based and return empty text
- If extracted text is empty or very short — return error to user: "Could not extract text from this PDF. Please try a different file."

---

## Motion for React

**Package:** `motion`
**Import path:** `motion/react`
**Official docs:** https://motion.dev/docs/react

Use Motion for focused client-side interaction states where CSS transitions are not expressive enough, such as enter/exit transitions, progress-state changes, and animated multistep feedback. Keep animations tied to state and scoped to client components.

```typescript
"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
```

**Rules:**

- Import React animation APIs from `motion/react`, not `framer-motion`.
- Use Motion only in `"use client"` components.
- Prefer `AnimatePresence` for loading/content swaps and small `motion.div` transitions for progress/state changes.
- Always check `useReducedMotion()` for looping or decorative motion, and disable or shorten animation when users prefer reduced motion.
- Keep all colors in Tailwind token classes or CSS variables; do not animate raw hex colors.
- Use Motion to clarify state, not as decoration. Long-running actions should show concrete step labels and progress cues.
