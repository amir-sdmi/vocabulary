import { DailyGoal, DailyGoalProgress, GoalSnapshot } from "@/app/features/vocabulary/types";
import { buildUserPath, readJson, writeJson } from "@/app/lib/repositories/blob-store";

const GOAL_PREFIX = "vocabulary-goals-v1";
const PROGRESS_PREFIX = "vocabulary-goal-progress-v1";

function goalPath(userId: string): string {
  return buildUserPath(GOAL_PREFIX, userId);
}

function progressPath(userId: string): string {
  return buildUserPath(PROGRESS_PREFIX, userId);
}

function toDayKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function previousDay(dayKey: string): string {
  const date = new Date(`${dayKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export async function getGoal(userId: string): Promise<DailyGoal> {
  const existing = await readJson<DailyGoal | null>(goalPath(userId), null);
  if (existing) return existing;
  const now = Date.now();
  const created: DailyGoal = {
    id: `goal-${now}`,
    userId,
    targetCorrectProduction: 10,
    createdAt: now,
    updatedAt: now,
  };
  await writeJson(goalPath(userId), created);
  return created;
}

async function getProgressMap(userId: string): Promise<Record<string, DailyGoalProgress>> {
  return readJson<Record<string, DailyGoalProgress>>(progressPath(userId), {});
}

async function saveProgressMap(userId: string, map: Record<string, DailyGoalProgress>): Promise<void> {
  await writeJson(progressPath(userId), map);
}

export async function addCorrectProduction(userId: string, count = 1): Promise<GoalSnapshot> {
  const goal = await getGoal(userId);
  const map = await getProgressMap(userId);
  const date = toDayKey(Date.now());
  const current = map[date] ?? {
    id: `goal-progress-${date}`,
    userId,
    date,
    correctProductionCount: 0,
    target: goal.targetCorrectProduction,
    met: false,
  };
  const updated: DailyGoalProgress = {
    ...current,
    correctProductionCount: current.correctProductionCount + count,
    target: goal.targetCorrectProduction,
    met: current.correctProductionCount + count >= goal.targetCorrectProduction,
  };
  map[date] = updated;
  await saveProgressMap(userId, map);
  return getSnapshot(userId);
}

export async function getSnapshot(userId: string): Promise<GoalSnapshot> {
  const goal = await getGoal(userId);
  const map = await getProgressMap(userId);
  const todayKey = toDayKey(Date.now());
  const today =
    map[todayKey] ??
    ({
      id: `goal-progress-${todayKey}`,
      userId,
      date: todayKey,
      correctProductionCount: 0,
      target: goal.targetCorrectProduction,
      met: false,
    } as DailyGoalProgress);

  let streak = 0;
  let cursor = todayKey;
  let lastMetDate: string | null = null;
  while (true) {
    const day = map[cursor];
    if (!day?.met) break;
    if (!lastMetDate) lastMetDate = cursor;
    streak += 1;
    cursor = previousDay(cursor);
  }

  return { today, streak, lastMetDate };
}
