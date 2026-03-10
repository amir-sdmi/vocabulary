import { SavedFilter } from "@/app/features/vocabulary/types";
import { buildUserPath, readJson, writeJson } from "@/app/lib/repositories/blob-store";

const PREFIX = "vocabulary-saved-filters-v1";

function path(userId: string): string {
  return buildUserPath(PREFIX, userId);
}

export async function getAll(userId: string): Promise<SavedFilter[]> {
  const data = await readJson<unknown>(path(userId), []);
  if (!Array.isArray(data)) return [];
  return (data as SavedFilter[]).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function upsert(
  userId: string,
  input: Omit<SavedFilter, "id" | "createdAt" | "updatedAt" | "userId"> & { id?: string },
): Promise<SavedFilter> {
  const all = await getAll(userId);
  const now = Date.now();
  const existing = input.id ? all.find((x) => x.id === input.id) : undefined;
  const saved: SavedFilter = {
    id: existing?.id ?? `filter-${now}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    name: input.name.trim(),
    filters: input.filters,
    sort: input.sort,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const next = existing ? all.map((x) => (x.id === existing.id ? saved : x)) : [saved, ...all];
  await writeJson(path(userId), next);
  return saved;
}

export async function remove(userId: string, id: string): Promise<boolean> {
  const all = await getAll(userId);
  const next = all.filter((x) => x.id !== id);
  if (next.length === all.length) return false;
  await writeJson(path(userId), next);
  return true;
}
