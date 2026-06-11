import { z } from "zod";
import {
  emptyWorkExperience,
  uniqueList,
  type Education,
  type ProfileValues,
  type WorkExperienceEntry,
} from "@/lib/profile";

export type ResumeProfileExtraction = Omit<
  ProfileValues,
  "id" | "resumePdfUrl" | "isComplete"
>;

export class ResumeExtractionProviderError extends Error {
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
    this.name = "ResumeExtractionProviderError";
    this.statusCode = statusCode;
    this.userMessage = userMessage;
  }
}

const workExperienceSchema = z.object({
  companyName: z.string(),
  jobTitle: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  currentlyWorking: z.boolean(),
  responsibilities: z.string(),
});

const educationSchema = z.object({
  highestDegree: z.enum(["", "high_school", "bachelors", "masters", "doctorate"]),
  fieldOfStudy: z.string(),
  institutionName: z.string(),
  graduationYear: z.string(),
});

const extractionSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  currentTitle: z.string(),
  experienceLevel: z.enum(["", "junior", "mid", "senior", "lead"]),
  yearsExperience: z.union([z.string(), z.number()]).transform(String),
  skills: z.array(z.string()),
  industries: z.array(z.string()),
  workExperience: z.array(workExperienceSchema).max(3),
  education: educationSchema,
  jobTitlesSeeking: z.array(z.string()),
  remotePreference: z.enum(["", "remote", "onsite", "hybrid", "any"]),
  preferredLocations: z.array(z.string()),
  salaryExpectation: z.string(),
  coverLetterTone: z.enum(["", "formal", "casual", "enthusiastic"]),
  linkedinUrl: z.string(),
  portfolioUrl: z.string(),
  workAuthorization: z.enum(["", "citizen", "permanent_resident", "visa_required"]),
});

const emptyEducation: Education = {
  highestDegree: "",
  fieldOfStudy: "",
  institutionName: "",
  graduationYear: "",
};

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"] as const;
const GEMINI_MAX_OUTPUT_TOKENS = 4096;

function getGeminiApiUrl(model: (typeof GEMINI_MODELS)[number]): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

const geminiErrorSchema = z.object({
  error: z
    .object({
      code: z.number().optional(),
      message: z.string().optional(),
      status: z.string().optional(),
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
        finishReason: z.string().optional(),
      }),
    )
    .optional(),
});

const profileExtractionJsonSchema = {
  type: "object",
  properties: {
    fullName: { type: "string" },
    email: { type: "string" },
    phone: { type: "string" },
    location: { type: "string" },
    currentTitle: { type: "string" },
    experienceLevel: {
      type: "string",
      enum: ["", "junior", "mid", "senior", "lead"],
    },
    yearsExperience: { type: "string" },
    skills: { type: "array", items: { type: "string" } },
    industries: { type: "array", items: { type: "string" } },
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
          responsibilities: { type: "string" },
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
        highestDegree: {
          type: "string",
          enum: ["", "high_school", "bachelors", "masters", "doctorate"],
        },
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
    jobTitlesSeeking: { type: "array", items: { type: "string" } },
    remotePreference: {
      type: "string",
      enum: ["", "remote", "onsite", "hybrid", "any"],
    },
    preferredLocations: { type: "array", items: { type: "string" } },
    salaryExpectation: { type: "string" },
    coverLetterTone: {
      type: "string",
      enum: ["", "formal", "casual", "enthusiastic"],
    },
    linkedinUrl: { type: "string" },
    portfolioUrl: { type: "string" },
    workAuthorization: {
      type: "string",
      enum: ["", "citizen", "permanent_resident", "visa_required"],
    },
  },
  required: [
    "fullName",
    "email",
    "phone",
    "location",
    "currentTitle",
    "experienceLevel",
    "yearsExperience",
    "skills",
    "industries",
    "workExperience",
    "education",
    "jobTitlesSeeking",
    "remotePreference",
    "preferredLocations",
    "salaryExpectation",
    "coverLetterTone",
    "linkedinUrl",
    "portfolioUrl",
    "workAuthorization",
  ],
} satisfies Record<string, unknown>;

