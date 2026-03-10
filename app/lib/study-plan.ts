import { ReviewMode, StudyPlan, StudyPlanTask } from "@/app/features/vocabulary/types";
import { buildMemoryGraph } from "@/app/lib/memory-graph";
import { getVocabularies } from "@/app/lib/vocabulary";

const MODE_ROTATION: ReviewMode[] = [
  "weak_area",
  "writing",
  "collocation",
  "active_usage",
  "recall",
  "use_today",
  "daily",
];

function dayKey(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function buildTask(day: string, mode: ReviewMode, focusTerms: string[], reason: string): StudyPlanTask {
  const title = `${mode.replaceAll("_", " ")} session`;
  return { day, mode, title, focusTerms, reason };
}

export async function generateStudyPlan(userId: string): Promise<StudyPlan> {
  const [graph, vocab] = await Promise.all([buildMemoryGraph(userId), getVocabularies(userId)]);
  const trouble = vocab
    .filter((v) => v.status === "trouble")
    .sort((a, b) => b.lapses - a.lapses)
    .slice(0, 8)
    .map((v) => v.term);
  const due = vocab
    .filter((v) => v.dueAt <= Date.now())
    .slice(0, 8)
    .map((v) => v.term);
  const graphFocus = graph.recommendations.flatMap((r) => r.focusTerms).slice(0, 12);
  const combined = Array.from(new Set([...graphFocus, ...trouble, ...due]));
  const tasks: StudyPlanTask[] = [];
  for (let i = 0; i < 7; i += 1) {
    const mode = MODE_ROTATION[i % MODE_ROTATION.length];
    const day = dayKey(i);
    const sliceStart = (i * 3) % Math.max(1, combined.length);
    const focusTerms = combined.slice(sliceStart, sliceStart + 5);
    const reason =
      mode === "weak_area"
        ? "Target repeated error patterns from your memory graph."
        : mode === "use_today"
          ? "Refresh terms not used recently."
          : "Keep balanced progress across recall, writing, and active usage.";
    tasks.push(buildTask(day, mode, focusTerms, reason));
  }
  return {
    generatedAt: Date.now(),
    today: dayKey(0),
    tasks,
  };
}
