import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  generateResumeContent,
  ResumeGenerationProviderError,
} from "@/lib/resume-generation";
import { renderResumePdfBuffer } from "@/lib/resume-pdf";
import {
  calculateProfileCompletion,
  normalizeProfileRow,
  type ProfileValues,
} from "@/lib/profile";
import { describeError, replaceUserResume } from "@/lib/resume-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ResumeGenerateResponse =
  | {
      success: true;
      data: {
        resumePdfUrl: string;
      };
    }
  | {
      success: false;
      error: string;
    };

function jsonResponse(
  body: ResumeGenerateResponse,
  status: number,
): NextResponse<ResumeGenerateResponse> {
  return NextResponse.json(body, { status });
}

function hasUsefulProfileData(profile: ProfileValues): boolean {
  const completion = calculateProfileCompletion(profile);

  return (
    completion.isComplete &&
    profile.workExperience.some(
      (entry) =>
        entry.companyName.trim() ||
        entry.jobTitle.trim() ||
        entry.responsibilities.trim(),
    )
  );
}

export async function POST(): Promise<NextResponse<ResumeGenerateResponse>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return jsonResponse(
        { success: false, error: "Please sign in again before generating your resume." },
        401,
      );
    }

    const insforge = await createInsforgeServer();
    const { data: profileRow, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[api/resume/generate] Profile lookup failed", profileError);
      return jsonResponse(
        { success: false, error: "We could not load your profile. Please try again." },
        500,
      );
    }

    const profile = normalizeProfileRow(profileRow, user);

    if (!hasUsefulProfileData(profile)) {
      return jsonResponse(
        {
          success: false,
          error:
            "Save a complete profile with work experience before generating a resume.",
        },
        400,
      );
    }

    const generatedContent = await generateResumeContent(profile);
    const pdfBuffer = await renderResumePdfBuffer({
      content: generatedContent,
      profile,
    });
    const pdfBlob = new Blob([new Uint8Array(pdfBuffer)], {
      type: "application/pdf",
    });
    const uploadResult = await replaceUserResume({
      file: pdfBlob,
      extension: "pdf",
      insforge,
      logPrefix: "[api/resume/generate]",
      userId: user.id,
    });

    if (!uploadResult.success) {
      return jsonResponse({ success: false, error: uploadResult.error }, 500);
    }

    const { error: saveError } = await insforge.database.from("profiles").upsert([
      {
        id: user.id,
        resume_pdf_url: uploadResult.resumePdfUrl,
        updated_at: new Date().toISOString(),
      },
    ]);

    if (saveError) {
      console.error(
        "[api/resume/generate] Profile resume URL save failed",
        describeError(saveError),
      );
      return jsonResponse(
        {
          success: false,
          error:
            "We generated your resume but could not save it to your profile. Please try again.",
        },
        500,
      );
    }

    revalidatePath("/profile");

    return jsonResponse(
      {
        success: true,
        data: {
          resumePdfUrl: uploadResult.resumePdfUrl,
        },
      },
      200,
    );
  } catch (error) {
    console.error("[api/resume/generate]", describeError(error));

    if (error instanceof ResumeGenerationProviderError) {
      return jsonResponse(
        { success: false, error: error.userMessage },
        error.statusCode,
      );
    }

    return jsonResponse(
      { success: false, error: "We could not generate your resume. Please try again." },
      500,
    );
  }
}
