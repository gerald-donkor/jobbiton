import { z } from "zod";
import type { WorkExperienceEntry } from "@/lib/profile";
import { logAgentMessage } from "@/lib/agent-logs";
import { createBrowserbaseResearchSession } from "@/lib/browserbase";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createResearchStagehand } from "@/lib/stagehand";
import type { CompanyResearchDossier } from "@/agent/types";

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"] as const;

const rootDomainParts = new Set([
  "co",
  "com",
  "edu",
  "gov",
  "net",
  "org",
]);

const blockedSourceDomains = [
  "adzuna.",
  "greenhouse.io",
  "lever.co",
  "workable.com",
  "smartrecruiters.com",
  "ashbyhq.com",
  "bamboohr.com",
  "indeed.com",
  "linkedin.com",
  "ziprecruiter.com",
];

const pageLinkSchema = z.object({
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
});

const homepageResearchSchema = z.object({
  oneLiner: z.string().default(""),
  productSummary: z.string().default(""),
  signals: z.array(z.string()).default([]),
  pageLinks: z.array(pageLinkSchema).default([]),
});

const subPageResearchSchema = z.object({
  keyPoints: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  valuesOrCulture: z.array(z.string()).default([]),
  notable: z.array(z.string()).default([]),
});

const companyResearchDossierSchema = z.object({
  companyOverview: z.string(),
  techStack: z.array(z.string()),
  culture: z.array(z.string()),
  whyThisRole: z.string(),
  yourEdge: z.array(z.string()),
  gapsToAddress: z.array(z.string()),
  smartQuestions: z.array(z.string()),
  interviewPrep: z.array(z.string()),
  sources: z.array(z.string()),
});

const openRouterResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string().nullable(),
      }),
    }),
  ),
});

const geminiResponseSchema = z.object({
  candidates: z
    .array(
      z.object({
        content: z
          .object({
            parts: z
              .array(
                z.object({
                  text: z.string().optional(),
                }),
              )
              .optional(),
          })
          .optional(),
      }),
    )
    .optional(),
});

const geminiErrorSchema = z.object({
  error: z
    .object({
      code: z.number().optional(),
      message: z.string().optional(),
      status: z.string().optional(),
    })
    .optional(),
});

const companyResearchJsonSchema = {
  type: "object",
  properties: {
    companyOverview: { type: "string" },
    techStack: { type: "array", items: { type: "string" } },
    culture: { type: "array", items: { type: "string" } },
    whyThisRole: { type: "string" },
    yourEdge: { type: "array", items: { type: "string" } },
    gapsToAddress: { type: "array", items: { type: "string" } },
    smartQuestions: { type: "array", items: { type: "string" } },
    interviewPrep: { type: "array", items: { type: "string" } },
    sources: { type: "array", items: { type: "string" } },
  },
  required: [
    "companyOverview",
    "techStack",
    "culture",
    "whyThisRole",
    "yourEdge",
    "gapsToAddress",
    "smartQuestions",
    "interviewPrep",
    "sources",
  ],
} satisfies Record<string, unknown>;

type ResearchJobRecord = {
  id: string;
  runId: string | null;
  title: string;
  company: string;
  aboutRole: string;
  matchedSkills: string[];
  missingSkills: string[];
  externalApplyUrl: string | null;
  sourceUrl: string | null;
};

type ResearchProfileRecord = {
  current_title: string | null;
  years_experience: number | null;
  experience_level: string | null;
  skills: string[];
  work_experience: WorkExperienceEntry[];
};

type CollectedCompanyResearch = {
  homepageUrl: string;
  homepage: z.infer<typeof homepageResearchSchema> | null;
  pages: Array<z.infer<typeof subPageResearchSchema> & { url: string }>;
  sources: string[];
};

type ResearchCompanyResult =
  | {
      success: true;
      dossier: CompanyResearchDossier;
      company: string;
    }
  | {
      success: false;
      error: string;
      statusCode?: number;
    };

function describeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      cause: error.cause,
    };
  }

  return { error };
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function mapJobRecord(row: unknown): ResearchJobRecord | null {
  const record = toRecord(row);

  if (!record) {
    return null;
  }

  const id = readString(record.id);
  const title = readString(record.title);
  const company = readString(record.company);

  if (!id || !title || !company) {
    return null;
  }

  return {
    id,
    title,
    company,
    runId: readString(record.run_id),
    aboutRole: readString(record.about_role) || "",
    matchedSkills: readStringArray(record.matched_skills),
    missingSkills: readStringArray(record.missing_skills),
    externalApplyUrl: readString(record.external_apply_url),
    sourceUrl: readString(record.source_url),
  };
}

function mapProfileRecord(row: unknown): ResearchProfileRecord | null {
  const record = toRecord(row);

  if (!record) {
    return null;
  }

  return {
    current_title: readString(record.current_title),
    years_experience: readNumber(record.years_experience),
    experience_level: readString(record.experience_level),
    skills: readStringArray(record.skills),
    work_experience: Array.isArray(record.work_experience)
      ? record.work_experience.filter(
          (value): value is WorkExperienceEntry =>
            Boolean(value) && typeof value === "object",
        )
      : [],
  };
}

async function loadResearchInputs({
  jobId,
  userId,
}: {
  jobId: string;
  userId: string;
}): Promise<{ job: ResearchJobRecord; profile: ResearchProfileRecord } | null> {
  const insforge = await createInsforgeServer();
  const { data: jobRow, error: jobError } = await insforge.database
    .from("jobs")
    .select(
      "id, run_id, title, company, about_role, matched_skills, missing_skills, external_apply_url, source_url",
    )
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (jobError) {
    console.error("[agent/research] Job lookup failed", jobError);
    return null;
  }

  const job = mapJobRecord(jobRow);

  if (!job) {
    return null;
  }

  const { data: profileRow, error: profileError } = await insforge.database
    .from("profiles")
    .select(
      "current_title, years_experience, experience_level, skills, work_experience",
    )
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("[agent/research] Profile lookup failed", profileError);
    return null;
  }

  const profile = mapProfileRecord(profileRow);

  if (!profile) {
    return null;
  }

  return { job, profile };
}

function getRootDomain(hostname: string): string {
  const parts = hostname
    .replace(/^www\./i, "")
    .split(".")
    .filter(Boolean);

  if (parts.length <= 2) {
    return parts.join(".");
  }

  const last = parts[parts.length - 1];
  const secondLast = parts[parts.length - 2];
  const thirdLast = parts[parts.length - 3];

  if (last.length === 2 && rootDomainParts.has(secondLast) && thirdLast) {
    return `${thirdLast}.${secondLast}.${last}`;
  }

  return `${secondLast}.${last}`;
}

async function resolveCompanyHomepage(job: ResearchJobRecord): Promise<string | null> {
  const redirectUrl = job.externalApplyUrl || job.sourceUrl;

  if (!redirectUrl) {
    return null;
  }

  try {
    const response = await fetch(redirectUrl, {
      cache: "no-store",
      redirect: "follow",
    });
    const resolvedUrl = new URL(response.url);

    if (isBlockedSourceDomain(resolvedUrl.hostname)) {
      return null;
    }

    return `https://${getRootDomain(resolvedUrl.hostname)}`;
  } catch (error) {
    console.error("[agent/research] Unable to resolve employer URL", error);
    return null;
  }
}

function normalizeInternalUrl(url: string, homepageUrl: string): string | null {
  try {
    const homepage = new URL(homepageUrl);
    const candidate = new URL(url, homepageUrl);

    if (getRootDomain(candidate.hostname) !== getRootDomain(homepage.hostname)) {
      return null;
    }

    return candidate.toString();
  } catch {
    return null;
  }
}

function normalizeSourceUrl(url: string): string | null {
  try {
    const sourceUrl = new URL(url);

    if (sourceUrl.protocol !== "http:" && sourceUrl.protocol !== "https:") {
      return null;
    }

    if (isBlockedSourceDomain(sourceUrl.hostname)) {
      return null;
    }

    return sourceUrl.toString();
  } catch {
    return null;
  }
}

