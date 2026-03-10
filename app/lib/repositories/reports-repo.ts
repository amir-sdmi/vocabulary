import { WeeklyReportSnapshot } from "@/app/features/vocabulary/types";
import { buildUserPath, readJson, writeJson } from "@/app/lib/repositories/blob-store";

const PREFIX = "vocabulary-weekly-reports-v1";

function path(userId: string): string {
  return buildUserPath(PREFIX, userId);
}

export async function getAll(userId: string): Promise<WeeklyReportSnapshot[]> {
  const data = await readJson<unknown>(path(userId), []);
  if (!Array.isArray(data)) return [];
  return (data as WeeklyReportSnapshot[]).sort((a, b) => b.generatedAt - a.generatedAt);
}

export async function add(userId: string, snapshot: WeeklyReportSnapshot): Promise<void> {
  const all = await getAll(userId);
  await writeJson(path(userId), [snapshot, ...all].slice(0, 24));
}
