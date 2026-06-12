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
  "next.js",
  "nextjs",
  "typescript",
  "javascript",
  "node.js",
  "node",
  "tailwind",
  "css",
  "html",
  "graphql",
  "rest",
  "postgresql",
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

function normalizeSkill(value: string): string {
  return value.trim().toLowerCase();
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

function extractKnownSkills(text: string): string[] {
  const normalizedText = text.toLowerCase();

  return KNOWN_SKILLS.filter((skill) => normalizedText.includes(skill)).map((skill) =>
    skill === "nextjs" ? "Next.js" : skill.replace(/\b\w/g, (letter) => letter.toUpperCase()),
  );
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
  const profileSkillSet = new Set(profileSkills.map(normalizeSkill));
  const jobText = `${job.title} ${job.description}`.toLowerCase();
  const detectedJobSkills = extractKnownSkills(jobText);
  const matchedSkills = profileSkills.filter((skill) =>
    jobText.includes(normalizeSkill(skill)),
  );
  const missingSkills = detectedJobSkills.filter(
    (skill) => !profileSkillSet.has(normalizeSkill(skill)),
  );

  let score = 32;

  score += matchedSkills.length * 11;

  if (
    profile.current_title &&
    jobText.includes(profile.current_title.trim().toLowerCase())
  ) {
    score += 10;
  }

  if (
    profile.job_titles_seeking.some((title) =>
      title ? jobText.includes(title.trim().toLowerCase()) : false,
    )
  ) {
    score += 8;
  }

  if (profile.remote_preference === "remote" && jobText.includes("remote")) {
    score += 6;
  }

  score -= missingSkills.length * 4;

  return {
    matchScore: clampNumber(score, 18, 96),
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
