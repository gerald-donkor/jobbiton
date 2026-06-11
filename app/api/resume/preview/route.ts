import mammoth from "mammoth";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  canTextPreviewResumeFormat,
  getResumeFileFormat,
  getResumeFormatByPath,
  getResumeStoragePathFromUrl,
  MAX_RESUME_SIZE,
  RESUME_BUCKET,
  type ResumeFileFormat,
} from "@/lib/resume-files";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

type ResumeBufferResult = {
  buffer: Uint8Array;
  format: ResumeFileFormat;
};

function jsonResponse(
  body: ResumePreviewResponse,
  status: number,
): NextResponse<ResumePreviewResponse> {
  return NextResponse.json(body, { status });
}

function getResumeFile(formData: FormData): File | null {
  const file = formData.get("resume");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return file;
}

async function readSelectedResume(file: File): Promise<ResumeBufferResult | null> {
  const format = getResumeFileFormat(file);

  if (!format || file.size > MAX_RESUME_SIZE) {
    return null;
  }

  return {
    buffer: new Uint8Array(await file.arrayBuffer()),
    format,
  };
}

async function readSavedResume(userId: string): Promise<ResumeBufferResult | null> {
  const insforge = await createInsforgeServer();
  const { data: profile, error: profileError } = await insforge.database
    .from("profiles")
    .select("resume_pdf_url")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("[api/resume/preview] Profile lookup failed", profileError);
    return null;
  }

  const resumePath =
    typeof profile?.resume_pdf_url === "string"
      ? getResumeStoragePathFromUrl(profile.resume_pdf_url)
      : "";
  const format = resumePath ? getResumeFormatByPath(resumePath) : null;

  if (!resumePath || !format) {
    return null;
  }

  const { data: resumeBlob, error } = await insforge.storage
    .from(RESUME_BUCKET)
    .download(resumePath);

  if (error || !resumeBlob || resumeBlob.size > MAX_RESUME_SIZE) {
    console.error("[api/resume/preview] Saved resume download failed", error);
    return null;
  }

  return {
    buffer: new Uint8Array(await resumeBlob.arrayBuffer()),
    format,
  };
}

async function readPreviewText(resume: ResumeBufferResult): Promise<string | null> {
  if (resume.format.extension === "txt") {
    return new TextDecoder().decode(resume.buffer).trim();
  }

  if (resume.format.extension === "docx") {
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(resume.buffer),
    });

    return result.value.trim();
  }

  return null;
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ResumePreviewResponse>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return jsonResponse(
        { success: false, error: "Please sign in again before previewing your resume." },
        401,
      );
    }

    const formData = await req.formData();
    const selectedResume = getResumeFile(formData);
    const resume = selectedResume
      ? await readSelectedResume(selectedResume)
      : await readSavedResume(user.id);

    if (!resume) {
      return jsonResponse(
        { success: false, error: "We could not load this resume preview." },
        400,
      );
    }

    if (!canTextPreviewResumeFormat(resume.format)) {
      return jsonResponse(
        { success: false, error: "Preview is not available for this file type." },
        400,
      );
    }

    const text = await readPreviewText(resume);

    if (!text) {
      return jsonResponse(
        { success: false, error: "We could not read text from this resume." },
        400,
      );
    }

    return jsonResponse({ success: true, data: { text } }, 200);
  } catch (error) {
    console.error("[api/resume/preview]", error);

    return jsonResponse(
      { success: false, error: "We could not preview this resume." },
      500,
    );
  }
}
