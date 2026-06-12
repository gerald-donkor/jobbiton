import { z } from "zod";
import type { ProfileValues, WorkExperienceEntry } from "@/lib/profile";

const OPENROUTER_MODEL = "openai/gpt-4o";
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"] as const;
const MAX_RESUME_BULLETS = 4;

export class ResumeGenerationProviderError extends Error {
  readonly statusCode: number;
  readonly userMessage: string;

  constructor({
    cause,
    message,
    statusCode,
    userMessage,
  }: {
    cause: unknown;
    message: string;
    statusCode: number;
    userMessage: string;
  }) {
    super(message, { cause });
    this.name = "ResumeGenerationProviderError";
    this.statusCode = statusCode;
    this.userMessage = userMessage;
  }
}

const generatedWorkExperienceSchema = z.object({
  companyName: z.string(),
  jobTitle: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  currentlyWorking: z.boolean(),
  responsibilities: z.array(z.string()).max(MAX_RESUME_BULLETS),
});

const generatedEducationSchema = z.object({
  highestDegree: z.string(),
  fieldOfStudy: z.string(),
  institutionName: z.string(),
  graduationYear: z.string(),
});

const generatedResumeContentSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  skills: z.array(z.string()),
  workExperience: z.array(generatedWorkExperienceSchema).max(3),
  education: generatedEducationSchema,
});

export type GeneratedResumeContent = z.infer<typeof generatedResumeContentSchema>;

const generatedResumeJsonSchema = {
  type: "object",
  properties: {
    headline: { type: "string" },
    summary: { type: "string" },
    skills: { type: "array", items: { type: "string" } },
    workExperience: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          companyName: { type: "string" },
          jobTitle: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
          currentlyWorking: { type: "boolean" },
          responsibilities: {
            type: "array",
            maxItems: MAX_RESUME_BULLETS,
            items: { type: "string" },
          },
        },
        required: [
          "companyName",
          "jobTitle",
          "startDate",
          "endDate",
          "currentlyWorking",
          "responsibilities",
        ],
      },
    },
    education: {
      type: "object",
      properties: {
        highestDegree: { type: "string" },
        fieldOfStudy: { type: "string" },
        institutionName: { type: "string" },
        graduationYear: { type: "string" },
      },
      required: [
        "highestDegree",
        "fieldOfStudy",
        "institutionName",
        "graduationYear",
      ],
    },
  },
  required: ["headline", "summary", "skills", "workExperience", "education"],
} satisfies Record<string, unknown>;

const openRouterResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z
          .object({
            content: z.string().nullable().optional(),
          })
          .optional(),
      }),
    )
    .optional(),
});

const openRouterErrorSchema = z.object({
  error: z
    .object({
      message: z.string().optional(),
      code: z.union([z.string(), z.number()]).optional(),
    })
    .optional(),
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
      message: z.string().optional(),
      code: z.number().optional(),
      status: z.string().optional(),
    })
    .optional(),
});

const systemPrompt =
  "You are an expert technical resume writer. Rewrite the candidate's saved profile into concise, truthful, ATS-friendly resume content. Use only the facts provided. Do not invent employers, degrees, dates, metrics, technologies, responsibilities, revenue, user counts, performance numbers, or business impact. Return only valid JSON.";

