import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { researchCompanyForUser } from "@/agent/research";
import type { CompanyResearchResponse } from "@/agent/types";
import { getCurrentUser } from "@/lib/auth";
import { capturePostHogServerEvent } from "@/lib/posthog-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestSchema = z.object({
  jobId: z.string().trim().min(1),
});

function jsonResponse(
  body: CompanyResearchResponse,
  status: number,
): NextResponse<CompanyResearchResponse> {
  return NextResponse.json(body, { status });
}

async function readJsonBody(request: NextRequest): Promise<unknown | null> {
  try {
    return await request.json();
  } catch (error) {
    console.error("[agent/research] Invalid JSON request body", error);
    return null;
  }
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<CompanyResearchResponse>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return jsonResponse(
        { success: false, error: "Please sign in before researching a company." },
        401,
      );
    }

    const requestBody = await readJsonBody(request);

    if (!requestBody) {
      return jsonResponse(
        { success: false, error: "Choose a saved job to research." },
        400,
      );
    }

    const body = requestSchema.safeParse(requestBody);

    if (!body.success) {
      return jsonResponse(
        { success: false, error: "Choose a saved job to research." },
        400,
      );
    }

    const result = await researchCompanyForUser({
      jobId: body.data.jobId,
      userId: user.id,
    });

    if (!result.success) {
      return jsonResponse(
        { success: false, error: result.error },
        result.statusCode ?? 500,
      );
    }

    await capturePostHogServerEvent({
      name: "company_researched",
      distinctId: user.id,
      properties: {
        userId: user.id,
        jobId: body.data.jobId,
        company: result.company,
      },
    });

    revalidatePath(`/find-jobs/${body.data.jobId}`);

    return jsonResponse(
      {
        success: true,
        data: {
          dossier: result.dossier,
        },
      },
      200,
    );
  } catch (error) {
    console.error("[agent/research]", error);

    return jsonResponse(
      { success: false, error: "Internal server error" },
      500,
    );
  }
}
