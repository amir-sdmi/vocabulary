import { TopicMission, VocabEntry } from "@/app/features/vocabulary/types";
import { getVocabularies } from "@/app/lib/vocabulary";

function buildMissionFromTag(tag: string, tagged: VocabEntry[]): TopicMission {
  const target = Math.max(5, Math.min(20, tagged.length));
  const progress = tagged.filter((v) => v.useCount >= 3 && (v.lastScore ?? 0) >= 70).length;
  return {
    id: `mission-${tag}`,
    tag,
    title: `Topic Mission: ${tag}`,
    target,
    progress,
    status: progress >= target ? "completed" : "active",
    suggestedTerms: tagged
      .sort((a, b) => (a.lastScore ?? 0) - (b.lastScore ?? 0))
      .slice(0, 6)
      .map((v) => v.term),
  };
}

export async function getTopicMissions(userId: string): Promise<TopicMission[]> {
  const vocab = await getVocabularies(userId);
  const tags = new Map<string, VocabEntry[]>();
  for (const item of vocab) {
    for (const tag of item.tags) {
      if (!tags.has(tag)) tags.set(tag, []);
      tags.get(tag)!.push(item);
    }
  }
  const missions = Array.from(tags.entries())
    .filter(([, tagged]) => tagged.length >= 3)
    .map(([tag, tagged]) => buildMissionFromTag(tag, tagged))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "active" ? -1 : 1;
      const aPct = a.progress / a.target;
      const bPct = b.progress / b.target;
      return aPct - bPct;
    });
  return missions.slice(0, 6);
}
