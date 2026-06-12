import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { GeneratedResumeContent } from "@/lib/resume-generation";
import type { ProfileValues } from "@/lib/profile";

type ResumePdfDocumentProps = {
  content: GeneratedResumeContent;
  profile: ProfileValues;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingRight: 48,
    paddingBottom: 40,
    paddingLeft: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
    color: "black",
  },
  header: {
    marginBottom: 22,
  },
  identityBlock: {
    marginBottom: 10,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    lineHeight: 1.1,
    marginBottom: 6,
  },
  headline: {
    fontSize: 12,
    color: "dimgray",
    lineHeight: 1.25,
  },
  contact: {
    fontSize: 9,
    color: "dimgray",
    lineHeight: 1.3,
    marginBottom: 1,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 10,
  },
  skillsText: {
    fontSize: 9.5,
    lineHeight: 1.45,
  },
  roleBlock: {
    marginBottom: 14,
  },
  roleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  roleIdentity: {
    width: 360,
  },
  roleTitle: {
    fontSize: 10.5,
    fontWeight: "bold",
  },
  roleDates: {
    fontSize: 9,
    color: "dimgray",
    textAlign: "right",
    width: 130,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bulletMarker: {
    width: 12,
    fontSize: 9.5,
  },
  bulletText: {
    fontSize: 9.5,
    width: 432,
  },
  educationDegree: {
    fontSize: 10.5,
    fontWeight: "bold",
    marginBottom: 2,
  },
  educationMeta: {
    fontSize: 9.5,
    color: "dimgray",
  },
});

function getContactLines(profile: ProfileValues): string[] {
  const primaryContact = [profile.email, profile.phone, profile.location]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" | ");
  const links = [profile.linkedinUrl, profile.portfolioUrl]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" | ");

  return [primaryContact, links].filter(Boolean);
}

function formatRoleDates({
  currentlyWorking,
  endDate,
  startDate,
}: {
  currentlyWorking: boolean;
  endDate: string;
  startDate: string;
}): string {
  const normalizedEndDate = currentlyWorking ? "Present" : endDate;

  if (startDate && normalizedEndDate) {
    return `${startDate} - ${normalizedEndDate}`;
  }

  return startDate || normalizedEndDate;
}

function formatEducation(content: GeneratedResumeContent): string {
  const degreeParts = [
    content.education.highestDegree,
    content.education.fieldOfStudy,
  ]
    .map((part) => part.trim())
    .filter(Boolean);

  return degreeParts.join(", ");
}

function ResumePdfDocument({ content, profile }: ResumePdfDocumentProps) {
  const contactLines = getContactLines(profile);
  const educationDegree = formatEducation(content);
  const educationMeta = [
    content.education.institutionName.trim(),
    content.education.graduationYear.trim(),
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.identityBlock}>
            <Text style={styles.name}>{profile.fullName}</Text>
            <Text style={styles.headline}>{content.headline}</Text>
          </View>
          {contactLines.map((contactLine) => (
            <Text key={contactLine} style={styles.contact}>
              {contactLine}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.bodyText}>{content.summary}</Text>
        </View>

        {content.skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skillsText}>{content.skills.join(" • ")}</Text>
          </View>
        ) : null}

        {content.workExperience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {content.workExperience.map((entry) => (
              <View
                key={`${entry.companyName}-${entry.jobTitle}-${entry.startDate}`}
                style={styles.roleBlock}
              >
                <View style={styles.roleHeader}>
                  <View style={styles.roleIdentity}>
                    <Text style={styles.roleTitle}>
                      {[entry.jobTitle, entry.companyName]
                        .map((part) => part.trim())
                        .filter(Boolean)
                        .join(" - ")}
                    </Text>
                  </View>
                  <Text style={styles.roleDates}>{formatRoleDates(entry)}</Text>
                </View>
                {entry.responsibilities.map((responsibility) => (
                  <View key={responsibility} style={styles.bulletRow}>
                    <Text style={styles.bulletMarker}>•</Text>
                    <Text style={styles.bulletText}>{responsibility}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {educationDegree || educationMeta.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {educationDegree ? (
              <Text style={styles.educationDegree}>{educationDegree}</Text>
            ) : null}
            {educationMeta.length > 0 ? (
              <Text style={styles.educationMeta}>{educationMeta.join(" • ")}</Text>
            ) : null}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export async function renderResumePdfBuffer({
  content,
  profile,
}: ResumePdfDocumentProps): Promise<Buffer> {
  return renderToBuffer(<ResumePdfDocument content={content} profile={profile} />);
}
