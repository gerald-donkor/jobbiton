import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createInsforgeServer } from "@/lib/insforge-server";

const RESUME_BUCKET = "resumes";

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
    const resumePath = `${user.id}/resume.pdf`;
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

    return new Response(resumeBlob, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": 'inline; filename="resume.pdf"',
        "Content-Type": "application/pdf",
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
