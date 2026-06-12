import { z } from "zod";
import type { AdzunaJob } from "@/lib/adzuna";
import type { FindJobsProfile, JobMatchResult } from "@/agent/types";
import { clampNumber } from "@/lib/utils";

const openRouterResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string(),
      }),
    }),
  ),
});

const jobMatchSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  matchReason: z.string().min(1),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
});

const KNOWN_SKILLS = [
  "react",
  "react.js",
  "next.js",
  "nextjs",
  "typescript",
  "javascript",
  "node.js",
  "node",
  "tailwind",
  "tailwind css",
  "css",
  "html",
  "graphql",
  "rest",
  "rest api",
  "postgresql",
  "postgres",
  "sql",
  "mongodb",
  "redis",
  "aws",
  "docker",
  "kubernetes",
  "python",
  "java",
  "go",
  "rust",
  "figma",
  "design systems",
  "accessibility",
  "testing",
  "jest",
  "playwright",
  "cypress",
  "storybook",
  "redux",
  "react native",
  "vue",
  "angular",
  "svelte",
  "webpack",
  "vite",
  "ci/cd",
  "git",
  "api design",
] as const;

const SKILL_ALIASES: Record<string, string[]> = {
  "api design": ["api design", "api development", "api architecture"],
  "ci/cd": ["ci/cd", "ci cd", "continuous integration", "deployment pipeline"],
  css: ["css", "css3"],
  docker: ["docker", "containerization", "containers"],
  git: ["git", "github", "gitlab"],
  graphql: ["graphql", "graph ql"],
  html: ["html", "html5"],
  javascript: ["javascript", "js", "ecmascript"],
  mongodb: ["mongodb", "mongo"],
  "next.js": ["next.js", "nextjs", "next js"],
  "node.js": ["node.js", "nodejs", "node js", "node"],
  playwright: ["playwright"],
  postgresql: ["postgresql", "postgres", "postgres sql"],
  react: ["react", "react.js", "reactjs", "react js"],
  "react native": ["react native"],
  redis: ["redis"],
  rest: ["rest", "rest api", "restful", "restful api"],
  sql: ["sql"],
  tailwind: ["tailwind", "tailwind css"],
  testing: ["testing", "test automation", "unit tests", "integration tests"],
  typescript: ["typescript", "ts"],
};

const TITLE_STOP_WORDS = new Set([
  "and",
  "developer",
  "engineer",
  "ii",
  "iii",
  "lead",
  "mid",
  "senior",
  "software",
  "staff",
]);

function normalizeSkill(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function uniqueSkills(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function titleCaseSkill(value: string): string {
  if (value === "next.js") {
    return "Next.js";
  }

  if (value === "node.js") {
    return "Node.js";
  }

  if (value === "ci/cd") {
    return "CI/CD";
  }

  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phraseMatches(text: string, phrase: string): boolean {
  const normalizedPhrase = normalizeSkill(phrase);

  if (!normalizedPhrase) {
    return false;
  }

  const pattern = new RegExp(
    `(^|[^a-z0-9+#])${escapeRegex(normalizedPhrase)}([^a-z0-9+#]|$)`,
    "i",
  );

  return pattern.test(text);
}

function getSkillAliases(skill: string): string[] {
  const normalizedSkill = normalizeSkill(skill);
  return SKILL_ALIASES[normalizedSkill] ?? [normalizedSkill];
}

function skillAppearsInText(text: string, skill: string): boolean {
  return getSkillAliases(skill).some((alias) => phraseMatches(text, alias));
}

function canonicalSkill(value: string): string {
  const normalizedValue = normalizeSkill(value);

  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    if (
      canonical === normalizedValue ||
      aliases.some((alias) => normalizeSkill(alias) === normalizedValue)
    ) {
      return canonical;
    }
  }

  return normalizedValue;
}

function extractKnownSkills(text: string): string[] {
  const normalizedText = text.toLowerCase();

  return uniqueSkills(
    KNOWN_SKILLS.filter((skill) => skillAppearsInText(normalizedText, skill)).map(
      (skill) => titleCaseSkill(canonicalSkill(skill)),
    ),
  );
}

function getTitleTokens(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, " ")
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !TITLE_STOP_WORDS.has(token));
}

function titleOverlapsJob(jobText: string, title: string): boolean {
  const tokens = getTitleTokens(title);

  if (tokens.length === 0) {
    return false;
  }

  return tokens.some((token) => phraseMatches(jobText, token));
}

