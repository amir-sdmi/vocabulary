import { get, put } from "@vercel/blob";
import { PracticeAttempt } from "@/app/features/vocabulary/types";

const ATTEMPTS_BLOB_PATHNAME = "vocabulary-attempts-v1";

function userAttemptsPath(userId: string): string {
  const normalized = userId.trim().toLowerCase().replaceAll(/[^a-z0-9._-]/g, "_");
  return `${ATTEMPTS_BLOB_PATHNAME}/${normalized}.json`;
}

async function readBlobJson(pathname: string): Promise<unknown> {
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return [];
    const raw = await new Response(result.stream).text();
    return JSON.parse(raw) as unknown;
  } catch {
    return [];
  }
}

async function writeAttempts(userId: string, attempts: PracticeAttempt[]): Promise<void> {
  await put(userAttemptsPath(userId), JSON.stringify(attempts), {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
  });
}

export async function getPracticeAttempts(userId: string): Promise<PracticeAttempt[]> {
  const data = (await readBlobJson(userAttemptsPath(userId))) as unknown;
  if (!Array.isArray(data)) return [];
  return (data as PracticeAttempt[]).sort((a, b) => b.createdAt - a.createdAt);
}

export async function addPracticeAttempt(userId: string, attempt: PracticeAttempt): Promise<void> {
  const current = await getPracticeAttempts(userId);
  const updated = [attempt, ...current].slice(0, 5000);
  await writeAttempts(userId, updated);
}

