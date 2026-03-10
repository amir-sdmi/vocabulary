import { PracticeAttempt } from "@/app/features/vocabulary/types";
import { buildUserPath, readJson, writeJson } from "@/app/lib/repositories/blob-store";

const PREFIX = "vocabulary-attempts-v2";

function path(userId: string): string {
  return buildUserPath(PREFIX, userId);
}

export async function getAll(userId: string): Promise<PracticeAttempt[]> {
  const data = await readJson<unknown>(path(userId), []);
  if (!Array.isArray(data)) return [];
  return (data as PracticeAttempt[]).sort((a, b) => b.createdAt - a.createdAt);
}

export async function add(userId: string, attempt: PracticeAttempt): Promise<void> {
  const current = await getAll(userId);
  const updated = [attempt, ...current].slice(0, 5000);
  await writeJson(path(userId), updated);
}
