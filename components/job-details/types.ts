export type CompanyResearchDossier = {
  companyOverview: string;
  techStack: string[];
  culture: string[];
  whyThisRole: string;
  yourEdge: string[];
  gapsToAddress: string[];
  smartQuestions: string[];
  interviewPrep: string[];
  sources: string[];
};

export type JobDetailsRecord = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  jobType: string | null;
  aboutRole: string;
  descriptionIsTruncated: boolean;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
  aboutCompany: string | null;
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
  externalApplyUrl: string;
  sourceUrl: string | null;
  foundAt: string;
  companyResearch: CompanyResearchDossier | null;
};
