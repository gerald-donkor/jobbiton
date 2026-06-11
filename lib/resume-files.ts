export const MAX_RESUME_SIZE = 2 * 1024 * 1024;
export const RESUME_BUCKET = "resumes";
export const RESUME_ACCEPT =
  ".pdf,.doc,.docx,.txt,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/rtf,text/rtf";

const resumeFormats = [
  {
    extension: "pdf",
    label: "PDF",
    contentType: "application/pdf",
    mimeTypes: ["application/pdf"],
  },
  {
    extension: "doc",
    label: "DOC",
    contentType: "application/msword",
    mimeTypes: ["application/msword"],
  },
  {
    extension: "docx",
    label: "DOCX",
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  {
    extension: "txt",
    label: "TXT",
    contentType: "text/plain",
    mimeTypes: ["text/plain"],
  },
  {
    extension: "rtf",
    label: "RTF",
    contentType: "application/rtf",
    mimeTypes: ["application/rtf", "text/rtf"],
  },
] as const;

export type ResumeFileFormat = (typeof resumeFormats)[number];

export const RESUME_STORAGE_PATHS = resumeFormats.map(
  (format) => `resume.${format.extension}`,
);

function getFileExtension(fileName: string): string {
  const segments = fileName.toLowerCase().split(".");

  return segments.length > 1 ? segments[segments.length - 1] : "";
}

export function getResumeFileFormat(file: File): ResumeFileFormat | null {
  const fileExtension = getFileExtension(file.name);

  return (
    resumeFormats.find(
      (format) =>
        format.extension === fileExtension ||
        format.mimeTypes.some((mimeType) => mimeType === file.type),
    ) ?? null
  );
}

export function getResumeFormatByPath(path: string): ResumeFileFormat | null {
  const extension = path.toLowerCase().split(".").pop() ?? "";

  return resumeFormats.find((format) => format.extension === extension) ?? null;
}

export function getResumeStoragePath(userId: string, extension: string): string {
  return `${userId}/resume.${extension}`;
}

export function getUserResumeStoragePaths(userId: string): string[] {
  return RESUME_STORAGE_PATHS.map((path) => `${userId}/${path}`);
}

export function getResumeStoragePathFromUrl(url: string): string {
  if (!url) {
    return "";
  }

  const encodedKey = url.split("/objects/")[1]?.split("?")[0];

  return encodedKey ? decodeURIComponent(encodedKey) : "";
}

export function getResumeFormatByUrl(url: string): ResumeFileFormat | null {
  const storagePath = getResumeStoragePathFromUrl(url);

  return storagePath ? getResumeFormatByPath(storagePath) : null;
}

export function canEmbedResumeFormat(format: ResumeFileFormat | null): boolean {
  return Boolean(format && format.extension === "pdf");
}

export function canTextPreviewResumeFormat(
  format: ResumeFileFormat | null,
): boolean {
  return Boolean(format && (format.extension === "txt" || format.extension === "docx"));
}

export function canExtractResumeFormat(format: ResumeFileFormat | null): boolean {
  return Boolean(format && (format.extension === "pdf" || format.extension === "txt"));
}