const systemInstruction =
  "You extract profile data from developer resumes. Return exactly one raw JSON object and nothing else. The first character must be { and the last character must be }. Use empty strings or empty arrays when the resume does not contain a value. Do not invent facts.";

function cleanString(value: string): string {
  return value.trim();
}

function cleanYearsExperience(value: string): string {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  const numberMatch = trimmedValue.match(/\d+/);

  return numberMatch?.[0] ?? "";
}

function cleanProfileUrl(value: string): string {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  const withoutLeadingAt = trimmedValue.replace(/^@/, "");
  const normalizedValue = withoutLeadingAt.replace(/^www\./i, "");
  const looksLikeUrl =
    /^[a-z0-9.-]+\.[a-z]{2,}(?:[/?#:].*)?$/i.test(normalizedValue) ||
    /^(github|linkedin)\.com\//i.test(normalizedValue);

  return looksLikeUrl ? `https://${normalizedValue}` : "";
}

function cleanWorkExperience(
  entries: WorkExperienceEntry[],
): WorkExperienceEntry[] {
  const cleanedEntries = entries
    .slice(0, 3)
    .map((entry) => ({
      companyName: cleanString(entry.companyName),
      jobTitle: cleanString(entry.jobTitle),
      startDate: cleanString(entry.startDate),
      endDate: cleanString(entry.endDate),
      currentlyWorking: entry.currentlyWorking,
      responsibilities: cleanString(entry.responsibilities),
    }))
    .filter(
      (entry) => entry.companyName || entry.jobTitle || entry.responsibilities,
    );

  return cleanedEntries.length > 0 ? cleanedEntries : [emptyWorkExperience];
}

function getResumeTextLines(resumeText: string): string[] {
  return resumeText
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function stripBulletMarker(value: string): string {
  return value.replace(/^[\-*•●▪◦–—]\s*/, "").trim();
}

function isResumeSectionHeading(value: string): boolean {
  const normalizedValue = normalizeSearchText(value);

  return /^(summary|profile|professional summary|experience|work experience|employment|education|skills|technical skills|projects|certifications|awards|languages|references)$/.test(
    normalizedValue,
  );
}

function hasDateOnlyContent(value: string): boolean {
  return /^[a-z]{3,9}\s+\d{4}\s*(-|to|–|—)\s*([a-z]{3,9}\s+\d{4}|present|current)|^\d{4}\s*(-|to|–|—)\s*(\d{4}|present|current)$/i.test(
    value,
  );
}

function hasContactContent(value: string): boolean {
  return /@|https?:\/\/|www\.|linkedin\.com|github\.com/i.test(value);
}

function hasResponsibilityVerb(value: string): boolean {
  return /\b(achieved|administered|architected|automated|built|collaborated|configured|created|delivered|designed|developed|drove|enhanced|implemented|improved|increased|integrated|led|maintained|managed|migrated|optimized|owned|partnered|reduced|resolved|scaled|shipped|supported|tested|trained|worked)\b/i.test(
    value,
  );
}

function isLikelyResponsibilityLine(value: string): boolean {
  const strippedValue = stripBulletMarker(value);
  const wordCount = strippedValue.split(/\s+/).filter(Boolean).length;

  if (
    wordCount < 4 ||
    isResumeSectionHeading(strippedValue) ||
    hasDateOnlyContent(strippedValue) ||
    hasContactContent(strippedValue)
  ) {
    return false;
  }

  return /^[\-*•●▪◦–—]\s*/.test(value) || hasResponsibilityVerb(strippedValue);
}

function findWorkExperienceAnchorIndex(
  lines: string[],
  entry: WorkExperienceEntry,
): number {
  const anchors = [entry.companyName, entry.jobTitle]
    .map(normalizeSearchText)
    .filter((anchor) => anchor.length >= 3);

  if (anchors.length === 0) {
    return -1;
  }

  return lines.findIndex((line) => {
    const normalizedLine = normalizeSearchText(line);

    return anchors.some((anchor) => normalizedLine.includes(anchor));
  });
}

function lineDescribesWorkEntry(
  line: string,
  entry: WorkExperienceEntry,
): boolean {
  const normalizedLine = normalizeSearchText(line);
  const anchors = [entry.companyName, entry.jobTitle, entry.startDate, entry.endDate]
    .map(normalizeSearchText)
    .filter((anchor) => anchor.length >= 3);

  return anchors.some((anchor) => normalizedLine.includes(anchor));
}

function extractResponsibilityLinesFromBlock(
  lines: string[],
  entry: WorkExperienceEntry,
): string[] {
  return uniqueList(
    lines
      .filter((line) => !lineDescribesWorkEntry(line, entry))
      .filter(isLikelyResponsibilityLine)
      .map(stripBulletMarker),
  ).slice(0, 5);
}

function extractResponsibilitiesForEntry({
  anchorIndex,
  entry,
  lines,
  nextAnchorIndex,
}: {
  anchorIndex: number;
  entry: WorkExperienceEntry;
  lines: string[];
  nextAnchorIndex: number;
}): string {
  if (anchorIndex < 0) {
    return "";
  }

  const nextSectionIndex = lines.findIndex(
    (line, index) => index > anchorIndex && isResumeSectionHeading(line),
  );
  const blockEnd = Math.min(
    nextAnchorIndex > anchorIndex ? nextAnchorIndex : lines.length,
    nextSectionIndex > anchorIndex ? nextSectionIndex : lines.length,
  );
  const responsibilityLines = extractResponsibilityLinesFromBlock(
    lines.slice(anchorIndex + 1, blockEnd),
    entry,
  );

  return responsibilityLines.join("\n");
}

function extractResumeWideResponsibilities(lines: string[]): string {
  return uniqueList(lines.filter(isLikelyResponsibilityLine).map(stripBulletMarker))
    .slice(0, 5)
    .join("\n");
}

function fillMissingResponsibilities(
  entries: WorkExperienceEntry[],
  resumeText: string,
): WorkExperienceEntry[] {
  const lines = getResumeTextLines(resumeText);

  if (lines.length === 0) {
    return entries;
  }

  const anchorIndexes = entries.map((entry) =>
    findWorkExperienceAnchorIndex(lines, entry),
  );

  return entries.map((entry, index) => {
    if (entry.responsibilities.trim()) {
      return entry;
    }

    const fallbackResponsibilities =
      extractResponsibilitiesForEntry({
        anchorIndex: anchorIndexes[index] ?? -1,
        entry,
        lines,
        nextAnchorIndex:
          anchorIndexes.find((anchorIndex) => anchorIndex > anchorIndexes[index]) ??
          lines.length,
      }) || (entries.length === 1 ? extractResumeWideResponsibilities(lines) : "");

    return fallbackResponsibilities
      ? { ...entry, responsibilities: fallbackResponsibilities }
      : entry;
  });
}

function getYearFromText(value: string): number | null {
  const match = value.match(/\b(19\d{2}|20\d{2})\b/);

  if (!match) {
    return null;
  }

  return Number(match[1]);
}

function isCurrentDateLabel(value: string): boolean {
  return /\b(current|present|now)\b/i.test(value);
}

function estimateYearsExperience(entries: WorkExperienceEntry[]): string {
  let earliestStartYear: number | null = null;
  let latestEndYear: number | null = null;

  for (const entry of entries) {
    const startYear = getYearFromText(entry.startDate);
    const endYear =
      entry.currentlyWorking || isCurrentDateLabel(entry.endDate)
        ? new Date().getFullYear()
        : getYearFromText(entry.endDate);

    if (startYear !== null) {
      earliestStartYear =
        earliestStartYear === null
          ? startYear
          : Math.min(earliestStartYear, startYear);
    }

    if (endYear !== null) {
      latestEndYear =
        latestEndYear === null ? endYear : Math.max(latestEndYear, endYear);
    }
  }

  if (
    earliestStartYear === null ||
    latestEndYear === null ||
    latestEndYear < earliestStartYear
  ) {
    return "";
  }

  return String(Math.max(1, latestEndYear - earliestStartYear));
}

function normalizeExtraction(
  extraction: z.infer<typeof extractionSchema>,
  resumeText: string,
): ResumeProfileExtraction {
  const workExperience = fillMissingResponsibilities(
    cleanWorkExperience(extraction.workExperience),
    resumeText,
  );
  const yearsExperience =
    cleanYearsExperience(extraction.yearsExperience) ||
    estimateYearsExperience(workExperience);

  return {
    fullName: cleanString(extraction.fullName),
    email: cleanString(extraction.email),
    phone: cleanString(extraction.phone),
    location: cleanString(extraction.location),
    currentTitle: cleanString(extraction.currentTitle),
    experienceLevel: extraction.experienceLevel,
    yearsExperience,
    skills: uniqueList(extraction.skills),
    industries: uniqueList(extraction.industries),
    workExperience,
    education: {
      highestDegree: extraction.education.highestDegree,
      fieldOfStudy: cleanString(extraction.education.fieldOfStudy),
      institutionName: cleanString(extraction.education.institutionName),
      graduationYear: cleanString(extraction.education.graduationYear),
    },
    jobTitlesSeeking: uniqueList(extraction.jobTitlesSeeking),
    remotePreference: extraction.remotePreference,
    preferredLocations: uniqueList(extraction.preferredLocations),
    salaryExpectation: cleanString(extraction.salaryExpectation),
    coverLetterTone: extraction.coverLetterTone,
    linkedinUrl: cleanProfileUrl(extraction.linkedinUrl),
    portfolioUrl: cleanProfileUrl(extraction.portfolioUrl),
    workAuthorization: extraction.workAuthorization,
  };
}

function parseJsonObject(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("Gemini response did not include JSON.");
    }

    return JSON.parse(match[0]);
  }
}

function createMissingGeminiKeyError(): ResumeExtractionProviderError {
  return new ResumeExtractionProviderError({
    cause: undefined,
    message: "Gemini API key is not configured.",
    statusCode: 500,
    userMessage:
      "Resume text was extracted, but Gemini is not configured. Add GEMINI_API_KEY to .env.local, then restart the dev server.",
  });
}

function createGeminiProviderError({
  cause,
  providerMessage,
  status,
}: {
  cause: unknown;
  providerMessage: string;
  status: number;
}): ResumeExtractionProviderError {
  if (status === 429) {
    return new ResumeExtractionProviderError({
      cause,
      message: "Gemini quota or rate limit was reached.",
      statusCode: 429,
      userMessage:
        "Resume text was extracted, but the configured Gemini API key has no available quota. Update the Gemini billing/quota for this key, then try again.",
    });
  }

  if (status === 401 || status === 403) {
    return new ResumeExtractionProviderError({
      cause,
      message: "Gemini authentication failed.",
      statusCode: 502,
      userMessage:
        "Resume text was extracted, but the configured Gemini API key could not be authorized.",
    });
  }

  return new ResumeExtractionProviderError({
    cause,
    message: `Gemini request failed: ${providerMessage}`,
    statusCode: 502,
    userMessage:
      "Resume text was extracted, but the AI extraction service is unavailable right now. Please try again shortly.",
  });
}

function createInvalidGeminiJsonError(cause: unknown): ResumeExtractionProviderError {
  return new ResumeExtractionProviderError({
    cause,
    message: "Gemini response did not include valid JSON.",
    statusCode: 502,
    userMessage:
      "Resume text was extracted, but the AI extraction service returned an invalid response. Please try again shortly.",
  });
}

function createGeminiPrompt(resumeText: string): string {
  return `Return exactly one valid JSON object and nothing else. Extract this resume into JSON with exactly these keys:
{
  "fullName": string,
  "email": string,
  "phone": string,
  "location": string,
  "currentTitle": string,
  "experienceLevel": "" | "junior" | "mid" | "senior" | "lead",
  "yearsExperience": string,
  "skills": string[],
  "industries": string[],
  "workExperience": [{"companyName": string, "jobTitle": string, "startDate": string, "endDate": string, "currentlyWorking": boolean, "responsibilities": string}],
  "education": {"highestDegree": "" | "high_school" | "bachelors" | "masters" | "doctorate", "fieldOfStudy": string, "institutionName": string, "graduationYear": string},
  "jobTitlesSeeking": string[],
  "remotePreference": "" | "remote" | "onsite" | "hybrid" | "any",
  "preferredLocations": string[],
  "salaryExpectation": string,
  "coverLetterTone": "" | "formal" | "casual" | "enthusiastic",
  "linkedinUrl": string,
  "portfolioUrl": string,
  "workAuthorization": "" | "citizen" | "permanent_resident" | "visa_required"
}

Rules:
- Keep workExperience to the 3 most relevant recent roles.
- Put resume bullets, achievements, duties, or role summaries into each role's responsibilities as readable plain text.
- If a workExperience role has bullets or descriptive details in the resume, never leave that role's responsibilities blank. Use 2 to 5 concise lines from the resume when available.
- Return yearsExperience as digits only, for example "5".
- Always fill yearsExperience when work dates are present. If the resume does not state a total, estimate total professional years from the earliest relevant work start year to the latest end year or present, rounded down to a whole-number string.
- Return linkedinUrl and portfolioUrl as full absolute URLs starting with https://. For example, use "https://github.com/name" instead of "github.com/name".
- Infer experienceLevel only from evidence in titles and years of experience.
- Map degrees to the allowed education values.
- Leave remotePreference, coverLetterTone, workAuthorization, salaryExpectation, and preferredLocations blank unless explicitly stated.

Resume text:
${resumeText}`;
}

async function readGeminiResponseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    throw new ResumeExtractionProviderError({
      cause: error,
      message: "Gemini response was not valid JSON.",
      statusCode: 502,
      userMessage:
        "Resume text was extracted, but the AI extraction service returned an unreadable response. Please try again shortly.",
    });
  }
}

