const skillTags = ["React", "TypeScript", "Next.js", "Tailwind CSS"];

export function ProfileInformationForm() {
  return (
    <section className="rounded-xl border border-border bg-surface px-8 py-8 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
      <div className="border-b border-border pb-5">
        <h2 className="text-[22px] font-semibold leading-8 text-text-primary">
          Profile Information
        </h2>
        <p className="mt-1 text-[13px] font-medium leading-5 text-text-secondary">
          This context is used to accurately represent you in agent interactions.
        </p>
      </div>

      <form className="mt-10 space-y-12">
        <section className="space-y-6">
          <h3 className="text-[16px] font-semibold leading-6 text-text-primary">
            Personal Info
          </h3>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="profile-field">
              <span>Full Name</span>
              <input type="text" defaultValue="Faizan Ali" />
            </label>
            <label className="profile-field">
              <span>Email</span>
              <input type="email" defaultValue="faizan@jsmastery.pro" readOnly />
            </label>
            <label className="profile-field">
              <span>Phone Number</span>
              <input type="tel" placeholder="+1 (555) 000-0000" />
            </label>
            <label className="profile-field">
              <span>Location</span>
              <input type="text" placeholder="City, Country" />
            </label>
            <label className="profile-field">
              <span>LinkedIn URL</span>
              <input type="url" defaultValue="https://linkedin.com/in/faizan" />
            </label>
            <label className="profile-field">
              <span>Portfolio / GitHub</span>
              <input type="url" defaultValue="https://github.com/jsmastery" />
            </label>
            <label className="profile-field md:max-w-[444px]">
              <span>Work Authorization</span>
              <select defaultValue="citizen">
                <option value="citizen">Citizen</option>
                <option value="permanent_resident">Permanent Resident</option>
                <option value="visa_required">Visa Required</option>
              </select>
            </label>
          </div>
        </section>

        <section className="space-y-6 border-t border-border pt-10">
          <h3 className="text-[16px] font-semibold leading-6 text-text-primary">
            Professional Info
          </h3>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="profile-field md:col-span-2">
              <span>Current/Recent Job Title</span>
              <input type="text" defaultValue="Frontend Engineer" />
            </label>
            <label className="profile-field">
              <span>Experience Level</span>
              <select defaultValue="junior">
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </label>
            <label className="profile-field">
              <span>Years of Experience</span>
              <input type="number" defaultValue="4" />
            </label>
            <div className="profile-field md:col-span-2">
              <span>Skills</span>
              <div className="flex gap-2">
                <input type="text" placeholder="Add a skill" />
                <button type="button" className="profile-add-button">
                  Add
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {skillTags.map((skill) => (
                  <span key={skill} className="profile-tag">
                    {skill} <span aria-hidden="true">x</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="profile-field md:col-span-2">
              <span>Industries Worked In (Optional)</span>
              <div className="flex gap-2">
                <input type="text" placeholder="E.g. FinTech, Healthcare" />
                <button type="button" className="profile-add-button">
                  Add
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 border-t border-border pt-10">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[16px] font-semibold leading-6 text-text-primary">
              Work Experience
            </h3>
            <button
              type="button"
              className="text-[14px] font-semibold leading-5 text-accent"
            >
              + Add role
            </button>
          </div>
          <div className="rounded-lg border border-border bg-surface-secondary p-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="profile-field">
                <span>Company Name</span>
                <input type="text" defaultValue="Vercel" />
              </label>
              <label className="profile-field">
                <span>Job Title</span>
                <input type="text" defaultValue="Frontend Engineer" />
              </label>
              <label className="profile-field">
                <span>Start Date</span>
                <input type="text" defaultValue="January 2022" />
              </label>
              <div className="profile-field">
                <div className="flex items-center justify-between gap-4">
                  <span>End Date</span>
                  <label className="inline-flex items-center gap-2 text-[12px] font-medium normal-case leading-4 text-text-secondary">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="size-4 accent-[var(--color-info-medium)]"
                    />
                    Currently working here
                  </label>
                </div>
                <input type="text" placeholder="---------- ----" />
              </div>
              <label className="profile-field md:col-span-2">
                <span>Key Responsibilities</span>
                <textarea defaultValue="Built Next.js features and optimized web vitals. Led a team of 3 developers." />
              </label>
            </div>
          </div>
        </section>

        <section className="space-y-6 border-t border-border pt-10">
          <h3 className="text-[16px] font-semibold leading-6 text-text-primary">
            Education
          </h3>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="profile-field">
              <span>Highest Degree</span>
              <select defaultValue="high_school">
                <option value="high_school">High School</option>
                <option value="bachelors">Bachelor&apos;s Degree</option>
                <option value="masters">Master&apos;s Degree</option>
                <option value="doctorate">Doctorate</option>
              </select>
            </label>
            <label className="profile-field">
              <span>Field of Study</span>
              <input type="text" defaultValue="Computer Science" />
            </label>
            <label className="profile-field">
              <span>Institution Name</span>
              <input type="text" placeholder="E.g. State University" />
            </label>
            <label className="profile-field">
              <span>Graduation Year</span>
              <input type="text" placeholder="YYYY" />
            </label>
          </div>
        </section>

        <section className="space-y-6 border-t border-border pt-10">
          <h3 className="text-[16px] font-semibold leading-6 text-text-primary">
            Job Preferences
          </h3>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="profile-field md:col-span-2">
              <span>Job Titles Seeking</span>
              <input type="text" defaultValue="Frontend Engineer, React Developer" />
            </label>
            <label className="profile-field">
              <span>Remote Preference</span>
              <select defaultValue="any">
                <option value="any">Any</option>
                <option value="remote">Remote</option>
                <option value="onsite">Onsite</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>
            <label className="profile-field">
              <span>Salary Expectation (Optional)</span>
              <input type="text" placeholder="E.g. $120k+" />
            </label>
            <label className="profile-field md:col-span-2">
              <span>Preferred Locations (Optional)</span>
              <input type="text" placeholder="E.g. New York, London" />
            </label>
          </div>
        </section>

        <div className="border-t border-border pt-8">
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center rounded-md bg-accent px-5 text-[14px] font-semibold leading-5 text-accent-foreground transition-colors hover:bg-accent-dark"
          >
            Save Profile
          </button>
        </div>
      </form>
    </section>
  );
}
