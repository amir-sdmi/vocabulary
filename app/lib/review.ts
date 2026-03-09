import {
  PracticeAttempt,
  ReviewErrorType,
  ReviewQueueItem,
  ReviewTask,
  VocabEntry,
} from "@/app/features/vocabulary/types";
import { addPracticeAttempt, getPracticeAttempts } from "@/app/lib/practice";
import { getVocabularies, updateVocabulary } from "@/app/lib/vocabulary";

type ReviewMode = "daily" | "trouble" | "quick" | "tag";

export async function buildReviewQueue(input: {
  userId: string;
  mode: ReviewMode;
  tag?: string;
}): Promise<ReviewQueueItem[]> {
  const list = await getVocabularies(input.userId);
  const now = Date.now();

  const filtered = list.filter((item) => {
    if (input.mode === "trouble") return item.status === "trouble" || item.lapses >= 2;
    if (input.mode === "tag") return !!input.tag && item.tags.includes(input.tag.toLowerCase());
    return true;
  });

  const prioritized = [...filtered].sort((a, b) => {
    const aDue = a.dueAt <= now ? 0 : 1;
    const bDue = b.dueAt <= now ? 0 : 1;
    if (aDue !== bDue) return aDue - bDue;
    if (a.status !== b.status) return scoreStatus(a.status) - scoreStatus(b.status);
    if (a.lapses !== b.lapses) return b.lapses - a.lapses;
    return (a.lastScore ?? 100) - (b.lastScore ?? 100);
  });

  const size = input.mode === "quick" ? 5 : 10;
  return prioritized.slice(0, size).map((vocab) => ({
    vocab,
    tasks: buildTasks(vocab),
  }));
}

function scoreStatus(status: VocabEntry["status"]): number {
  if (status === "trouble") return 0;
  if (status === "learning") return 1;
  if (status === "new") return 2;
  return 3;
}

