import { ImportJob } from "@/app/features/vocabulary/types";
import { buildUserPath, readJson, writeJson } from "@/app/lib/repositories/blob-store";

const PREFIX = "vocabulary-import-jobs-v1";

function path(userId: string): string {
  return buildUserPath(PREFIX, userId);
}

export async function getAll(userId: string): Promise<ImportJob[]> {
  const data = await readJson<unknown>(path(userId), []);
  if (!Array.isArray(data)) return [];
  return (data as ImportJob[]).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function add(userId: string, job: ImportJob): Promise<void> {
  const all = await getAll(userId);
  await writeJson(path(userId), [job, ...all].slice(0, 50));
}
