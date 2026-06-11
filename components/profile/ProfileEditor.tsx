"use client";

import { useActionState, useEffect, useState, type ChangeEvent } from "react";
import {
  saveProfile,
  uploadResume,
  type SaveProfileState,
} from "@/actions/profile";
import { ConnectedAccountsSection } from "@/components/profile/ConnectedAccountsSection";
import { ProfileInformationForm } from "@/components/profile/ProfileInformationForm";
import { ProfileAttentionBanner } from "@/components/profile/ProfileAttentionBanner";
import { ResumeSection } from "@/components/profile/ResumeSection";
import {
  calculateProfileCompletion,
  emptyWorkExperience,
  uniqueList,
  type ProfileValues,
  type WorkExperienceEntry,
} from "@/lib/profile";
import {
  canEmbedResumeFormat,
  canExtractResumeFormat,
  canTextPreviewResumeFormat,
  getResumeFileFormat,
  getResumeFormatByUrl,
} from "@/lib/resume-files";
import type { ResumeProfileExtraction } from "@/lib/resume-extraction";

type ProfileEditorProps = {
  profile: ProfileValues;
};

type ProfileDraftState = {
  snapshotKey: string;
  skills: string[];
  industries: string[];
  workExperience: WorkExperienceEntry[];
};

type ResumeExtractResponse =
  | {
      success: true;
      data: {
        profile: ResumeProfileExtraction;
      };
    }
  | {
      success: false;
      error: string;
    };

type ResumePreviewResponse =
  | {
      success: true;
      data: {
        text: string;
      };
    }
  | {
      success: false;
      error: string;
    };

const initialSaveProfileState: SaveProfileState = {
  success: false,
  message: "",
};

function createProfileDraftState(
  profile: ProfileValues,
  snapshotKey: string,
): ProfileDraftState {
  return {
    snapshotKey,
    skills: profile.skills,
    industries: profile.industries,
    workExperience: profile.workExperience,
  };
}

function hasText(value: string): boolean {
  return Boolean(value.trim());
}

function hasExtractedWorkExperience(
  workExperience: WorkExperienceEntry[],
): boolean {
  return workExperience.some(
    (entry) =>
      hasText(entry.companyName) ||
      hasText(entry.jobTitle) ||
      hasText(entry.responsibilities),
  );
}

function mergeExtractedProfile(
  currentProfile: ProfileValues,
  extractedProfile: ResumeProfileExtraction,
): ProfileValues {
  return {
    ...currentProfile,
    fullName: hasText(extractedProfile.fullName)
      ? extractedProfile.fullName
      : currentProfile.fullName,
    email: hasText(extractedProfile.email) ? extractedProfile.email : currentProfile.email,
    phone: hasText(extractedProfile.phone) ? extractedProfile.phone : currentProfile.phone,
    location: hasText(extractedProfile.location)
      ? extractedProfile.location
      : currentProfile.location,
    currentTitle: hasText(extractedProfile.currentTitle)
      ? extractedProfile.currentTitle
      : currentProfile.currentTitle,
    experienceLevel: extractedProfile.experienceLevel || currentProfile.experienceLevel,
    yearsExperience: hasText(extractedProfile.yearsExperience)
      ? extractedProfile.yearsExperience
      : currentProfile.yearsExperience,
    skills:
      extractedProfile.skills.length > 0
        ? extractedProfile.skills
        : currentProfile.skills,
    industries:
      extractedProfile.industries.length > 0
        ? extractedProfile.industries
        : currentProfile.industries,
    workExperience: hasExtractedWorkExperience(extractedProfile.workExperience)
      ? extractedProfile.workExperience
      : currentProfile.workExperience,
    education: {
      highestDegree:
        extractedProfile.education.highestDegree ||
        currentProfile.education.highestDegree,
      fieldOfStudy: hasText(extractedProfile.education.fieldOfStudy)
        ? extractedProfile.education.fieldOfStudy
        : currentProfile.education.fieldOfStudy,
      institutionName: hasText(extractedProfile.education.institutionName)
        ? extractedProfile.education.institutionName
        : currentProfile.education.institutionName,
      graduationYear: hasText(extractedProfile.education.graduationYear)
        ? extractedProfile.education.graduationYear
        : currentProfile.education.graduationYear,
    },
    jobTitlesSeeking:
      extractedProfile.jobTitlesSeeking.length > 0
        ? extractedProfile.jobTitlesSeeking
        : currentProfile.jobTitlesSeeking,
    remotePreference:
      extractedProfile.remotePreference || currentProfile.remotePreference,
    preferredLocations:
      extractedProfile.preferredLocations.length > 0
        ? extractedProfile.preferredLocations
        : currentProfile.preferredLocations,
    salaryExpectation: hasText(extractedProfile.salaryExpectation)
      ? extractedProfile.salaryExpectation
      : currentProfile.salaryExpectation,
    coverLetterTone:
      extractedProfile.coverLetterTone || currentProfile.coverLetterTone,
    linkedinUrl: hasText(extractedProfile.linkedinUrl)
      ? extractedProfile.linkedinUrl
      : currentProfile.linkedinUrl,
    portfolioUrl: hasText(extractedProfile.portfolioUrl)
      ? extractedProfile.portfolioUrl
      : currentProfile.portfolioUrl,
    workAuthorization:
      extractedProfile.workAuthorization || currentProfile.workAuthorization,
  };
}