function getGeminiText(json: unknown): string {
  const result = geminiResponseSchema.safeParse(json);

  if (!result.success) {
    throw new Error("Gemini response shape was invalid.");
  }

  return (
    result.data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

async function requestGeminiProfileExtraction({
  apiKey,
  model,
  resumeText,
}: {
  apiKey: string;
  model: (typeof GEMINI_MODELS)[number];
  resumeText: string;
}): Promise<{
  json: unknown;
  response: Response;
}> {
  const response = await fetch(getGeminiApiUrl(model), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: createGeminiPrompt(resumeText) }],
        },
      ],
      generationConfig: {
        maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
        responseMimeType: "application/json",
        responseJsonSchema: profileExtractionJsonSchema,
      },
    }),
  });

  const json = await readGeminiResponseJson(response);

  return { json, response };
}

async function createProfileExtractionContent(resumeText: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw createMissingGeminiKeyError();
  }

  let lastError: ResumeExtractionProviderError | null = null;

  for (const model of GEMINI_MODELS) {
    const { json, response } = await requestGeminiProfileExtraction({
      apiKey,
      model,
      resumeText,
    });

    if (!response.ok) {
      const errorResult = geminiErrorSchema.safeParse(json);
      const providerMessage =
        errorResult.success && errorResult.data.error?.message
          ? errorResult.data.error.message
          : response.statusText;

      lastError = createGeminiProviderError({
        cause: json,
        providerMessage,
        status: response.status,
      });
      continue;
    }

    const content = getGeminiText(json);

    try {
      parseJsonObject(content);
      return content;
    } catch (error) {
      lastError = createInvalidGeminiJsonError(error);
    }
  }

  throw (
    lastError ??
    createInvalidGeminiJsonError(new Error("Gemini did not return a response."))
  );
}

export async function extractProfileFromResumeText(
  resumeText: string,
): Promise<ResumeProfileExtraction> {
  const content = await createProfileExtractionContent(resumeText);

  if (!content) {
    throw new Error("Gemini response was empty.");
  }

  const parsed = parseJsonObject(content);
  const extraction = extractionSchema.parse(parsed);

  return normalizeExtraction(extraction, resumeText);
}

export function createEmptyResumeExtraction(): ResumeProfileExtraction {
  return {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    currentTitle: "",
    experienceLevel: "",
    yearsExperience: "",
    skills: [],
    industries: [],
    workExperience: [emptyWorkExperience],
    education: emptyEducation,
    jobTitlesSeeking: [],
    remotePreference: "",
    preferredLocations: [],
    salaryExpectation: "",
    coverLetterTone: "",
    linkedinUrl: "",
    portfolioUrl: "",
    workAuthorization: "",
  };
}