function getUserPrompt(profile: ProfileValues): string {
  return `Create polished resume content from this saved profile.

Rules:
- Keep the headline short and specific to the current title.
- Write one professional summary paragraph in 35-55 words.
- Keep skills relevant and deduplicated; prefer the strongest technical skills over every possible keyword.
- Rewrite each role's responsibilities as clear resume bullets, preserving truth and context.
- Keep each bullet readable at 12-24 words when possible.
- Start bullets with action verbs.
- Do not add numbers, scale, revenue, percentages, performance improvements, or business impact unless explicitly present in the saved profile.
- Do not include job preferences, remote preference, salary expectation, cover letter tone, or work authorization in the resume content.
- Use at most ${MAX_RESUME_BULLETS} bullets per role.
- Keep empty fields as empty strings or empty arrays.

Saved profile:
${JSON.stringify(profile)}`;
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

function cleanString(value: string): string {
  return value.trim();
}

function cleanStringList(values: string[], fallback: string[]): string[] {
  const cleanedValues = values.map(cleanString).filter(Boolean);

  return cleanedValues.length > 0 ? Array.from(new Set(cleanedValues)) : fallback;
}

function splitResponsibilities(entry: WorkExperienceEntry): string[] {
  return entry.responsibilities
    .split(/\r?\n|(?<=\.)\s+(?=[A-Z])/)
    .map((responsibility) => responsibility.replace(/^[\-*•●▪◦–—]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, MAX_RESUME_BULLETS);
}

function normalizeGeneratedContent(
  profile: ProfileValues,
  content: GeneratedResumeContent,
): GeneratedResumeContent {
  const fallbackHeadline = profile.currentTitle || "Technical Professional";
  const fallbackSummary = [
    profile.currentTitle,
    profile.yearsExperience ? `${profile.yearsExperience} years of experience` : "",
    profile.skills.length > 0 ? `skilled in ${profile.skills.slice(0, 6).join(", ")}` : "",
  ]
    .filter(Boolean)
    .join(" with ");

  return {
    headline: cleanString(content.headline) || fallbackHeadline,
    summary:
      cleanString(content.summary) ||
      fallbackSummary ||
      "Experienced technical professional with a practical, delivery-focused background.",
    skills: cleanStringList(content.skills, profile.skills).slice(0, 18),
    workExperience: content.workExperience
      .map((entry, index) => {
        const fallbackEntry = profile.workExperience[index];
        return {
          companyName: cleanString(entry.companyName || fallbackEntry?.companyName || ""),
          jobTitle: cleanString(entry.jobTitle || fallbackEntry?.jobTitle || ""),
          startDate: cleanString(entry.startDate || fallbackEntry?.startDate || ""),
          endDate: cleanString(entry.endDate || fallbackEntry?.endDate || ""),
          currentlyWorking:
            entry.currentlyWorking || fallbackEntry?.currentlyWorking === true,
          responsibilities: cleanStringList(
            entry.responsibilities,
            fallbackEntry ? splitResponsibilities(fallbackEntry) : [],
          ).slice(0, MAX_RESUME_BULLETS),
        };
      })
      .filter(
        (entry) =>
          entry.companyName || entry.jobTitle || entry.responsibilities.length > 0,
      )
      .slice(0, 3),
    education: {
      highestDegree:
        cleanString(content.education.highestDegree) ||
        profile.education.highestDegree,
      fieldOfStudy:
        cleanString(content.education.fieldOfStudy) ||
        profile.education.fieldOfStudy,
      institutionName:
        cleanString(content.education.institutionName) ||
        profile.education.institutionName,
      graduationYear:
        cleanString(content.education.graduationYear) ||
        profile.education.graduationYear,
    },
  };
}

function providerErrorMessage(statusCode: number): string {
  if (statusCode === 401 || statusCode === 403) {
    return "Resume generation is not configured correctly. Check the AI API key and try again.";
  }

  if (statusCode === 402 || statusCode === 429) {
    return "The AI provider is out of available quota. Check the configured API key and try again.";
  }

  if (statusCode === 503) {
    return "The AI provider is temporarily busy. Please try again in a moment.";
  }

  return "We could not generate your resume content. Please try again.";
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  return JSON.parse(text);
}

async function generateWithOpenRouter(profile: ProfileValues): Promise<GeneratedResumeContent> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new ResumeGenerationProviderError({
      cause: null,
      message: "OpenRouter API key is missing.",
      statusCode: 500,
      userMessage:
        "Resume generation is not configured. Add OPENROUTER_API_KEY to .env.local, then restart the dev server.",
    });
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://jobpilot.local",
      "X-Title": "JobPilot",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      response_format: { type: "json_object" },
      temperature: 0.35,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: getUserPrompt(profile) },
      ],
    }),
  });
  const json = await readJsonResponse(response);

  if (!response.ok) {
    const errorResult = openRouterErrorSchema.safeParse(json);
    throw new ResumeGenerationProviderError({
      cause: json,
      message:
        errorResult.success && errorResult.data.error?.message
          ? errorResult.data.error.message
          : `OpenRouter request failed with status ${response.status}.`,
      statusCode: response.status,
      userMessage: providerErrorMessage(response.status),
    });
  }

  const result = openRouterResponseSchema.safeParse(json);
  const content = result.success
    ? result.data.choices?.[0]?.message?.content ?? ""
    : "";

  if (!content) {
    throw new Error("OpenRouter response did not include resume content.");
  }

  return generatedResumeContentSchema.parse(parseJsonObject(content));
}

async function generateWithGeminiModel({
  apiKey,
  model,
  profile,
}: {
  apiKey: string;
  model: (typeof GEMINI_MODELS)[number];
  profile: ProfileValues;
}): Promise<GeneratedResumeContent> {
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
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: getUserPrompt(profile) }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
          responseJsonSchema: generatedResumeJsonSchema,
          temperature: 0.35,
        },
      }),
    },
  );
  const json = await readJsonResponse(response);

  if (!response.ok) {
    const errorResult = geminiErrorSchema.safeParse(json);
    throw new ResumeGenerationProviderError({
      cause: json,
      message:
        errorResult.success && errorResult.data.error?.message
          ? errorResult.data.error.message
          : `Gemini request failed with status ${response.status}.`,
      statusCode: response.status,
      userMessage: providerErrorMessage(response.status),
    });
  }

  const result = geminiResponseSchema.safeParse(json);
  const content = result.success
    ? result.data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
    : "";

  if (!content) {
    throw new Error("Gemini response did not include resume content.");
  }

  return generatedResumeContentSchema.parse(parseJsonObject(content));
}

async function generateWithGemini(profile: ProfileValues): Promise<GeneratedResumeContent> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new ResumeGenerationProviderError({
      cause: null,
      message: "Gemini API key is missing.",
      statusCode: 500,
      userMessage:
        "Resume generation is not configured. Add OPENROUTER_API_KEY or GEMINI_API_KEY to .env.local, then restart the dev server.",
    });
  }

  let lastError: unknown = null;

  for (const model of GEMINI_MODELS) {
    try {
      return await generateWithGeminiModel({
        apiKey,
        model,
        profile,
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export async function generateResumeContent(
  profile: ProfileValues,
): Promise<GeneratedResumeContent> {
  const providerErrors: unknown[] = [];

  if (process.env.OPENROUTER_API_KEY) {
    try {
      const content = await generateWithOpenRouter(profile);
      return normalizeGeneratedContent(profile, content);
    } catch (error) {
      providerErrors.push(error);
    }
  }

  try {
    const content = await generateWithGemini(profile);
    return normalizeGeneratedContent(profile, content);
  } catch (error) {
    providerErrors.push(error);
  }

  const finalError = providerErrors[providerErrors.length - 1];

  if (finalError instanceof ResumeGenerationProviderError) {
    throw finalError;
  }

  throw new ResumeGenerationProviderError({
    cause: finalError,
    message: "All resume generation providers failed.",
    statusCode: 502,
    userMessage: "We could not generate your resume content. Please try again.",
  });
}
