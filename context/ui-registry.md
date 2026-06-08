# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Homepage Navbar

File: components/layout/Navbar.tsx
Last updated: 2026-06-08

| Property         | Class                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Background       | `bg-surface`                                                                                   |
| Border           | `border-b border-border`                                                                       |
| Border radius    | none                                                                                           |
| Text — primary   | `text-text-dark text-[14px] font-medium leading-5`                                             |
| Text — secondary | none                                                                                           |
| Spacing          | `h-16 px-6 gap-12`                                                                             |
| Hover state      | `hover:text-accent`, primary CTA via `.button-primary:hover` with subtle indigo-charcoal lift  |
| Shadow           | primary CTA uses `.button-primary` layered shadow                                              |
| Accent usage     | `text-accent` for link hover; focus ring uses `outline: 2px solid var(--color-accent)`        |

**Button pattern (Primary CTA):**
`.button-primary .button-primary-sm`

**Pattern notes:**
Top navigation uses a full-width white surface with a constrained 1440px inner row. Primary header CTAs use the shared compact charcoal button system defined in `app/globals.css` with 38px height, white text, a soft elevated shadow, and a slightly lighter indigo-charcoal hover.

### Homepage Footer

File: components/layout/Footer.tsx
Last updated: 2026-06-08

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-surface`                                       |
| Border           | `border-x border-border`                           |
| Border radius    | none                                               |
| Text — primary   | `supporting-text-tone text-[16px] font-normal leading-6` |
| Text — secondary | none                                               |
| Spacing          | `px-6 py-12 gap-8 md:px-16`                        |
| Hover state      | none                                               |
| Shadow           | none                                               |
| Accent usage     | none                                               |

**Pattern notes:**
Footer mirrors the navbar logo treatment and keeps links on the same restrained white surface used throughout the landing page. Footer nav text uses the exact same shared `supporting-text-tone` class as the final CTA supporting copy, including on hover.

### Homepage Hero

File: components/homepage/Hero.tsx
Last updated: 2026-06-08

| Property         | Class                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Background       | `soft-gradient-panel bg-surface-tertiary`                                                       |
| Border           | `border border-border border-t`                                                                |
| Border radius    | `rounded-xl` for preview image                                                                 |
| Text — primary   | `text-text-primary text-[48px] md:text-[64px] font-bold`                                       |
| Text — secondary | `supporting-text-tone text-[20px] font-normal leading-8`                                       |
| Spacing          | `px-6 pt-16 md:px-16 md:pt-20`                                                                 |
| Hover state      | primary via `.button-primary:hover` with subtle indigo-charcoal lift, secondary via `.button-secondary:hover` |
| Shadow           | shared button classes provide the CTA shadows                                                  |
| Accent usage     | `text-accent`, `border-accent`, focus ring via shared button classes                           |

**Button pattern (Primary):**
`.button-primary .button-primary-lg`

**Button pattern (Secondary):**
`.button-secondary .button-secondary-lg`

**Pattern notes:**
Landing-page hero sections use the global `soft-gradient-panel` helper with compact dark charcoal primary buttons, white text, and soft bordered secondary buttons. Both CTAs use the same 38px height and 14px type seen in the reference screenshot, and the primary hover shifts only slightly toward indigo-charcoal.

### Homepage Feature Text

File: components/homepage/FeatureText.tsx
Last updated: 2026-06-08

| Property         | Class                                                       |
| ---------------- | ----------------------------------------------------------- |
| Background       | none                                                        |
| Border           | `border-b border-border`, active `border-l-2 border-accent` |
| Border radius    | none                                                        |
| Text — primary   | `text-text-slate text-[22px] font-semibold leading-8`       |
| Text — secondary | `text-text-secondary text-[20px] font-normal leading-8`     |
| Spacing          | `px-8 py-9 md:px-16 pl-8`                                   |
| Hover state      | none                                                        |
| Shadow           | none                                                        |
| Accent usage     | `border-accent` for selected feature rail                   |

**Pattern notes:**
Feature rows are full-width bordered rows, not cards. The active row uses a slim accent rail like the design reference.

### Homepage Product Feature Sections

File: components/homepage/ProductFeatures.tsx
Last updated: 2026-06-08

| Property         | Class                                                       |
| ---------------- | ----------------------------------------------------------- |
| Background       | `bg-surface-muted` for image panels                         |
| Border           | `border-t border-b border-r border-l border-border`         |
| Border radius    | `rounded-xl` for product images                             |
| Text — primary   | `text-text-primary text-[48px] md:text-[56px] font-bold`    |
| Text — secondary | inherited from Homepage Feature Text                        |
| Spacing          | `px-8 py-16 md:px-16 md:py-24`, image panels `px-6 py-16`   |
| Hover state      | none                                                        |
| Shadow           | none                                                        |
| Accent usage     | inherited from Homepage Feature Text                        |

**Pattern notes:**
Landing feature sections use two-column bordered bands with image panels on muted surfaces and typography scaled to screenshot section headings.

### Homepage Testimonial

File: components/homepage/Testimonial.tsx
Last updated: 2026-06-08

| Property         | Class                                                            |
| ---------------- | ---------------------------------------------------------------- |
| Background       | none                                                             |
| Border           | none                                                             |
| Border radius    | `rounded-md` for avatar                                          |
| Text — primary   | `text-text-slate text-[32px] md:text-[40px] font-medium`         |
| Text — secondary | `text-text-secondary text-[14px] font-normal leading-5`          |
| Spacing          | `px-6 py-24 md:px-16`                                            |
| Hover state      | none                                                             |
| Shadow           | none                                                             |
| Accent usage     | `text-accent` for uppercase eyebrow                              |

**Pattern notes:**
Testimonials are centered, text-led sections with compact identity rows and no card container.

### Homepage Final CTA

File: components/homepage/FinalCta.tsx
Last updated: 2026-06-08

| Property         | Class                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Background       | `soft-gradient-panel diagonal-band`                                                            |
| Border           | `border-y border-border border-t`                                                              |
| Border radius    | none                                                                                           |
| Text — primary   | `text-text-primary text-[48px] md:text-[64px] font-bold`                                       |
| Text — secondary | `text-text-secondary text-[20px] font-normal leading-8`                                        |
| Spacing          | `px-6 py-20 md:px-16 md:py-28`                                                                 |
| Hover state      | primary via `.button-primary:hover` with subtle indigo-charcoal lift, secondary via `.button-secondary:hover` |
| Shadow           | shared button classes provide the CTA shadows                                                  |
| Accent usage     | focus ring uses accent; secondary hover border softly picks up accent                          |

**Button patterns:**
Same as Hero section — `.button-primary.button-primary-lg` and `.button-secondary.button-secondary-lg`.

**Pattern notes:**
Final CTA reuses the same button styling and gradient treatment as the hero section for consistency. Supporting copy uses the shared `supporting-text-tone` class from the reference image. Diagonal bands are global token-based helpers used only as visual separators between sections.

### Shared Supporting Text

File: app/globals.css
Last updated: 2026-06-08

| Property         | Class                    |
| ---------------- | ------------------------ |
| Background       | none                     |
| Border           | none                     |
| Border radius    | none                     |
| Text — primary   | `.supporting-text-tone`  |
| Text — secondary | none                     |
| Spacing          | none                     |
| Hover state      | none                     |
| Shadow           | none                     |
| Accent usage     | none                     |

**Pattern notes:**
Use `.supporting-text-tone` anywhere the landing page needs the soft gray supporting copy color. Final CTA body copy and footer navigation should both use this exact class.

### Shared Buttons

File: app/globals.css
Last updated: 2026-06-08

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `.button-primary`, `.button-secondary`                                |
| Border           | `.button-primary` uses a subtle surface-tinted border; `.button-secondary` uses token border; focus uses accent outline |
| Border radius    | `border-radius: var(--radius-md)`                                     |
| Text — primary   | `.button-primary { color: var(--color-surface) }`                     |
| Text — secondary | `.button-secondary { color: var(--color-text-slate) }`                |
| Spacing          | `.button-primary-sm`, `.button-primary-lg`, `.button-secondary-lg`    |
| Hover state      | `.button-primary:hover`, `.button-secondary:hover`                    |
| Shadow           | layered CTA shadows in `.button-primary` and `.button-secondary`      |
| Accent usage     | focus rings and secondary hover border pick up `--color-accent`       |

**Pattern notes:**
Use shared global button classes for every landing-page CTA instead of repeating raw utility strings. The correct landing-page button direction is compact 38px-tall charcoal primary buttons with white text, a slightly lighter indigo-charcoal hover, and compact bright-surface secondary buttons with subtle borders.
