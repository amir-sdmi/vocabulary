import {
  EditDraft,
  LEARNING_STATUS,
  LearningStatus,
  ReviewErrorType,
  VocabEntry,
  VocabStats,
  VocabularyFilters,
} from "./types";

export function normalizeTerm(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function deriveLemma(term: string): string {
  return term.toLowerCase().trim();
}

export function derivePos(term: string): string {
  if (term.includes(" ")) return "phrase";
  return "word";
}

export function parseCsvList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

export function parseUnknownList(raw: unknown): string[] | undefined {
  if (raw === undefined) return undefined;
  if (Array.isArray(raw)) return raw.map((item) => String(item).trim()).filter(Boolean);
  if (typeof raw === "string") return raw.split(",").map((item) => item.trim()).filter(Boolean);
  return undefined;
}

export function parseAddCommand(text: string): { term: string; sentence: string } | null {
  const match = text.match(/^add:\s*(.+?)\s*\|\s*(.+)$/i);
  if (!match) return null;
  return { term: normalizeTerm(match[1]), sentence: match[2].trim() };
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function buildEditDraft(item: VocabEntry): EditDraft {
  return {
    term: item.term,
    pos: item.pos,
    definitionEasyEn: item.definitionEasyEn,
    meaningFa: item.meaningFa,
    userExample: item.userExample,
    status: item.status,
    tags: item.tags.join(", "),
    collocations: item.collocations.join(", "),
    aiExamples: item.aiExamples.join("\n"),
  };
}

export function buildVocabStats(items: VocabEntry[]): VocabStats {
  const stats: VocabStats = {
    total: items.length,
    new: 0,
    learning: 0,
    known: 0,
    trouble: 0,
  };
  for (const item of items) stats[item.status] += 1;
  return stats;
}

export function isLearningStatus(value: unknown): value is LearningStatus {
  return typeof value === "string" && LEARNING_STATUS.includes(value as LearningStatus);
}

export function filterVocabularies(items: VocabEntry[], filters: VocabularyFilters): VocabEntry[] {
  const q = filters.q?.trim().toLowerCase() ?? "";
  const status = filters.status?.trim().toLowerCase() ?? "";
  const tag = filters.tag?.trim().toLowerCase() ?? "";

  return items.filter((item) => {
    const inQuery =
      !q ||
      item.term.toLowerCase().includes(q) ||
      item.lemma.toLowerCase().includes(q) ||
      item.definitionEasyEn.toLowerCase().includes(q) ||
      item.meaningFa.toLowerCase().includes(q) ||
      item.tags.some((t) => t.includes(q));
    const byStatus = !status || item.status === status;
    const byTag = !tag || item.tags.includes(tag);
    return inQuery && byStatus && byTag;
  });
}

export function vocabToCsv(items: VocabEntry[]): string {
  const headers = [
    "id",
    "term",
    "lemma",
    "pos",
    "status",
    "definitionEasyEn",
    "meaningFa",
    "userExample",
    "tags",
    "collocations",
    "aiExamples",
    "source",
    "createdAt",
    "updatedAt",
  ];
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = items.map((item) =>
    [
      item.id,
      item.term,
      item.lemma,
      item.pos,
      item.status,
      item.definitionEasyEn,
      item.meaningFa,
      item.userExample,
      item.tags.join("|"),
      item.collocations.join("|"),
      item.aiExamples.join("|"),
      item.source,
      item.createdAt,
      item.updatedAt,
    ]
      .map(escape)
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

export function defaultErrorBuckets(): Record<ReviewErrorType, number> {
  return {
    grammar: 0,
    word_choice: 0,
    collocation: 0,
    meaning_mismatch: 0,
    fluency: 0,
  };
}