function isBlockedSourceDomain(hostname: string): boolean {
  const normalizedHostname = hostname.replace(/^www\./i, "").toLowerCase();

  return blockedSourceDomains.some((domain) =>
    domain.endsWith(".")
      ? normalizedHostname.startsWith(domain)
      : normalizedHostname === domain || normalizedHostname.endsWith(`.${domain}`),
  );
}

function uniqueSourceUrls(values: string[]): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const value of values) {
    const url = normalizeSourceUrl(value);

    if (!url || seen.has(url)) {
      continue;
    }

    seen.add(url);
    urls.push(url);
  }

  return urls;
}

function selectResearchLinks(
  links: z.infer<typeof pageLinkSchema>[],
  homepageUrl: string,
): string[] {
  const rank: Record<z.infer<typeof pageLinkSchema>["kind"], number> = {
    about: 0,
    blog: 1,
    engineering: 2,
    product: 3,
    team: 4,
    careers: 5,
    other: 6,
  };
  const seen = new Set<string>();
  const normalized = links
    .map((link) => ({
      kind: link.kind,
      url: normalizeInternalUrl(link.url, homepageUrl),
    }))
    .filter((link): link is { kind: z.infer<typeof pageLinkSchema>["kind"]; url: string } =>
      Boolean(link.url),
    )
    .sort((left, right) => rank[left.kind] - rank[right.kind]);
  const selected: string[] = [];

  for (const link of normalized) {
    if (seen.has(link.url) || link.url === homepageUrl) {
      continue;
    }

    seen.add(link.url);
    selected.push(link.url);

    if (selected.length === 3) {
      break;
    }
  }

  return selected;
}

async function collectCompanyResearch({
  homepageUrl,
  job,
  userId,
}: {
  homepageUrl: string;
  job: ResearchJobRecord;
  userId: string;
}): Promise<CollectedCompanyResearch> {
  let stagehand: ReturnType<typeof createResearchStagehand> | null = null;
  const emptyResearch: CollectedCompanyResearch = {
    homepageUrl,
    homepage: null,
    pages: [],
    sources: [],
  };

  try {
    const session = await createBrowserbaseResearchSession();
    stagehand = createResearchStagehand({ sessionId: session.id });
    await stagehand.init();

    const page = stagehand.context.activePage() ?? (await stagehand.context.newPage());
    await page.goto(homepageUrl, { waitUntil: "load", timeoutMs: 30000 });

    const homepage = homepageResearchSchema.parse(
      await stagehand.extract(
        "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
        homepageResearchSchema,
        { timeout: 30000 },
      ),
    );

    if (!homepage.oneLiner.trim() && !homepage.productSummary.trim()) {
      if (job.runId) {
        await logAgentMessage({
          jobId: job.id,
          level: "warning",
          message: `Company research found thin homepage content for ${job.company}.`,
          runId: job.runId,
          userId,
        });
      }

      return {
        ...emptyResearch,
        homepage,
        sources: [homepageUrl],
      };
    }

    const links = selectResearchLinks(homepage.pageLinks, homepageUrl);
    const pages: CollectedCompanyResearch["pages"] = [];

    for (const link of links) {
      try {
        await page.goto(link, { waitUntil: "load", timeoutMs: 30000 });
        const researchPage = subPageResearchSchema.parse(
          await stagehand.extract(
            "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
            subPageResearchSchema,
            { timeout: 30000 },
          ),
        );

        pages.push({ ...researchPage, url: link });
      } catch (error) {
        console.error("[agent/research] Sub-page extraction failed", {
          link,
          ...describeError(error),
        });

        if (job.runId) {
          await logAgentMessage({
            jobId: job.id,
            level: "warning",
            message: `Company research could not extract ${link}.`,
            runId: job.runId,
            userId,
          });
        }
      }
    }

    return {
      homepageUrl,
      homepage,
      pages,
      sources: [homepageUrl, ...pages.map((item) => item.url)],
    };
  } catch (error) {
    console.error("[agent/research] Browser research failed", describeError(error));

    if (job.runId) {
      await logAgentMessage({
        jobId: job.id,
        level: "warning",
        message: `Browser research failed for ${job.company}; continuing with job and profile data.`,
        runId: job.runId,
        userId,
      });
    }

    return emptyResearch;
  } finally {
    if (stagehand) {
      try {
        await stagehand.close({ force: true });
      } catch (error) {
        console.warn("[agent/research] Failed to close Stagehand session", describeError(error));
      }
    }
  }
}

