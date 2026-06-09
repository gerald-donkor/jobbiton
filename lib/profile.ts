import type { UserSchema } from "@insforge/sdk";

export type WorkExperienceEntry = {
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string;
};

export type Education = {
  highestDegree: string;
  fieldOfStudy: string;
  institutionName: string;
  graduationYear: string;
};

export type ProfileValues = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  currentTitle: string;
  experienceLevel: string;
  yearsExperience: string;
  skills: string[];
  industries: string[];
  workExperience: WorkExperienceEntry[];
  education: Education;
  jobTitlesSeeking: string[];
  remotePreference: string;
  preferredLocations: string[];
  salaryExpectation: string;
  coverLetterTone: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: string;
  resumePdfUrl: string;
  isComplete: boolean;
};

export type ProfileCompletion = {
  percentage: number;
  missingFields: string[];
  isComplete: boolean;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[];
  industries: string[];
  work_experience: WorkExperienceEntry[];
  education: Education;
  job_titles_seeking: string[];
  remote_preference: string | null;
  preferred_locations: string[];
  salary_expectation: string | null;
  cover_letter_tone: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: string | null;
  resume_pdf_url: string | null;
  is_complete: boolean;
};

const emptyEducation: Education = {
  highestDegree: "",
  fieldOfStudy: "",
  institutionName: "",
  graduationYear: "",
};

export const emptyWorkExperience: WorkExperienceEntry = {
  companyName: "",
  jobTitle: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  responsibilities: "",
};

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function readRecordValue(value: unknown, key: string): unknown {
  if (!value || typeof value !== "object" || !(key in value)) {
    return undefined;
  }

  return Reflect.get(value, key);
}

function readEducation(value: unknown): Education {
  if (!value || typeof value !== "object") {
    return emptyEducation;
  }

  return {
    highestDegree: readString(readRecordValue(value, "highestDegree")),
    fieldOfStudy: readString(readRecordValue(value, "fieldOfStudy")),
    institutionName: readString(readRecordValue(value, "institutionName")),
    graduationYear: readString(readRecordValue(value, "graduationYear")),
  };
}

function readWorkExperience(value: unknown): WorkExperienceEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      companyName: readString(item.companyName),
      jobTitle: readString(item.jobTitle),
      startDate: readString(item.startDate),
      endDate: readString(item.endDate),
      currentlyWorking: item.currentlyWorking === true,
      responsibilities: readString(item.responsibilities),
    }))
    .filter((entry) => entry.companyName || entry.jobTitle || entry.responsibilities);
}

export function createDefaultProfileValues(user: UserSchema): ProfileValues {
  return {
    id: user.id,
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
    resumePdfUrl: "",
    isComplete: false,
  };
}

export function normalizeProfileRow(row: Partial<ProfileRow> | null, user: UserSchema): ProfileValues {
  const defaults = createDefaultProfileValues(user);

  if (!row) {
    return defaults;
  }

  const workExperience = readWorkExperience(row.work_experience);

  return {
    id: row.id ?? defaults.id,
    fullName: row.full_name ?? defaults.fullName,
    email: row.email ?? defaults.email,
    phone: row.phone ?? "",
    location: row.location ?? "",
    currentTitle: row.current_title ?? "",
    experienceLevel: row.experience_level ?? defaults.experienceLevel,
    yearsExperience: row.years_experience === null || row.years_experience === undefined ? "" : String(row.years_experience),
    skills: readStringArray(row.skills),
    industries: readStringArray(row.industries),
    workExperience: workExperience.length > 0 ? workExperience : [emptyWorkExperience],
    education: readEducation(row.education),
    jobTitlesSeeking: readStringArray(row.job_titles_seeking),
    remotePreference: row.remote_preference ?? defaults.remotePreference,
    preferredLocations: readStringArray(row.preferred_locations),
    salaryExpectation: row.salary_expectation ?? "",
    coverLetterTone: row.cover_letter_tone ?? defaults.coverLetterTone,
    linkedinUrl: row.linkedin_url ?? "",
    portfolioUrl: row.portfolio_url ?? "",
    workAuthorization: row.work_authorization ?? defaults.workAuthorization,
    resumePdfUrl: row.resume_pdf_url ?? "",
    isComplete: row.is_complete ?? false,
  };
}

export function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function uniqueList(items: string[]): string[] {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

export function calculateProfileCompletion(profile: ProfileValues): ProfileCompletion {
  const requiredFields: Array<{ label: string; complete: boolean }> = [
    { label: "FULL NAME", complete: Boolean(profile.fullName.trim()) },
    { label: "EMAIL", complete: Boolean(profile.email.trim()) },
    { label: "PHONE", complete: Boolean(profile.phone.trim()) },
    { label: "LOCATION", complete: Boolean(profile.location.trim()) },
    { label: "CURRENT TITLE", complete: Boolean(profile.currentTitle.trim()) },
    { label: "EXPERIENCE", complete: Boolean(profile.experienceLevel && profile.yearsExperience.trim()) },
    { label: "SKILLS", complete: profile.skills.length > 0 },
    {
      label: "EDUCATION",
      complete: Boolean(
        profile.education.highestDegree &&
          profile.education.fieldOfStudy.trim() &&
          profile.education.institutionName.trim() &&
          profile.education.graduationYear.trim(),
      ),
    },
    { label: "JOB TITLES", complete: profile.jobTitlesSeeking.length > 0 },
    { label: "WORK AUTHORIZATION", complete: Boolean(profile.workAuthorization) },
  ];

  const completeCount = requiredFields.filter((field) => field.complete).length;
  const missingFields = requiredFields.filter((field) => !field.complete).map((field) => field.label);

  return {
    percentage: Math.round((completeCount / requiredFields.length) * 100),
    missingFields,
    isComplete: missingFields.length === 0,
  };
}
