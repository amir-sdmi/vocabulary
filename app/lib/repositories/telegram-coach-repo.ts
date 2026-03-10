import { buildUserPath, readJson, writeJson } from "@/app/lib/repositories/blob-store";

type PendingCoach = {
  telegramUserId: string;
  term: string;
  createdAt: number;
  tries: number;
};

const PREFIX = "telegram-coach-pending-v1";

function path(telegramUserId: string): string {
  return buildUserPath(PREFIX, telegramUserId);
}

export async function getPendingCoach(telegramUserId: string): Promise<PendingCoach | null> {
  const data = await readJson<PendingCoach | null>(path(telegramUserId), null);
  return data;
}

export async function setPendingCoach(telegramUserId: string, term: string): Promise<void> {
  await writeJson(path(telegramUserId), {
    telegramUserId,
    term,
    createdAt: Date.now(),
    tries: 0,
  } satisfies PendingCoach);
}

export async function incrementPendingTry(telegramUserId: string): Promise<PendingCoach | null> {
  const pending = await getPendingCoach(telegramUserId);
  if (!pending) return null;
  const updated = { ...pending, tries: pending.tries + 1 };
  await writeJson(path(telegramUserId), updated);
  return updated;
}

export async function clearPendingCoach(telegramUserId: string): Promise<void> {
  await writeJson(path(telegramUserId), null);
}
