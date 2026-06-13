import { Stagehand } from "@browserbasehq/stagehand";

export function createResearchStagehand({
  sessionId,
}: {
  sessionId: string;
}): Stagehand {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !projectId) {
    throw new Error("Browserbase is not configured.");
  }

  if (!openRouterApiKey && !geminiApiKey) {
    throw new Error("Company research AI is not configured.");
  }

  const model = openRouterApiKey
    ? {
        modelName: "openai/gpt-4o",
        apiKey: openRouterApiKey,
        baseURL: "https://openrouter.ai/api/v1",
      }
    : {
        modelName: "gemini-2.0-flash",
        apiKey: geminiApiKey,
      };

  return new Stagehand({
    env: "BROWSERBASE",
    apiKey,
    projectId,
    browserbaseSessionID: sessionId,
    model,
    disablePino: true,
  });
}