function buildTasks(vocab: VocabEntry): ReviewTask[] {
  const source = vocab.userExample || `I use ${vocab.term} in this sentence.`;
  const escapedTerm = vocab.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const replaced = source.replace(new RegExp(escapedTerm, "ig"), "_____");
  const gap = replaced === source ? `${source} (replace "${vocab.term}" with blank)` : replaced;
  const rewrite = source.startsWith("I ")
    ? source.replace(/^I\s+/i, "Yesterday I ")
    : `Rewrite with past tense: ${source}`;

  return [
    { type: "fill_gap", prompt: `Fill the gap: ${gap}` },
    { type: "rewrite", prompt: `Rewrite naturally: ${rewrite}` },
    { type: "free_sentence", prompt: `Write one new sentence using "${vocab.term}".` },
  ];
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function inferErrors(answer: string, vocab: VocabEntry): ReviewErrorType[] {
  const errors: ReviewErrorType[] = [];
  const normalized = answer.toLowerCase();
  if (!normalized.includes(vocab.term.toLowerCase())) errors.push("meaning_mismatch");
  if (answer.trim().split(/\s+/).length < 5) errors.push("fluency");
  if (!/[.!?]$/.test(answer.trim())) errors.push("grammar");
  if (vocab.collocations.length > 0) {
    const hasCollocation = vocab.collocations.some((c) => normalized.includes(c.toLowerCase()));
    if (!hasCollocation) errors.push("collocation");
  }
  if (errors.length === 0 && answer.length < 18) errors.push("word_choice");
  return Array.from(new Set(errors));
}

export async function evaluateReviewAnswer(input: {
  userId: string;
  vocabId: string;
  mode: ReviewMode;
  taskType: ReviewTask["type"];
  prompt: string;
  answer: string;
}): Promise<{ attempt: PracticeAttempt; updated: VocabEntry | null }> {
  const list = await getVocabularies(input.userId);
  const vocab = list.find((item) => item.id === input.vocabId);
  if (!vocab) {
    throw new Error("Vocabulary not found");
  }

  const errors = inferErrors(input.answer, vocab);
  const score = clampScore(100 - errors.length * 18 - Math.max(0, 12 - input.answer.length / 4));
  const pass = score >= 70;
  const fixedAnswer = buildFixedAnswer(input.answer, vocab);
  const feedback = pass
    ? "Good usage. Keep the structure and collocations."
    : `Needs work: ${errors.join(", ")}.`;

  const { updatedStatus, nextInterval, nextEase, lapsesDelta, streakValue } = applySrs({
    current: vocab,
    score,
  });

  const nextDue = Date.now() + nextInterval * 24 * 60 * 60 * 1000;
  const buckets = { ...vocab.errorBuckets };
  for (const err of errors) buckets[err] += 1;

  const updated = await updateVocabulary(input.userId, vocab.id, {
    status: updatedStatus,
    intervalDays: nextInterval,
    ease: nextEase,
    dueAt: nextDue,
    lapses: vocab.lapses + lapsesDelta,
    streak: streakValue,
    lastScore: score,
    lastReviewedAt: Date.now(),
    useCount: vocab.useCount + 1,
    errorBuckets: buckets,
  });

  const attempt: PracticeAttempt = {
    id: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: input.userId,
    vocabId: vocab.id,
    createdAt: Date.now(),
    mode: input.mode,
    taskType: input.taskType,
    prompt: input.prompt,
    answer: input.answer,
    score,
    pass,
    feedback,
    fixedAnswer,
    errors,
  };

  await addPracticeAttempt(input.userId, attempt);
  return { attempt, updated };
}

function buildFixedAnswer(answer: string, vocab: VocabEntry): string {
  const trimmed = answer.trim();
  if (!trimmed) return `I used ${vocab.term} in a clear sentence.`;
  if (!trimmed.toLowerCase().includes(vocab.term.toLowerCase())) {
    return `${trimmed} I also used ${vocab.term} correctly.`;
  }
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function applySrs(input: { current: VocabEntry; score: number }) {
  const { current, score } = input;
  let nextEase = current.ease;
  let nextInterval = current.intervalDays;
  let lapsesDelta = 0;
  let streakValue = current.streak;
  let updatedStatus: VocabEntry["status"] = current.status;

  if (score >= 90) {
    nextEase = Math.min(3.2, current.ease + 0.05);
    nextInterval = Math.max(2, Math.ceil(current.intervalDays * nextEase));
    streakValue += 1;
    if (current.status === "new" || current.status === "learning") updatedStatus = "known";
  } else if (score >= 70) {
    nextInterval = Math.max(1, Math.ceil(current.intervalDays * 1.6));
    streakValue += 1;
    if (current.status === "new") updatedStatus = "learning";
  } else {
    nextEase = Math.max(1.3, current.ease - 0.2);
    nextInterval = 1;
    lapsesDelta = 1;
    streakValue = 0;
    updatedStatus = "trouble";
  }

  return { updatedStatus, nextInterval, nextEase, lapsesDelta, streakValue };
}

export async function getLearningInsights(userId: string) {
  const vocab = await getVocabularies(userId);
  const attempts = await getPracticeAttempts(userId);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentAttempts = attempts.filter((a) => a.createdAt >= weekAgo);

  const avgScore =
    recentAttempts.length > 0
      ? Math.round(recentAttempts.reduce((sum, a) => sum + a.score, 0) / recentAttempts.length)
      : 0;
  const retained = vocab.filter((v) => (v.lastScore ?? 0) >= 80 && v.intervalDays >= 4).length;
  const forgotten = vocab.filter((v) => v.status === "trouble").length;
  const active = vocab.filter((v) => v.useCount >= 3 && (v.lastScore ?? 0) >= 70).length;

  const errorCounts = recentAttempts.reduce<Record<ReviewErrorType, number>>(
    (acc, attempt) => {
      for (const err of attempt.errors) acc[err] += 1;
      return acc;
    },
    {
      grammar: 0,
      word_choice: 0,
      collocation: 0,
      meaning_mismatch: 0,
      fluency: 0,
    },
  );

  const topErrors = Object.entries(errorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type, count]) => ({ type: type as ReviewErrorType, count }));

  return {
    totalWords: vocab.length,
    retainedWords: retained,
    forgottenWords: forgotten,
    usableWords: active,
    reviews7d: recentAttempts.length,
    avgScore7d: avgScore,
    troubleWords: vocab
      .filter((v) => v.status === "trouble")
      .sort((a, b) => b.lapses - a.lapses)
      .slice(0, 12)
      .map((v) => ({ id: v.id, term: v.term, lapses: v.lapses, lastScore: v.lastScore })),
    topErrors,
  };
}