export function ProfileEditor({ profile }: ProfileEditorProps) {
  const [resumeName, setResumeName] = useState("");
  const [resumePreviewUrl, setResumePreviewUrl] = useState("");
  const [persistedResumeUrl, setPersistedResumeUrl] = useState(profile.resumePdfUrl);
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);
  const [extractedProfile, setExtractedProfile] = useState<ProfileValues | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractMessage, setExtractMessage] = useState("");
  const [isResumeUploading, setIsResumeUploading] = useState(false);
  const [resumeUploadMessage, setResumeUploadMessage] = useState("");
  const [isResumeUploadSuccess, setIsResumeUploadSuccess] = useState(
    Boolean(profile.resumePdfUrl),
  );
  const [resumePreviewText, setResumePreviewText] = useState("");
  const [isResumePreviewLoading, setIsResumePreviewLoading] = useState(false);
  const [resumePreviewMessage, setResumePreviewMessage] = useState("");
  async function handleSaveProfile(
    previousState: SaveProfileState,
    formData: FormData,
  ): Promise<SaveProfileState> {
    const result = await saveProfile(previousState, formData);

    if (result.success && result.profile?.resumePdfUrl) {
      setPersistedResumeUrl(result.profile.resumePdfUrl);
      setResumeName("");
      setSelectedResumeFile(null);
      setExtractMessage("");
      setResumeUploadMessage("Resume uploaded successfully.");
      setIsResumeUploadSuccess(true);
      setExtractedProfile(null);
      setResumePreviewUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }

        return "";
      });
    }

    return result;
  }

  const [state, formAction, isPending] = useActionState(
    handleSaveProfile,
    initialSaveProfileState,
  );
  const baseProfile = state.profile ?? extractedProfile ?? profile;
  const activeProfile =
    persistedResumeUrl && persistedResumeUrl !== baseProfile.resumePdfUrl
      ? { ...baseProfile, resumePdfUrl: persistedResumeUrl }
      : baseProfile;
  const formSnapshotKey = state.profile
    ? JSON.stringify(state.profile)
    : extractedProfile
      ? JSON.stringify(extractedProfile)
    : "initial-profile";
  const [draft, setDraft] = useState(() =>
    createProfileDraftState(profile, formSnapshotKey),
  );
  const [skillInput, setSkillInput] = useState("");
  const [industryInput, setIndustryInput] = useState("");
  const currentDraft =
    draft.snapshotKey === formSnapshotKey
      ? draft
      : createProfileDraftState(activeProfile, formSnapshotKey);
  const selectedResumeFormat = selectedResumeFile
    ? getResumeFileFormat(selectedResumeFile)
    : null;
  const savedResumeFormat = getResumeFormatByUrl(activeProfile.resumePdfUrl);
  const activeResumeFormat = selectedResumeFormat ?? savedResumeFormat;
  const canTextPreviewResume = canTextPreviewResumeFormat(activeResumeFormat);

  if (draft.snapshotKey !== formSnapshotKey) {
    setDraft(currentDraft);
  }

  useEffect(() => {
    return () => {
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
      }
    };
  }, [resumePreviewUrl]);

  useEffect(() => {
    let isCancelled = false;

    async function loadResumePreviewText() {
      if (!canTextPreviewResume || !activeResumeFormat) {
        setResumePreviewText("");
        setResumePreviewMessage("");
        setIsResumePreviewLoading(false);
        return;
      }

      setIsResumePreviewLoading(true);
      setResumePreviewMessage("");

      try {
        const formData = new FormData();

        if (selectedResumeFile) {
          formData.append("resume", selectedResumeFile);
        }

        const response = await fetch("/api/resume/preview", {
          method: "POST",
          credentials: "same-origin",
          body: formData,
        });
        const result = (await response.json()) as ResumePreviewResponse;

        if (isCancelled) {
          return;
        }

        if (!result.success) {
          setResumePreviewText("");
          setResumePreviewMessage(result.error);
          return;
        }

        setResumePreviewText(result.data.text);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error("[ProfileEditor] Resume preview failed", error);
        setResumePreviewText("");
        setResumePreviewMessage("We could not preview this resume.");
      } finally {
        if (!isCancelled) {
          setIsResumePreviewLoading(false);
        }
      }
    }

    void loadResumePreviewText();

    return () => {
      isCancelled = true;
    };
  }, [
    activeProfile.resumePdfUrl,
    activeResumeFormat,
    canTextPreviewResume,
    selectedResumeFile,
  ]);

  function addSkill() {
    setDraft((currentDraftState) => ({
      ...currentDraftState,
      skills: uniqueList([...currentDraftState.skills, skillInput]),
    }));
    setSkillInput("");
  }

  function addIndustry() {
    setDraft((currentDraftState) => ({
      ...currentDraftState,
      industries: uniqueList([...currentDraftState.industries, industryInput]),
    }));
    setIndustryInput("");
  }

  function addWorkExperience() {
    setDraft((currentDraftState) => ({
      ...currentDraftState,
      workExperience:
        currentDraftState.workExperience.length >= 3
          ? currentDraftState.workExperience
          : [...currentDraftState.workExperience, emptyWorkExperience],
    }));
  }

  function removeWorkExperience(indexToRemove: number) {
    setDraft((currentDraftState) => ({
      ...currentDraftState,
      workExperience:
        currentDraftState.workExperience.length === 1
          ? currentDraftState.workExperience
          : currentDraftState.workExperience.filter(
              (_, index) => index !== indexToRemove,
            ),
    }));
  }

  async function extractResume() {
    setIsExtracting(true);
    setExtractMessage("");

    try {
      const formData = new FormData();

      if (selectedResumeFile) {
        formData.append("resume", selectedResumeFile);
      }

      const response = await fetch("/api/resume/extract", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });
      const result = (await response.json()) as ResumeExtractResponse;

      if (!result.success) {
        setExtractMessage(result.error);
        return;
      }

      const nextProfile = mergeExtractedProfile(activeProfile, result.data.profile);
      const nextSnapshotKey = JSON.stringify(nextProfile);

      setExtractedProfile(nextProfile);
      setDraft(createProfileDraftState(nextProfile, nextSnapshotKey));
      setSkillInput("");
      setIndustryInput("");
      setExtractMessage("Resume extracted. Review the fields below before saving.");
    } catch (error) {
      console.error("[ProfileEditor] Resume extraction failed", error);
      setExtractMessage("We could not extract your resume. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleResumeChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedResume = event.currentTarget.files?.[0] ?? null;

    setResumeName(selectedResume?.name ?? "");
    setSelectedResumeFile(selectedResume);
    setExtractMessage("");
    setResumeUploadMessage("");
    setIsResumeUploadSuccess(false);
    setResumePreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }

      return selectedResume ? URL.createObjectURL(selectedResume) : "";
    });

    if (!selectedResume) {
      return;
    }

    setIsResumeUploading(true);

    try {
      const formData = new FormData();
      formData.append("resume", selectedResume);

      const result = await uploadResume(formData);

      setResumeUploadMessage(result.message);
      setIsResumeUploadSuccess(result.success);

      if (result.success) {
        setPersistedResumeUrl(result.resumePdfUrl);
      }
    } catch (error) {
      console.error("[ProfileEditor] Resume upload failed", error);
      setResumeUploadMessage("We could not upload your resume. Please try again.");
      setIsResumeUploadSuccess(false);
    } finally {
      setIsResumeUploading(false);
    }
  }

  return (
    <form action={formAction} className="contents">
      <ProfileAttentionBanner completion={calculateProfileCompletion(activeProfile)} />
      <ConnectedAccountsSection />
      <ResumeSection
        resumePdfUrl={activeProfile.resumePdfUrl}
        resumeName={resumeName}
        resumePreviewUrl={resumePreviewUrl}
        isResumeSaved={Boolean(activeProfile.resumePdfUrl)}
        isResumeUploading={isResumeUploading}
        resumeUploadMessage={resumeUploadMessage}
        isResumeUploadSuccess={isResumeUploadSuccess}
        canEmbedResume={canEmbedResumeFormat(activeResumeFormat)}
        resumePreviewText={resumePreviewText}
        isResumePreviewLoading={isResumePreviewLoading}
        resumePreviewMessage={resumePreviewMessage}
        canExtractResume={canExtractResumeFormat(activeResumeFormat)}
        isExtracting={isExtracting}
        extractMessage={extractMessage}
        onResumeChange={handleResumeChange}
        onExtractResume={extractResume}
      />
      <ProfileInformationForm
        key={formSnapshotKey}
        profile={activeProfile}
        skills={currentDraft.skills}
        industries={currentDraft.industries}
        skillInput={skillInput}
        industryInput={industryInput}
        workExperience={currentDraft.workExperience}
        isPending={isPending}
        actionState={state}
        onSkillInputChange={setSkillInput}
        onIndustryInputChange={setIndustryInput}
        onAddSkill={addSkill}
        onAddIndustry={addIndustry}
        onRemoveSkill={(skill) =>
          setDraft((currentDraftState) => ({
            ...currentDraftState,
            skills: currentDraftState.skills.filter(
              (currentSkill) => currentSkill !== skill,
            ),
          }))
        }
        onRemoveIndustry={(industry) =>
          setDraft((currentDraftState) => ({
            ...currentDraftState,
            industries: currentDraftState.industries.filter(
              (currentIndustry) => currentIndustry !== industry,
            ),
          }))
        }
        onAddWorkExperience={addWorkExperience}
        onRemoveWorkExperience={removeWorkExperience}
      />
    </form>
  );
}
