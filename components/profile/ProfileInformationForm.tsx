"use client";

import type { SaveProfileState } from "@/actions/profile";
import { ProcessOverlay } from "@/components/loading/ProcessOverlay";
import { ScrollFloat } from "@/components/motion/ScrollFlow";
import { Button } from "@/components/ui/button";
import type { ProfileValues, WorkExperienceEntry } from "@/lib/profile";

type ProfileInformationFormProps = {
  profile: ProfileValues;
  skills: string[];
  industries: string[];
  skillInput: string;
  industryInput: string;
  workExperience: WorkExperienceEntry[];
  isPending: boolean;
  actionState: SaveProfileState;
  onSkillInputChange: (value: string) => void;
  onIndustryInputChange: (value: string) => void;
  onAddSkill: () => void;
  onAddIndustry: () => void;
  onRemoveSkill: (skill: string) => void;
  onRemoveIndustry: (industry: string) => void;
  onAddWorkExperience: () => void;
  onRemoveWorkExperience: (index: number) => void;
};

export function ProfileInformationForm({
  profile,
  skills,
  industries,
  skillInput,
  industryInput,
  workExperience,
  isPending,
  actionState,
  onSkillInputChange,
  onIndustryInputChange,
  onAddSkill,
  onAddIndustry,
  onRemoveSkill,
  onRemoveIndustry,
  onAddWorkExperience,
  onRemoveWorkExperience,
}: ProfileInformationFormProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-surface px-8 py-8 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
      <ProcessOverlay
        active={isPending}
        variant="save"
        title="Saving your profile"
        description="Updating your profile details, preferences, skills, and work history."
        steps={["Validating fields", "Saving changes", "Refreshing matches"]}
      />
      <input type="hidden" name="skills_json" value={JSON.stringify(skills)} />
      <input
        type="hidden"
        name="industries_json"
        value={JSON.stringify(industries)}
      />

      <div className="border-b border-border pb-5">
        <h2 className="text-[22px] font-semibold leading-8 text-text-primary">
          Profile Information
        </h2>
        <p className="mt-1 text-[13px] font-medium leading-5 text-text-secondary">
          This context is used to accurately represent you in agent interactions.
        </p>
      </div>

      <div className="mt-10 space-y-12">
        <ScrollFloat direction="up" intensity={18}>
        <section className="space-y-6">
          <h3 className="text-[16px] font-semibold leading-6 text-text-primary">
            Personal Info
          </h3>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="profile-field">
              <span>Full Name</span>
              <input type="text" name="full_name" defaultValue={profile.fullName} />
            </label>
            <label className="profile-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                defaultValue={profile.email}
              />
            </label>
            <label className="profile-field">
              <span>Phone Number</span>
              <input type="tel" name="phone" defaultValue={profile.phone} />
            </label>
            <label className="profile-field">
              <span>Location</span>
              <input type="text" name="location" defaultValue={profile.location} />
            </label>
            <label className="profile-field">
              <span>LinkedIn URL</span>
              <input
                type="url"
                name="linkedin_url"
                defaultValue={profile.linkedinUrl}
              />
            </label>
            <label className="profile-field">
              <span>Portfolio / GitHub</span>
              <input
                type="url"
                name="portfolio_url"
                defaultValue={profile.portfolioUrl}
              />
            </label>
            <label className="profile-field md:max-w-[444px]">
              <span>Work Authorization</span>
              <select
                name="work_authorization"
                defaultValue={profile.workAuthorization}
              >
                <option value="" />
                <option value="citizen">Citizen</option>
                <option value="permanent_resident">Permanent Resident</option>
                <option value="visa_required">Visa Required</option>
              </select>
            </label>
          </div>
        </section>
        </ScrollFloat>

        <ScrollFloat direction="right" intensity={20}>
        <section className="space-y-6 border-t border-border pt-10">
          <h3 className="text-[16px] font-semibold leading-6 text-text-primary">
            Professional Info
          </h3>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="profile-field md:col-span-2">
              <span>Current/Recent Job Title</span>
              <input
                type="text"
                name="current_title"
                defaultValue={profile.currentTitle}
              />
            </label>
            <label className="profile-field">
              <span>Experience Level</span>
              <select
                name="experience_level"
                defaultValue={profile.experienceLevel}
              >
                <option value="" />
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </label>
            <label className="profile-field">
              <span>Years of Experience</span>
              <input
                type="number"
                name="years_experience"
                min="0"
                defaultValue={profile.yearsExperience}
              />
            </label>
            <div className="profile-field md:col-span-2">
              <span>Skills</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(event) => onSkillInputChange(event.target.value)}
                />
                <button
                  type="button"
                  className="profile-add-button"
                  onClick={onAddSkill}
                >
                  Add
                </button>
              </div>
              {skills.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      className="profile-tag"
                      onClick={() => onRemoveSkill(skill)}
                    >
                      {skill} <span aria-hidden="true">x</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="profile-field md:col-span-2">
              <span>Industries Worked In (Optional)</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={industryInput}
                  onChange={(event) => onIndustryInputChange(event.target.value)}
                />
                <button
                  type="button"
                  className="profile-add-button"
                  onClick={onAddIndustry}
                >
                  Add
                </button>
              </div>
              {industries.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {industries.map((industry) => (
                    <button
                      key={industry}
                      type="button"
                      className="profile-tag"
                      onClick={() => onRemoveIndustry(industry)}
                    >
                      {industry} <span aria-hidden="true">x</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
        </ScrollFloat>

        <ScrollFloat direction="left" intensity={20}>
        <section className="space-y-6 border-t border-border pt-10">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[16px] font-semibold leading-6 text-text-primary">
              Work Experience
            </h3>
            <button
              type="button"
              className="text-[14px] font-semibold leading-5 text-accent"
              onClick={onAddWorkExperience}
            >
              + Add role
            </button>
          </div>
          <div className="space-y-4">
            {workExperience.map((entry, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-surface-secondary p-5"
              >
                {workExperience.length > 1 ? (
                  <div className="mb-4 flex justify-end">
                    <button
                      type="button"
                      className="text-[12px] font-semibold leading-4 text-text-secondary transition-colors hover:text-accent"
                      onClick={() => onRemoveWorkExperience(index)}
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="profile-field">
                    <span>Company Name</span>
                    <input
                      type="text"
                      name={`work_company_${index}`}
                      defaultValue={entry.companyName}
                    />
                  </label>
                  <label className="profile-field">
                    <span>Job Title</span>
                    <input
                      type="text"
                      name={`work_title_${index}`}
                      defaultValue={entry.jobTitle}
                    />
                  </label>
                  <label className="profile-field">
                    <span>Start Date</span>
                    <input
                      type="text"
                      name={`work_start_${index}`}
                      defaultValue={entry.startDate}
                    />
                  </label>
                  <div className="profile-field">
                    <div className="flex items-center justify-between gap-4">
                      <span>End Date</span>
                      <label className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-[12px] font-medium normal-case leading-4 text-text-secondary">
                        <input
                          type="checkbox"
                          name={`work_current_${index}`}
                          defaultChecked={entry.currentlyWorking}
                          className="profile-checkbox"
                        />
                        Currently working here
                      </label>
                    </div>
                    <input
                      type="text"
                      name={`work_end_${index}`}
                      defaultValue={entry.endDate}
                    />
                  </div>
                  <label className="profile-field md:col-span-2">
                    <span>Key Responsibilities</span>
                    <textarea
                      name={`work_responsibilities_${index}`}
                      defaultValue={entry.responsibilities}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>
        </ScrollFloat>

        <ScrollFloat direction="up" intensity={18}>
        <section className="space-y-6 border-t border-border pt-10">
          <h3 className="text-[16px] font-semibold leading-6 text-text-primary">
            Education
          </h3>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="profile-field">
              <span>Highest Degree</span>
              <select
                name="education_highest_degree"
                defaultValue={profile.education.highestDegree}
              >
                <option value="" />
                <option value="high_school">High School</option>
                <option value="bachelors">Bachelor&apos;s Degree</option>
                <option value="masters">Master&apos;s Degree</option>
                <option value="doctorate">Doctorate</option>
              </select>
            </label>
            <label className="profile-field">
              <span>Field of Study</span>
              <input
                type="text"
                name="education_field_of_study"
                defaultValue={profile.education.fieldOfStudy}
              />
            </label>
            <label className="profile-field">
              <span>Institution Name</span>
              <input
                type="text"
                name="education_institution_name"
                defaultValue={profile.education.institutionName}
              />
            </label>
            <label className="profile-field">
              <span>Graduation Year</span>
              <input
                type="text"
                name="education_graduation_year"
                defaultValue={profile.education.graduationYear}
              />
            </label>
          </div>
        </section>
        </ScrollFloat>

        <ScrollFloat direction="right" intensity={20}>
        <section className="space-y-6 border-t border-border pt-10">
          <h3 className="text-[16px] font-semibold leading-6 text-text-primary">
            Job Preferences
          </h3>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="profile-field md:col-span-2">
              <span>Job Titles Seeking</span>
              <input
                type="text"
                name="job_titles_seeking"
                defaultValue={profile.jobTitlesSeeking.join(", ")}
              />
            </label>
            <label className="profile-field">
              <span>Remote Preference</span>
              <select
                name="remote_preference"
                defaultValue={profile.remotePreference}
              >
                <option value="" />
                <option value="any">Any</option>
                <option value="remote">Remote</option>
                <option value="onsite">Onsite</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>
            <label className="profile-field">
              <span>Salary Expectation (Optional)</span>
              <input
                type="text"
                name="salary_expectation"
                defaultValue={profile.salaryExpectation}
              />
            </label>
            <label className="profile-field">
              <span>Cover Letter Tone</span>
              <select
                name="cover_letter_tone"
                defaultValue={profile.coverLetterTone}
              >
                <option value="" />
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="enthusiastic">Enthusiastic</option>
              </select>
            </label>
            <label className="profile-field md:col-span-2">
              <span>Preferred Locations (Optional)</span>
              <input
                type="text"
                name="preferred_locations"
                defaultValue={profile.preferredLocations.join(", ")}
              />
            </label>
          </div>
        </section>
        </ScrollFloat>

        <ScrollFloat direction="up" intensity={16}>
        <div className="border-t border-border pt-8">
          {actionState.message ? (
            <p
              className="mb-4 text-center text-[13px] font-semibold leading-5 text-text-secondary"
              aria-live="polite"
            >
              {actionState.message}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={isPending}
            loading={isPending}
            loadingLabel="Saving..."
            variant="primary"
            size="lg"
            className="w-full"
          >
            Save Profile
          </Button>
        </div>
        </ScrollFloat>
      </div>
    </section>
  );
}
