import Browserbase from "@browserbasehq/sdk";

export type BrowserbaseResearchSession = {
  id: string;
};

export async function createBrowserbaseResearchSession(): Promise<BrowserbaseResearchSession> {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;

  if (!apiKey || !projectId) {
    throw new Error("Browserbase is not configured.");
  }

  const browserbase = new Browserbase({ apiKey });
  const session = await browserbase.sessions.create({
    projectId,
    timeout: 120,
  });

  return { id: session.id };
}
