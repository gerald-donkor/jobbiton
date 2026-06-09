"use client";

import { useActionState, useEffect, useState } from "react";
import { saveProfile, type SaveProfileState } from "@/actions/profile";
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

type ProfileEditorProps = {
  profile: ProfileValues;
};

type ProfileDraftState = {
  snapshotKey: string;
  skills: string[];
  industries: string[];
  workExperience: WorkExperienceEntry[];
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

export function ProfileEditor({ profile }: ProfileEditorProps) {
  const [resumeName, setResumeName] = useState("");
  const [resumePreviewUrl, setResumePreviewUrl] = useState("");
  async function handleSaveProfile(
    previousState: SaveProfileState,
    formData: FormData,
  ): Promise<SaveProfileState> {
    const result = await saveProfile(previousState, formData);

    if (result.success && result.profile?.resumePdfUrl) {
      setResumeName("");
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
  const activeProfile = state.profile ?? profile;
  const formSnapshotKey = state.profile
    ? JSON.stringify(state.profile)
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

  return (
    <form action={formAction} className="contents">
      <ProfileAttentionBanner completion={calculateProfileCompletion(activeProfile)} />
      <ConnectedAccountsSection />
      <ResumeSection
        resumePdfUrl={activeProfile.resumePdfUrl}
        resumeName={resumeName}
        resumePreviewUrl={resumePreviewUrl}
        isResumeSaved={Boolean(activeProfile.resumePdfUrl) && !resumePreviewUrl}
        onResumeChange={(event) => {
          const selectedResume = event.currentTarget.files?.[0] ?? null;

          setResumeName(selectedResume?.name ?? "");
          setResumePreviewUrl((currentUrl) => {
            if (currentUrl) {
              URL.revokeObjectURL(currentUrl);
            }

            return selectedResume ? URL.createObjectURL(selectedResume) : "";
          });
        }}
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
