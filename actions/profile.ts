"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createInsforgeServer } from "@/lib/insforge-server";
import { capturePostHogServerEvent } from "@/lib/posthog-server";
import {
  calculateProfileCompletion,
  emptyWorkExperience,
  splitList,
  uniqueList,
  type Education,
  type ProfileValues,
  type WorkExperienceEntry,
} from "@/lib/profile";

const MAX_RESUME_SIZE = 2 * 1024 * 1024;
const RESUME_BUCKET = "resumes";

export type SaveProfileState = {
  success: boolean;
  message: string;
  profile?: ProfileValues;
};

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getOptionalNumber(value: string): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isNaN(parsed) ? null : parsed;
}

function getOptionalString(value: string): string | null {
  return value ? value : null;
}

function readErrorProperty(error: unknown, key: string): unknown {
  if (!error || typeof error !== "object" || !(key in error)) {
    return undefined;
  }

  return Reflect.get(error, key);
}

function describeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      cause: error.cause,
      status: readErrorProperty(error, "status"),
      statusCode: readErrorProperty(error, "statusCode"),
      code: readErrorProperty(error, "code"),
      details: readErrorProperty(error, "details"),
      hint: readErrorProperty(error, "hint"),
      error: readErrorProperty(error, "error"),
    };
  }

  if (error && typeof error === "object") {
    return {
      message: readErrorProperty(error, "message"),
      status: readErrorProperty(error, "status"),
      statusCode: readErrorProperty(error, "statusCode"),
      code: readErrorProperty(error, "code"),
      details: readErrorProperty(error, "details"),
      hint: readErrorProperty(error, "hint"),
      error: readErrorProperty(error, "error"),
    };
  }

  return { error };
}

function readJsonList(value: string): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return uniqueList(parsed.filter((item): item is string => typeof item === "string"));
  } catch {
    return [];
  }
}

function readEducation(formData: FormData): Education {
  return {
    highestDegree: getString(formData, "education_highest_degree"),
    fieldOfStudy: getString(formData, "education_field_of_study"),
    institutionName: getString(formData, "education_institution_name"),
    graduationYear: getString(formData, "education_graduation_year"),
  };
}

function readWorkExperience(formData: FormData): WorkExperienceEntry[] {
  const entries = [0, 1, 2].map((index) => ({
    companyName: getString(formData, `work_company_${index}`),
    jobTitle: getString(formData, `work_title_${index}`),
    startDate: getString(formData, `work_start_${index}`),
    endDate: getString(formData, `work_end_${index}`),
    currentlyWorking: formData.get(`work_current_${index}`) === "on",
    responsibilities: getString(formData, `work_responsibilities_${index}`),
  }));

  const filledEntries = entries.filter(
    (entry) => entry.companyName || entry.jobTitle || entry.responsibilities,
  );

  return filledEntries.length > 0 ? filledEntries : [emptyWorkExperience];
}

function getResumeFile(formData: FormData): File | null {
  const file = formData.get("resume");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return file;
}

function readProfileValues(
  userId: string,
  formData: FormData,
  resumePdfUrl: string,
): ProfileValues {
  return {
    id: userId,
    fullName: getString(formData, "full_name"),
    email: getString(formData, "email"),
    phone: getString(formData, "phone"),
    location: getString(formData, "location"),
    currentTitle: getString(formData, "current_title"),
    experienceLevel: getString(formData, "experience_level"),
    yearsExperience: getString(formData, "years_experience"),
    skills: readJsonList(getString(formData, "skills_json")),
    industries: readJsonList(getString(formData, "industries_json")),
    workExperience: readWorkExperience(formData),
    education: readEducation(formData),
    jobTitlesSeeking: splitList(getString(formData, "job_titles_seeking")),
    remotePreference: getString(formData, "remote_preference"),
    preferredLocations: splitList(getString(formData, "preferred_locations")),
    salaryExpectation: getString(formData, "salary_expectation"),
    coverLetterTone: getString(formData, "cover_letter_tone"),
    linkedinUrl: getString(formData, "linkedin_url"),
    portfolioUrl: getString(formData, "portfolio_url"),
    workAuthorization: getString(formData, "work_authorization"),
    resumePdfUrl,
    isComplete: false,
  };
}