function getResearchPrompt({
  companyResearch,
  job,
  profile,
}: {
  companyResearch: CollectedCompanyResearch;
  job: ResearchJobRecord;
  profile: ResearchProfileRecord;
}): string {
  return `COMPANY RESEARCH (from their website):
${JSON.stringify(companyResearch)}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description: ${job.aboutRole}
Matched skills (already computed): ${job.matchedSkills.join(", ")}
Missing skills (already computed): ${job.missingSkills.join(", ")}

CANDIDATE PROFILE:
Current title: ${profile.current_title ?? ""}
Experience: ${profile.years_experience ?? ""} years, level ${
    profile.experience_level ?? ""
  }
Skills: ${profile.skills.join(", ")}
Work history: ${JSON.stringify(profile.work_experience)}`;
}

function getResearchSystemPrompt(): string {
  return `You are a sharp career strategist preparing a candidate to apply for a specific role.
You are given (a) research collected from the company's own website, (b) the job posting,
and (c) the candidate's profile. Produce a concise, concrete briefing that gives this
specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts. If research was thin, infer carefully from the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind of detail that signals the candidate did their homework.
- The sources array must contain only absolute http(s) URLs from COMPANY RESEARCH sources. Do not put source names, company names, page titles, or relative paths in sources.
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
}

function normalizeDossierSources(
  dossier: CompanyResearchDossier,
  companyResearch: CollectedCompanyResearch,
): CompanyResearchDossier {
  const availableSources = uniqueSourceUrls([
    companyResearch.homepageUrl,
    ...companyResearch.sources,
  ]);
  const allowedSources = new Set(availableSources);
  const modelSources = uniqueSourceUrls(dossier.sources).filter((source) =>
    allowedSources.has(source),
  );

  return {
    ...dossier,
    sources: modelSources.length > 0 ? modelSources : availableSources,
  };
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  return JSON.parse(text);
}

function parseJsonObject(text: string): unknown {
  const trimmedText = text.trim();
  const startIndex = trimmedText.indexOf("{");
  const endIndex = trimmedText.lastIndexOf("}");

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error("Provider response did not contain a JSON object.");
  }

  return JSON.parse(trimmedText.slice(startIndex, endIndex + 1));
}

async function synthesizeWithOpenRouter({
  companyResearch,
  job,
  profile,
}: {
  companyResearch: CollectedCompanyResearch;
  job: ResearchJobRecord;
  profile: ResearchProfileRecord;
}): Promise<CompanyResearchDossier> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OpenRouter API key is missing.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://jobbiton.local",
      "X-Title": "Jobbiton",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.4,
      messages: [
        { role: "system", content: getResearchSystemPrompt() },
        { role: "user", content: getResearchPrompt({ companyResearch, job, profile }) },
      ],
    }),
  });
  const json = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status}`);
  }

  const content = openRouterResponseSchema.parse(json).choices[0]?.message.content;

  if (!content) {
    throw new Error("OpenRouter response did not include research content.");
  }

  return companyResearchDossierSchema.parse(parseJsonObject(content));
}

async function synthesizeWithGeminiModel({
  companyResearch,
  job,
  model,
  profile,
}: {
  companyResearch: CollectedCompanyResearch;
  job: ResearchJobRecord;
  model: (typeof GEMINI_MODELS)[number];
  profile: ResearchProfileRecord;
}): Promise<CompanyResearchDossier> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is missing.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: getResearchSystemPrompt() }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: getResearchPrompt({ companyResearch, job, profile }) }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
          responseJsonSchema: companyResearchJsonSchema,
          temperature: 0.4,
        },
      }),
    },
  );
  const json = await readJsonResponse(response);

  if (!response.ok) {
    const errorResult = geminiErrorSchema.safeParse(json);
    const message =
      errorResult.success && errorResult.data.error?.message
        ? errorResult.data.error.message
        : `Gemini error: ${response.status}`;

    throw new Error(message);
  }

  const result = geminiResponseSchema.safeParse(json);
  const content = result.success
    ? result.data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
    : "";

  if (!content) {
    throw new Error("Gemini response did not include research content.");
  }

  return companyResearchDossierSchema.parse(parseJsonObject(content));
}

