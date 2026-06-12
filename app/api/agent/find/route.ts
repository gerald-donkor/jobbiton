import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { discoverJobsForUser } from "@/agent/adzuna";
import type { FindJobsSearchResponse } from "@/agent/types";
import { getCurrentUser } from "@/lib/auth";
import { capturePostHogServerEvent } from "@/lib/posthog-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestSchema = z.object({
  jobTitle: z.string().trim().min(1).max(120),
  location: z.string().trim().max(120).optional().default(""),
});

function jsonResponse(
  body: FindJobsSearchResponse,
  status: number,
): NextResponse<FindJobsSearchResponse> {
  return NextResponse.json(body, { status });
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<FindJobsSearchResponse>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return jsonResponse(
        { success: false, error: "Please sign in before searching for jobs." },
        401,
      );
    }

    const body = requestSchema.safeParse(await request.json());

    if (!body.success) {
      return jsonResponse(
        { success: false, error: "Enter a job title to start your search." },
        400,
      );
    }

    const { jobTitle, location } = body.data;

    await capturePostHogServerEvent({
      name: "job_search_started",
      distinctId: user.id,
      properties: {
        userId: user.id,
        jobTitle,
        location,
      },
    });

    const result = await discoverJobsForUser({
      jobTitle,
      location,
      userId: user.id,
    });

    if (!result.success) {
      return jsonResponse(
        { success: false, error: result.error },
        result.statusCode ?? 500,
      );
    }

    revalidatePath("/find-jobs");

    return jsonResponse(
      {
        success: true,
        data: {
          runId: result.runId,
          jobs: result.jobs,
          totalFound: result.totalFound,
          strongMatchCount: result.strongMatchCount,
        },
      },
      200,
    );
  } catch (error) {
    console.error("[agent/find]", error);

    return jsonResponse(
      { success: false, error: "Internal server error" },
      500,
    );
  }
}
