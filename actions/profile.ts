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
import {
  getResumeFileFormat,
  MAX_RESUME_SIZE,
} from "@/lib/resume-files";
import {
  describeError,
  removeUserResume,
  replaceUserResume,
} from "@/lib/resume-storage";

export type SaveProfileState = {
  success: boolean;
  message: string;
  profile?: ProfileValues;
};

export type UploadResumeState =
  | {
      success: true;
      resumePdfUrl: string;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

export type RemoveResumeState =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
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

async function uploadUserResume({
  file,
  insforge,
  userId,
}: {
  file: File;
  insforge: Awaited<ReturnType<typeof createInsforgeServer>>;
  userId: string;
}): Promise<{ resumePdfUrl: string } | { error: string }> {
  const resumeFormat = getResumeFileFormat(file);

  if (!resumeFormat) {
    return { error: "Please upload a PDF, DOC, DOCX, TXT, or RTF resume." };
  }

  if (file.size > MAX_RESUME_SIZE) {
    return { error: "Resume files must be 2MB or smaller." };
  }

  const uploadResult = await replaceUserResume({
    file,
    extension: resumeFormat.extension,
    insforge,
    logPrefix: "[uploadUserResume]",
    userId,
  });

  return uploadResult.success
    ? { resumePdfUrl: uploadResult.resumePdfUrl }
    : { error: uploadResult.error };
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

export async function uploadResume(formData: FormData): Promise<UploadResumeState> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        message: "Please sign in again before uploading your resume.",
      };
    }

    const resumeFile = getResumeFile(formData);

    if (!resumeFile) {
      return {
        success: false,
        message: "Please select a resume to upload.",
      };
    }

    const insforge = await createInsforgeServer();
    const uploadResult = await uploadUserResume({
      file: resumeFile,
      insforge,
      userId: user.id,
    });

    if ("error" in uploadResult) {
      return {
        success: false,
        message: uploadResult.error,
      };
    }

    const { error: saveError } = await insforge.database.from("profiles").upsert([
      {
        id: user.id,
        resume_pdf_url: uploadResult.resumePdfUrl,
        updated_at: new Date().toISOString(),
      },
    ]);

    if (saveError) {
      console.error("[uploadResume] Profile resume URL save failed", describeError(saveError));
      return {
        success: false,
        message: "We uploaded your resume but could not save it to your profile. Please try again.",
      };
    }

    revalidatePath("/profile");

    return {
      success: true,
      resumePdfUrl: uploadResult.resumePdfUrl,
      message: "Resume uploaded successfully.",
    };
  } catch (error) {
    console.error("[uploadResume] Unexpected failure", describeError(error));
    return {
      success: false,
      message: "We could not upload your resume. Please try again.",
    };
  }
}

export async function removeResume(): Promise<RemoveResumeState> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        message: "Please sign in again before removing your resume.",
      };
    }

    const insforge = await createInsforgeServer();
    const removeResult = await removeUserResume({
      insforge,
      logPrefix: "[removeResume]",
      userId: user.id,
    });

    if (!removeResult.success) {
      return {
        success: false,
        message: removeResult.error,
      };
    }

    const { error: saveError } = await insforge.database.from("profiles").upsert([
      {
        id: user.id,
        resume_pdf_url: null,
        updated_at: new Date().toISOString(),
      },
    ]);

    if (saveError) {
      console.error("[removeResume] Profile resume URL clear failed", describeError(saveError));
      return {
        success: false,
        message: "We removed your resume but could not update your profile. Please try again.",
      };
    }

    revalidatePath("/profile");

    return {
      success: true,
      message: "Resume removed.",
    };
  } catch (error) {
    console.error("[removeResume] Unexpected failure", describeError(error));
    return {
      success: false,
      message: "We could not remove your resume. Please try again.",
    };
  }
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
      const uploadResult = await uploadUserResume({
        file: resumeFile,
        insforge,
        userId: user.id,
      });

      if ("error" in uploadResult) {
        return {
          success: false,
          message: uploadResult.error,
          profile,
        };
      }

      resumePdfUrl = uploadResult.resumePdfUrl;
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
