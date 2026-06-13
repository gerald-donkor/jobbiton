import { createInsforgeServer } from "@/lib/insforge-server";

export async function logAgentMessage({
  jobId,
  level,
  message,
  runId,
  userId,
}: {
  jobId?: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
  runId: string;
  userId: string;
}): Promise<void> {
  try {
    const insforge = await createInsforgeServer();
    const { error } = await insforge.database.from("agent_logs").insert([
      {
        run_id: runId,
        user_id: userId,
        job_id: jobId ?? null,
        level,
        message,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("[agent-logs] Unable to write agent log", error);
    }
  } catch (error) {
    console.error("[agent-logs] Unable to write agent log", error);
  }
}
