import { NotificationHint } from "@/app/features/vocabulary/types";
import { getGoalSnapshot } from "@/app/lib/goals";
import { getPracticeAttempts } from "@/app/lib/practice";

function hourOf(timestamp: number): number {
  return new Date(timestamp).getHours();
}

export async function getNotificationHint(userId: string): Promise<NotificationHint> {
  const [attempts, goal] = await Promise.all([getPracticeAttempts(userId), getGoalSnapshot(userId)]);
  const last30 = attempts.slice(0, 300);
  const byHour = new Map<number, { count: number; avg: number }>();
  for (const a of last30) {
    const h = hourOf(a.createdAt);
    const current = byHour.get(h) ?? { count: 0, avg: 0 };
    const nextCount = current.count + 1;
    const nextAvg = (current.avg * current.count + a.score) / nextCount;
    byHour.set(h, { count: nextCount, avg: nextAvg });
  }
  const bestWindows = Array.from(byHour.entries())
    .map(([hour, value]) => ({
      hour,
      score: Math.round((value.avg + Math.min(value.count, 15) * 2) * 10) / 10,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const streakRescue = goal.today.met
    ? null
    : `You need ${Math.max(goal.today.target - goal.today.correctProductionCount, 0)} more correct production answers today to keep momentum.`;

  const nextHour = bestWindows[0]?.hour ?? 20;
  return {
    bestWindows,
    streakRescue,
    suggestedNext: `Best review window: ${String(nextHour).padStart(2, "0")}:00.`,
  };
}
