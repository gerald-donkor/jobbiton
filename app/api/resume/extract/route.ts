import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";
import { getCurrentUser } from "@/lib/auth";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  extractProfileFromResumeText,
  ResumeExtractionProviderError,
} from "@/lib/resume-extraction";
import {
  getResumeFileFormat,
  getResumeFormatByPath,
  getResumeStoragePathFromUrl,
  MAX_RESUME_SIZE,
  RESUME_BUCKET,
  type ResumeFileFormat,
} from "@/lib/resume-files";

const MIN_RESUME_TEXT_LENGTH = 120;
process.env.PDF2JSON_DISABLE_LOGS = "1";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ResumeExtractResponse =
  | {
      success: true;
      data: {
        profile: Awaited<ReturnType<typeof extractProfileFromResumeText>>;
      };
    }
  | {
      success: false;
      error: string;
    };

function jsonResponse(
  body: ResumeExtractResponse,
  status: number,
): NextResponse<ResumeExtractResponse> {
  return NextResponse.json(body, { status });
}

function describeError(error: unknown): Record<string, unknown> {
  if (error instanceof ResumeExtractionProviderError) {
    return {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      cause: describeError(error.cause),
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      cause: error.cause,
    };
  }

  return { error };
}

function getPdfParserError(errorData: { parserError: Error } | Error): Error {
  if (errorData instanceof Error) {
    return errorData;
  }

  return errorData.parserError;
}

function getResumeFile(formData: FormData): File | null {
  const file = formData.get("resume");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return file;
}

type ResumeBufferResult = {
  buffer: Uint8Array;
  format: ResumeFileFormat;
};

async function readSelectedResumeBuffer(
  file: File,
): Promise<ResumeBufferResult | null> {
  const format = getResumeFileFormat(file);

  if (!format) {
    return null;
  }

  if (file.size > MAX_RESUME_SIZE) {
    return null;
  }

  return {
    buffer: new Uint8Array(await file.arrayBuffer()),
    format,
  };
}

async function readSavedResumeBuffer(userId: string): Promise<ResumeBufferResult | null> {
  const insforge = await createInsforgeServer();
  const { data: profile, error: profileError } = await insforge.database
    .from("profiles")
    .select("resume_pdf_url")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("[api/resume/extract] Profile lookup failed", profileError);
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

  if (error || !resumeBlob) {
    console.error("[api/resume/extract] Saved resume download failed", error);
    return null;
  }

  if (resumeBlob.size > MAX_RESUME_SIZE) {
    return null;
  }

  return {
    buffer: new Uint8Array(await resumeBlob.arrayBuffer()),
    format,
  };
}

async function extractTextFromPdf(pdfBuffer: Uint8Array): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const parser = new PDFParser(null, true);
    let isSettled = false;

    function cleanup(): void {
      parser.removeAllListeners();
      parser.destroy();
    }

    parser.on("pdfParser_dataError", (errorData) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      cleanup();
      reject(getPdfParserError(errorData));
    });

    parser.on("pdfParser_dataReady", () => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      const text = parser.getRawTextContent().trim();
      cleanup();
      resolve(text);
    });

    try {
      parser.parseBuffer(Buffer.from(pdfBuffer), 0);
    } catch (error) {
      if (isSettled) {
        return;
      }

      isSettled = true;
      cleanup();
      reject(error);
    }
  });
}

function extractTextFromPlainText(buffer: Uint8Array): string {
  return new TextDecoder().decode(buffer).trim();
}

async function extractTextFromResume(
  resumeBuffer: ResumeBufferResult,
): Promise<string | null> {
  if (resumeBuffer.format.extension === "pdf") {
    return extractTextFromPdf(resumeBuffer.buffer);
  }

  if (resumeBuffer.format.extension === "txt") {
    return extractTextFromPlainText(resumeBuffer.buffer);
  }

  return null;
}

export async function POST(req: NextRequest): Promise<NextResponse<ResumeExtractResponse>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return jsonResponse(
        { success: false, error: "Please sign in again before extracting your resume." },
        401,
      );
    }

    const formData = await req.formData();
    const selectedResume = getResumeFile(formData);
    const resumeBuffer = selectedResume
      ? await readSelectedResumeBuffer(selectedResume)
      : await readSavedResumeBuffer(user.id);

    if (!resumeBuffer) {
      return jsonResponse(
        {
          success: false,
          error: "Please upload a PDF, DOC, DOCX, TXT, or RTF resume that is 2MB or smaller.",
        },
        400,
      );
    }

    const resumeText = await extractTextFromResume(resumeBuffer);

    if (resumeText === null) {
      return jsonResponse(
        {
          success: false,
          error: "Resume extraction currently supports PDF and TXT files.",
        },
        400,
      );
    }

    if (resumeText.length < MIN_RESUME_TEXT_LENGTH) {
      return jsonResponse(
        {
          success: false,
          error: "Could not extract text from this file. Please try a different resume.",
        },
        400,
      );
    }

    const profile = await extractProfileFromResumeText(resumeText);

    return jsonResponse({ success: true, data: { profile } }, 200);
  } catch (error) {
    console.error("[api/resume/extract]", describeError(error));

    if (error instanceof ResumeExtractionProviderError) {
      return jsonResponse(
        { success: false, error: error.userMessage },
        error.statusCode,
      );
    }

    return jsonResponse(
      { success: false, error: "We could not extract your resume. Please try again." },
      500,
    );
  }
}