function buildHeuristicReason({
  matchedSkills,
  missingSkills,
  profile,
  job,
}: {
  matchedSkills: string[];
  missingSkills: string[];
  profile: FindJobsProfile;
  job: AdzunaJob;
}): string {
  const candidateTitle = profile.current_title?.trim() || "your current background";
  const overlapText =
    matchedSkills.length > 0
      ? `Strong overlap in ${matchedSkills.slice(0, 4).join(", ")}.`
      : "The role has limited direct overlap with the saved profile skills.";
  const gapText =
    missingSkills.length > 0
      ? `Gaps appear around ${missingSkills.slice(0, 3).join(", ")}.`
      : "No major skill gaps were detected from the Adzuna snippet.";

  return `${job.title} aligns with ${candidateTitle}. ${overlapText} ${gapText}`;
}

function createHeuristicMatch(
  job: AdzunaJob,
  profile: FindJobsProfile,
): JobMatchResult {
  const profileSkills = uniqueSkills(profile.skills);
  const profileSkillSet = new Set(profileSkills.map(canonicalSkill));
  const jobText = `${job.title} ${job.description}`.toLowerCase();
  const detectedJobSkills = extractKnownSkills(jobText);
  const matchedSkills = profileSkills.filter((skill) =>
    skillAppearsInText(jobText, skill),
  );
  const missingSkills = detectedJobSkills.filter(
    (skill) => !profileSkillSet.has(canonicalSkill(skill)),
  );
  const detectedSkillCount = detectedJobSkills.length;
  const skillCoverage =
    detectedSkillCount === 0 ? 0 : matchedSkills.length / detectedSkillCount;
  const desiredTitleMatch = profile.job_titles_seeking.some((title) =>
    title ? titleOverlapsJob(jobText, title) : false,
  );
  const currentTitleMatch = profile.current_title
    ? titleOverlapsJob(jobText, profile.current_title)
    : false;

  let score = 24;

  score += Math.round(skillCoverage * 42);
  score += Math.min(matchedSkills.length * 6, 24);

  if (currentTitleMatch) {
    score += 8;
  }

  if (desiredTitleMatch) {
    score += 14;
  }

  if (profile.remote_preference === "remote" && jobText.includes("remote")) {
    score += 6;
  }

  if (matchedSkills.length === 0 && !desiredTitleMatch && !currentTitleMatch) {
    score -= 14;
  }

  score -= Math.min(missingSkills.length * 3, 18);

  return {
    matchScore: clampNumber(score, 5, 96),
    matchReason: buildHeuristicReason({
      matchedSkills,
      missingSkills,
      profile,
      job,
    }),
    matchedSkills: matchedSkills.slice(0, 8),
    missingSkills: missingSkills.slice(0, 8),
  };
}

async function createOpenRouterMatch(
  job: AdzunaJob,
  profile: FindJobsProfile,
): Promise<JobMatchResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const systemPrompt =
    "You score jobs for a software developer. Return only valid JSON with matchScore, matchReason, matchedSkills, and missingSkills. matchScore must be an integer from 0 to 100. Ground the answer only in the provided job snippet and candidate profile.";

  const userPrompt = `JOB:
Title: ${job.title}
Company: ${job.company.display_name}
Location: ${job.location.display_name}
Description snippet: ${job.description}

CANDIDATE PROFILE:
Current title: ${profile.current_title ?? ""}
Experience level: ${profile.experience_level ?? ""}
Years experience: ${profile.years_experience ?? ""}
Skills: ${profile.skills.join(", ")}
Industries: ${profile.industries.join(", ")}
Desired titles: ${profile.job_titles_seeking.join(", ")}
Work history: ${JSON.stringify(profile.work_experience)}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status}`);
  }

  const json = openRouterResponseSchema.parse(await response.json());
  const content = json.choices[0]?.message.content ?? "";

  return jobMatchSchema.parse(JSON.parse(content));
}

export async function matchJobToProfile(
  job: AdzunaJob,
  profile: FindJobsProfile,
): Promise<JobMatchResult> {
  try {
    return await createOpenRouterMatch(job, profile);
  } catch (error) {
    console.error("[agent/matcher] Falling back to heuristic match", error);
    return createHeuristicMatch(job, profile);
  }
}
