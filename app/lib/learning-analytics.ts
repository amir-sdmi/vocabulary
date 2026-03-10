import { inferMasteryLevel } from "@/app/features/vocabulary/helpers";
import { AnalyticsSnapshot, MasteryLevel } from "@/app/features/vocabulary/types";
import { getPracticeAttempts } from "@/app/lib/practice";
import { getVocabularies } from "@/app/lib/vocabulary";

function levelScore(level: MasteryLevel): number {
  if (level === "fluent") return 100;
  if (level === "stable") return 75;
  if (level === "practiced") return 50;
  return 25;
}

export async function getAnalyticsSnapshot(userId: string): Promise<AnalyticsSnapshot> {
  const [vocab, attempts] = await Promise.all([getVocabularies(userId), getPracticeAttempts(userId)]);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = attempts.filter((a) => a.createdAt >= weekAgo);
  const levelBreakdown: Record<MasteryLevel, number> = {
    seen: 0,
    practiced: 0,
    stable: 0,
    fluent: 0,
  };
  for (const entry of vocab) {
    levelBreakdown[inferMasteryLevel(entry)] += 1;
  }
  const averageMastery =
    vocab.length > 0
      ? Math.round(
          vocab.reduce((sum, item) => sum + levelScore(inferMasteryLevel(item)), 0) / vocab.length,
        )
      : 0;
  const passed = recent.filter((a) => a.pass).length;
  const retentionRate7d = recent.length > 0 ? Math.round((passed / recent.length) * 100) : 0;
  const averageResponseScore7d =
    recent.length > 0 ? Math.round(recent.reduce((s, a) => s + a.score, 0) / recent.length) : 0;
  const topImprovedTerms = [...vocab]
    .filter((v) => (v.lastScore ?? 0) >= 80 && v.useCount >= 3)
    .sort((a, b) => (b.lastScore ?? 0) - (a.lastScore ?? 0))
    .slice(0, 5)
    .map((v) => v.term);
  const strugglingTerms = [...vocab]
    .filter((v) => v.status === "trouble" || (v.lastScore ?? 100) < 65)
    .sort((a, b) => b.lapses - a.lapses)
    .slice(0, 5)
    .map((v) => v.term);

  return {
    totalWords: vocab.length,
    activeWords: vocab.filter((v) => v.useCount > 0).length,
    averageMastery,
    levelBreakdown,
    retentionRate7d,
    averageResponseScore7d,
    topImprovedTerms,
    strugglingTerms,
  };
}
