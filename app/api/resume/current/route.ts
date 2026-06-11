import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  getResumeFormatByPath,
  getResumeStoragePathFromUrl,
  RESUME_BUCKET,
} from "@/lib/resume-files";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Please sign in to view your resume." },
        { status: 401 },
      );
    }

    const insforge = await createInsforgeServer();
    const { data: profile, error: profileError } = await insforge.database
      .from("profiles")
      .select("resume_pdf_url")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[api/resume/current] Profile lookup failed", profileError);
      return NextResponse.json(
        { success: false, error: "Resume not found." },
        { status: 404 },
      );
    }

    const resumePath =
      typeof profile?.resume_pdf_url === "string"
        ? getResumeStoragePathFromUrl(profile.resume_pdf_url)
        : "";

    if (!resumePath) {
      return NextResponse.json(
        { success: false, error: "Resume not found." },
        { status: 404 },
      );
    }

    const { data: resumeBlob, error } = await insforge.storage
      .from(RESUME_BUCKET)
      .download(resumePath);

    if (error || !resumeBlob) {
      console.error("[api/resume/current] Resume download failed", error);
      return NextResponse.json(
        { success: false, error: "Resume not found." },
        { status: 404 },
      );
    }

    const resumeFormat = getResumeFormatByPath(resumePath);
    const contentType = resumeFormat?.contentType ?? "application/octet-stream";
    const fileName = `resume.${resumeFormat?.extension ?? "download"}`;

    return new Response(resumeBlob, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("[api/resume/current]", error);
    return NextResponse.json(
      { success: false, error: "We could not load your resume." },
      { status: 500 },
    );
  }
}
