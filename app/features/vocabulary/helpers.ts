import {
  ENTRY_TYPE,
  EditDraft,
  EntryType,
  LEARNING_STATUS,
  LearningStatus,
  ReviewMode,
  ReviewErrorType,
  VocabEntry,
  VocabStats,
  VocabularyFilters,
  WordFamily,
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

export function deriveEntryType(term: string): EntryType {
  return term.includes(" ") ? "phrase" : "word";
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
  if (Array.isArray(raw)) {
    return Array.from(new Set(raw.map((item) => String(item).trim()).filter(Boolean)));
  }
  if (typeof raw === "string") {
    return Array.from(new Set(raw.split(",").map((item) => item.trim()).filter(Boolean)));
  }
  return undefined;
}

export function parseAddCommand(
  text: string,
): { term: string; meaning?: string; tags?: string[]; sentence?: string } | null {
  const normalized = text.trim();
  if (!/^add:/i.test(normalized)) return null;
  const body = normalized.replace(/^add:\s*/i, "");
  const parts = body.split("|").map((x) => x.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  const term = normalizeTerm(parts[0]);
  if (parts.length === 2) {
    const second = parts[1];
    const looksSentence = /[.!?]$/.test(second) || second.split(/\s+/).length > 5;
    return looksSentence ? { term, sentence: second } : { term, meaning: second };
  }
  if (parts.length === 3) {
    return { term, meaning: parts[1], tags: parseCsvList(parts[2]) };
  }
  return {
    term,
    meaning: parts[1],
    tags: parseCsvList(parts[2]),
    sentence: parts[3],
  };
}

export function parseNaturalAddText(text: string): {
  term: string;
  meaning?: string;
  tags?: string[];
  sentence?: string;
} {
  const cleaned = text.trim();
  const byDash = cleaned.split(/\s*[-:]\s*/);
  if (byDash.length >= 2) {
    return {
      term: normalizeTerm(byDash[0]),
      meaning: byDash.slice(1).join(" ").trim(),
    };
  }
  const words = cleaned.split(/\s+/).filter(Boolean);
  const term = normalizeTerm(words.slice(0, Math.min(3, words.length)).join(" "));
  return { term: term || cleaned };
}

export function normalizeWordFamily(input: Partial<WordFamily> | undefined): WordFamily {
  return {
    noun: input?.noun?.trim() || undefined,
    verb: input?.verb?.trim() || undefined,
    adjective: input?.adjective?.trim() || undefined,
    adverb: input?.adverb?.trim() || undefined,
  };
}

export function buildDefaultWordFamily(): WordFamily {
  return { noun: undefined, verb: undefined, adjective: undefined, adverb: undefined };
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function buildEditDraft(item: VocabEntry): EditDraft {
  return {
    term: item.term,
    entryType: item.entryType,
    pos: item.pos,
    definitionEasyEn: item.definitionEasyEn,
    meaningFa: item.meaningFa,
    userExample: item.userExample,
    status: item.status,
    tags: item.tags.join(", "),
    collocations: item.collocations.join(", "),
    synonyms: item.synonyms.join(", "),
    antonyms: item.antonyms.join(", "),
    wordFamilyNoun: item.wordFamily.noun ?? "",
    wordFamilyVerb: item.wordFamily.verb ?? "",
    wordFamilyAdjective: item.wordFamily.adjective ?? "",
    wordFamilyAdverb: item.wordFamily.adverb ?? "",
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

export function isEntryType(value: unknown): value is EntryType {
  return typeof value === "string" && ENTRY_TYPE.includes(value as EntryType);
}

function byDueFilter(item: VocabEntry, due: VocabularyFilters["due"]): boolean {
  if (!due || due === "all") return true;
  const now = Date.now();
  if (due === "due") return item.dueAt <= now;
  if (due === "overdue") return item.dueAt < now - 24 * 60 * 60 * 1000;
  return true;
}

export function filterVocabularies(items: VocabEntry[], filters: VocabularyFilters): VocabEntry[] {
  const q = filters.q?.trim().toLowerCase() ?? "";
  const status = filters.status?.trim().toLowerCase() ?? "";
  const tag = filters.tag?.trim().toLowerCase() ?? "";
  const meaning = filters.meaning?.trim().toLowerCase() ?? "";
  const collocation = filters.collocation?.trim().toLowerCase() ?? "";
  const mistakeType = filters.mistakeType ?? "";
  const entryType = filters.entryType ?? "";
  const due = filters.due ?? "";

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
    const byMeaning =
      !meaning ||
      item.definitionEasyEn.toLowerCase().includes(meaning) ||
      item.meaningFa.toLowerCase().includes(meaning);
    const byMistake =
      !mistakeType || (item.errorBuckets[mistakeType as ReviewErrorType] ?? 0) > 0;
    const byEntryType = !entryType || item.entryType === entryType;
    const byCollocation =
      !collocation ||
      item.collocations.some((value) => value.toLowerCase().includes(collocation));
    const byDue = byDueFilter(item, due);
    return inQuery && byStatus && byTag && byMeaning && byMistake && byEntryType && byCollocation && byDue;
  });
}

export function vocabToCsv(items: VocabEntry[]): string {
  const headers = [
    "id",
    "term",
    "lemma",
    "entryType",
    "pos",
    "status",
    "definitionEasyEn",
    "meaningFa",
    "userExample",
    "tags",
    "collocations",
    "synonyms",
    "antonyms",
    "wordFamilyNoun",
    "wordFamilyVerb",
    "wordFamilyAdjective",
    "wordFamilyAdverb",
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
      item.entryType,
      item.pos,
      item.status,
      item.definitionEasyEn,
      item.meaningFa,
      item.userExample,
      item.tags.join("|"),
      item.collocations.join("|"),
      item.synonyms.join("|"),
      item.antonyms.join("|"),
      item.wordFamily.noun ?? "",
      item.wordFamily.verb ?? "",
      item.wordFamily.adjective ?? "",
      item.wordFamily.adverb ?? "",
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

export function inferTaskTypesForMode(mode: ReviewMode) {
  if (mode === "recall") return ["recall"] as const;
  if (mode === "writing") return ["rewrite", "free_sentence"] as const;
  if (mode === "collocation") return ["collocation"] as const;
  if (mode === "error_correction") return ["error_correction"] as const;
  if (mode === "active_usage") return ["active_usage", "free_sentence"] as const;
  return ["fill_gap", "rewrite", "free_sentence"] as const;
}

export function parsePipeRow(raw: string): string[] {
  return raw.split("|").map((x) => x.trim());
}

export function parseCsvRows(raw: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuote = false;

  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    const next = raw[i + 1];
    if (ch === '"' && inQuote && next === '"') {
      current += '"';
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuote = !inQuote;
      continue;
    }
    if (ch === "," && !inQuote) {
      row.push(current.trim());
      current = "";
      continue;
    }
    if ((ch === "\n" || ch === "\r") && !inQuote) {
      if (ch === "\r" && next === "\n") i += 1;
      if (current.length > 0 || row.length > 0) {
        row.push(current.trim());
        rows.push(row);
      }
      row = [];
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }
  return rows;
}