async function synthesizeWithGemini({
  companyResearch,
  job,
  profile,
}: {
  companyResearch: CollectedCompanyResearch;
  job: ResearchJobRecord;
  profile: ResearchProfileRecord;
}): Promise<CompanyResearchDossier> {
  let lastError: unknown = null;

  for (const model of GEMINI_MODELS) {
    try {
      return await synthesizeWithGeminiModel({
        companyResearch,
        job,
        model,
        profile,
      });
    } catch (error) {
      lastError = error;
      console.error("[agent/research] Gemini synthesis failed", {
        model,
        ...describeError(error),
      });
    }
  }

  throw lastError;
}

async function synthesizeDossier({
  companyResearch,
  job,
  profile,
}: {
  companyResearch: CollectedCompanyResearch;
  job: ResearchJobRecord;
  profile: ResearchProfileRecord;
}): Promise<CompanyResearchDossier> {
  const providerErrors: unknown[] = [];

  if (process.env.OPENROUTER_API_KEY) {
    try {
      const dossier = await synthesizeWithOpenRouter({ companyResearch, job, profile });
      return normalizeDossierSources(dossier, companyResearch);
    } catch (error) {
      providerErrors.push(error);
      console.error("[agent/research] OpenRouter synthesis failed", describeError(error));
    }
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const dossier = await synthesizeWithGemini({ companyResearch, job, profile });
      return normalizeDossierSources(dossier, companyResearch);
    } catch (error) {
      providerErrors.push(error);
    }
  }

  if (providerErrors.length > 0) {
    throw providerErrors[providerErrors.length - 1];
  }

  throw new Error("Company research AI is not configured.");
}

export async function researchCompanyForUser({
  jobId,
  userId,
}: {
  jobId: string;
  userId: string;
}): Promise<ResearchCompanyResult> {
  try {
    if (!process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY) {
      return {
        success: false,
        error: "Company research AI is not configured.",
        statusCode: 500,
      };
    }

    const inputs = await loadResearchInputs({ jobId, userId });

    if (!inputs) {
      return {
        success: false,
        error: "We could not find that job for your account.",
        statusCode: 404,
      };
    }

    const { job, profile } = inputs;
    const homepageUrl = await resolveCompanyHomepage(job);

    if (job.runId) {
      await logAgentMessage({
        jobId: job.id,
        level: "info",
        message: `Started company research for ${job.company}.`,
        runId: job.runId,
        userId,
      });
    }

    const companyResearch = homepageUrl
      ? await collectCompanyResearch({
          homepageUrl,
          job,
          userId,
        })
      : {
          homepageUrl: "",
          homepage: null,
          pages: [],
          sources: [],
        };
    const dossier = await synthesizeDossier({
      companyResearch,
      job,
      profile,
    });
    const insforge = await createInsforgeServer();
    const { error } = await insforge.database
      .from("jobs")
      .update({ company_research: dossier })
      .eq("id", job.id)
      .eq("user_id", userId);

    if (error) {
      console.error("[agent/research] Unable to save dossier", error);
      return {
        success: false,
        error: "We researched the company but could not save the dossier.",
      };
    }

    if (job.runId) {
      await logAgentMessage({
        jobId: job.id,
        level: "success",
        message: `Completed company research for ${job.company}.`,
        runId: job.runId,
        userId,
      });
    }

    return {
      success: true,
      dossier,
      company: job.company,
    };
  } catch (error) {
    console.error("[agent/research]", describeError(error));

    return {
      success: false,
      error: "We could not complete company research right now.",
    };
  }
}
