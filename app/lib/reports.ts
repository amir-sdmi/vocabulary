import { WeeklyReportSnapshot } from "@/app/features/vocabulary/types";
import { getLearningInsights } from "@/app/lib/review";
import * as reportsRepo from "@/app/lib/repositories/reports-repo";

function getWeekRange(now = new Date()) {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = date.getUTCDay();
  const diffToMonday = (day + 6) % 7;
  date.setUTCDate(date.getUTCDate() - diffToMonday);
  const start = new Date(date);
  const end = new Date(date);
  end.setUTCDate(start.getUTCDate() + 6);
  return {
    weekStart: start.toISOString().slice(0, 10),
    weekEnd: end.toISOString().slice(0, 10),
  };
}

export async function generateWeeklyReport(userId: string): Promise<WeeklyReportSnapshot> {
  const insights = await getLearningInsights(userId);
  const { weekStart, weekEnd } = getWeekRange();
  const recommendation =
    insights.topErrors[0]?.type === "collocation"
      ? "Focus on collocation drills this week."
      : insights.topErrors[0]?.type === "grammar"
        ? "Prioritize grammar correction drills with short daily sets."
        : "Continue active-usage drills to keep retention strong.";
  const snapshot: WeeklyReportSnapshot = {
    id: `weekly-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    weekStart,
    weekEnd,
    generatedAt: Date.now(),
    totalWords: insights.totalWords,
    retainedWords: insights.retainedWords,
    forgottenWords: insights.forgottenWords,
    usableWords: insights.usableWords,
    reviews7d: insights.reviews7d,
    avgScore7d: insights.avgScore7d,
    topErrors: insights.topErrors,
    weakWords: insights.troubleWords,
    recommendation,
  };
  await reportsRepo.add(userId, snapshot);
  return snapshot;
}

export function reportToText(snapshot: WeeklyReportSnapshot): string {
  return [
    "WEEKLY VOCABULARY REPORT",
    "",
    `Week: ${snapshot.weekStart} to ${snapshot.weekEnd}`,
    `Total words: ${snapshot.totalWords}`,
    `Retained words: ${snapshot.retainedWords}`,
    `Forgotten words: ${snapshot.forgottenWords}`,
    `Usable words: ${snapshot.usableWords}`,
    `Reviews (7d): ${snapshot.reviews7d}`,
    `Average score (7d): ${snapshot.avgScore7d}`,
    "",
    "Top mistakes:",
    ...snapshot.topErrors.map((x) => `- ${x.type}: ${x.count}`),
    "",
    "Weak words:",
    ...snapshot.weakWords.slice(0, 12).map((x) => `- ${x.term} (lapses: ${x.lapses}, score: ${x.lastScore ?? 0})`),
    "",
    `Recommendation: ${snapshot.recommendation}`,
  ].join("\n");
}