export async function saveProfile(
  _previousState: SaveProfileState,
  formData: FormData,
): Promise<SaveProfileState> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        message: "Please sign in again before saving your profile.",
      };
    }

    const insforge = await createInsforgeServer();

    const { data: existingProfile, error: existingError } = await insforge.database
      .from("profiles")
      .select("is_complete,resume_pdf_url")
      .eq("id", user.id)
      .maybeSingle();

    if (existingError) {
      console.error("[saveProfile] Unable to read existing profile", existingError);
      return {
        success: false,
        message: "We could not load your existing profile. Please try again.",
      };
    }

    let resumePdfUrl =
      typeof existingProfile?.resume_pdf_url === "string"
        ? existingProfile.resume_pdf_url
        : "";
    let profile = readProfileValues(user.id, formData, resumePdfUrl);
    const resumeFile = getResumeFile(formData);

    if (resumeFile) {
      if (resumeFile.type !== "application/pdf") {
        return {
          success: false,
          message: "Please upload a PDF resume.",
          profile,
        };
      }

      if (resumeFile.size > MAX_RESUME_SIZE) {
        return {
          success: false,
          message: "Resume files must be 2MB or smaller.",
          profile,
        };
      }

      const resumePath = `${user.id}/resume.pdf`;
      await insforge.storage.from(RESUME_BUCKET).remove(resumePath);
      const { data: uploadedResume, error: uploadError } = await insforge.storage
        .from(RESUME_BUCKET)
        .upload(resumePath, resumeFile);

      if (uploadError || !uploadedResume?.url) {
        console.error("[saveProfile] Resume upload failed", describeError(uploadError));
        return {
          success: false,
          message: "We could not upload your resume. Please try again.",
          profile,
        };
      }

      resumePdfUrl = uploadedResume.url;
      profile = readProfileValues(user.id, formData, resumePdfUrl);
    }

    const completion = calculateProfileCompletion(profile);

    const { error: saveError } = await insforge.database.from("profiles").upsert([
      {
        id: user.id,
        full_name: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        current_title: profile.currentTitle,
        experience_level: getOptionalString(profile.experienceLevel),
        years_experience: getOptionalNumber(profile.yearsExperience),
        skills: profile.skills,
        industries: profile.industries,
        work_experience: profile.workExperience,
        education: profile.education,
        job_titles_seeking: profile.jobTitlesSeeking,
        remote_preference: getOptionalString(profile.remotePreference),
        preferred_locations: profile.preferredLocations,
        salary_expectation: profile.salaryExpectation,
        cover_letter_tone: getOptionalString(profile.coverLetterTone),
        linkedin_url: profile.linkedinUrl,
        portfolio_url: profile.portfolioUrl,
        work_authorization: getOptionalString(profile.workAuthorization),
        resume_pdf_url: profile.resumePdfUrl,
        is_complete: completion.isComplete,
        updated_at: new Date().toISOString(),
      },
    ]);

    if (saveError) {
      console.error("[saveProfile] Profile save failed", describeError(saveError));
      return {
        success: false,
        message: "We could not save your profile. Please try again.",
        profile,
      };
    }

    if (!existingProfile?.is_complete && completion.isComplete) {
      try {
        await capturePostHogServerEvent({
          name: "profile_completed",
          distinctId: user.id,
          properties: {
            userId: user.id,
          },
        });
      } catch (error) {
        console.error("[saveProfile] profile_completed capture failed", error);
      }
    }

    revalidatePath("/profile");

    return {
      success: true,
      message: completion.isComplete
        ? "Profile saved. Your profile is complete."
        : "Profile saved. Add the missing fields to complete it.",
      profile,
    };
  } catch (error) {
    console.error("[saveProfile] Unexpected failure", describeError(error));
    return {
      success: false,
      message: "We could not save your profile. Please try again.",
    };
  }
}
