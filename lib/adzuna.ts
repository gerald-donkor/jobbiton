import { clampNumber } from "@/lib/utils";

export type AdzunaCountry = "us" | "gb" | "au" | "ca";

export type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: "0" | "1";
  contract_type?: string;
  created: string;
  category?: { tag: string; label: string };
};

export type AdzunaSearchResult = {
  jobs: AdzunaJob[];
  searchUrl: string;
};

const ADZUNA_CANDIDATE_LIMIT = 30;

const COUNTRY_PATTERNS: Array<{ country: AdzunaCountry; patterns: RegExp[] }> = [
  {
    country: "gb",
    patterns: [
      /\buk\b/i,
      /\bunited kingdom\b/i,
      /\bengland\b/i,
      /\blondon\b/i,
      /\bmanchester\b/i,
      /\bscotland\b/i,
    ],
  },
  {
    country: "au",
    patterns: [
      /\baustralia\b/i,
      /\baus\b/i,
      /\bsydney\b/i,
      /\bmelbourne\b/i,
      /\bbrisbane\b/i,
      /\bperth\b/i,
    ],
  },
  {
    country: "ca",
    patterns: [
      /\bcanada\b/i,
      /\btoronto\b/i,
      /\bvancouver\b/i,
      /\bmontreal\b/i,
      /\bottawa\b/i,
      /\bcalgary\b/i,
    ],
  },
];

export function detectAdzunaCountry(location: string): AdzunaCountry {
  const normalizedLocation = location.trim();

  for (const { country, patterns } of COUNTRY_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(normalizedLocation))) {
      return country;
    }
  }

  return "us";
}

export function formatAdzunaSalary(job: AdzunaJob): string | null {
  const salaryMin = typeof job.salary_min === "number" ? job.salary_min : null;
  const salaryMax = typeof job.salary_max === "number" ? job.salary_max : null;

  if (salaryMin === null && salaryMax === null) {
    return null;
  }

  const roundedMin = salaryMin === null ? null : Math.round(salaryMin / 1000);
  const roundedMax = salaryMax === null ? null : Math.round(salaryMax / 1000);

  if (roundedMin !== null && roundedMax !== null) {
    return `$${roundedMin}k - $${roundedMax}k`;
  }

  if (roundedMin !== null) {
    return `$${roundedMin}k+`;
  }

  return `$${roundedMax}k`;
}

export function normalizeAdzunaJobType(contractType?: string): string {
  if (contractType === "part_time") {
    return "parttime";
  }

  if (contractType === "contract") {
    return "contract";
  }

  return "fulltime";
}

export async function searchAdzunaJobs(
  jobTitle: string,
  location: string,
  country: AdzunaCountry,
): Promise<AdzunaSearchResult> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    throw new Error("Adzuna credentials are not configured.");
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: jobTitle,
    category: "it-jobs",
    results_per_page: String(ADZUNA_CANDIDATE_LIMIT),
    "content-type": "application/json",
  });

  if (location.trim()) {
    params.set("where", location.trim());
  }

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Adzuna API error: ${response.status}`);
  }

  const json = (await response.json()) as {
    results?: AdzunaJob[];
  };
  const jobs = Array.isArray(json.results)
    ? json.results.slice(0, ADZUNA_CANDIDATE_LIMIT)
    : [];

  return {
    jobs,
    searchUrl: buildAdzunaSearchUrl(jobTitle, location, country),
  };
}

export function buildAdzunaSearchUrl(
  jobTitle: string,
  location: string,
  country: AdzunaCountry,
): string {
  const hostByCountry: Record<AdzunaCountry, string> = {
    au: "www.adzuna.com.au",
    ca: "www.adzuna.ca",
    gb: "www.adzuna.co.uk",
    us: "www.adzuna.com",
  };
  const url = new URL(`https://${hostByCountry[country]}/search`);

  url.searchParams.set("q", jobTitle.trim());

  if (location.trim()) {
    url.searchParams.set("loc", location.trim());
  }

  return url.toString();
}

export function getScoreColor(score: number): "success" | "info" | "warning" {
  const normalizedScore = clampNumber(score, 0, 100);

  if (normalizedScore >= 80) {
    return "success";
  }

  if (normalizedScore >= 60) {
    return "info";
  }

  return "warning";
}
