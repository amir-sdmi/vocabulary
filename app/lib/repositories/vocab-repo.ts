import {
  buildDefaultWordFamily,
  defaultErrorBuckets,
  deriveEntryType,
  deriveLemma,
  derivePos,
  normalizeTerm,
  normalizeWordFamily,
  parseAddCommand,
  parseCsvList,
  parseNaturalAddText,
} from "@/app/features/vocabulary/helpers";
import { VocabEntry } from "@/app/features/vocabulary/types";
import { buildUserPath, readJson, writeJson } from "@/app/lib/repositories/blob-store";

type LegacyMessage = {
  id: string;
  text: string;
  at: number;
};

const VOCAB_PREFIX = "vocabulary-db-v2";
const V1_PREFIX = "vocabulary-db-v1";
const LEGACY_PATHNAME = "vocabulary";

function buildDefaultVocab(input: {
  term: string;
  sentence?: string;
  tags?: string[];
  meaning?: string;
  source: "telegram" | "web";
}): VocabEntry {
  const now = Date.now();
  const term = normalizeTerm(input.term);
  return {
    id: `vocab-${now}-${Math.random().toString(36).slice(2, 9)}`,
    term,
    lemma: deriveLemma(term),
    entryType: deriveEntryType(term),
    pos: derivePos(term),
    definitionEasyEn: input.meaning ?? "",
    meaningFa: "",
    userExample: input.sentence?.trim() ?? "",
    aiExamples: [],
    collocations: [],
    synonyms: [],
    antonyms: [],
    wordFamily: buildDefaultWordFamily(),
    tags: input.tags ?? [],
    status: "new",
    source: input.source,
    createdAt: now,
    updatedAt: now,
    dueAt: now,
    ease: 2.5,
    intervalDays: 1,
    lapses: 0,
    streak: 0,
    lastScore: null,
    lastReviewedAt: null,
    useCount: 0,
    difficultyScore: null,
    lastUsedAt: null,
    errorBuckets: defaultErrorBuckets(),
  };
}

function v1Path(userId: string): string {
  return buildUserPath(V1_PREFIX, userId);
}

function v2Path(userId: string): string {
  return buildUserPath(VOCAB_PREFIX, userId);
}

async function readLegacyAsVocab(): Promise<VocabEntry[]> {
  const legacy = await readJson<unknown>(LEGACY_PATHNAME, []);
  if (!Array.isArray(legacy)) return [];
  return legacy
    .filter((item): item is LegacyMessage => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof (item as LegacyMessage).id === "string" &&
        typeof (item as LegacyMessage).text === "string" &&
        typeof (item as LegacyMessage).at === "number"
      );
    })
    .map((message) => {
      const parsed = parseAddCommand(message.text) ?? parseNaturalAddText(message.text);
      return {
        ...buildDefaultVocab({
          term: parsed.term,
          sentence: parsed.sentence,
          tags: parsed.tags ?? [],
          meaning: parsed.meaning,
          source: "telegram",
        }),
        id: `legacy-${message.id}`,
        createdAt: message.at,
        updatedAt: message.at,
      };
    });
}

function ensureShape(input: Partial<VocabEntry>): VocabEntry {
  const now = Date.now();
  const term = normalizeTerm(input.term ?? "");
  const normalizedErrorBuckets = {
    ...defaultErrorBuckets(),
    ...(input.errorBuckets ?? {}),
  };
  return {
    id: input.id ?? `vocab-${now}-${Math.random().toString(36).slice(2, 9)}`,
    term,
    lemma: deriveLemma(input.lemma ?? term),
    entryType: input.entryType ?? deriveEntryType(term),
    pos: input.pos ?? derivePos(term),
    definitionEasyEn: input.definitionEasyEn ?? "",
    meaningFa: input.meaningFa ?? "",
    userExample: input.userExample ?? "",
    aiExamples: input.aiExamples ?? [],
    collocations: input.collocations ?? [],
    synonyms: input.synonyms ?? [],
    antonyms: input.antonyms ?? [],
    wordFamily: normalizeWordFamily(input.wordFamily),
    tags: input.tags ?? [],
    status: input.status ?? "new",
    source: input.source ?? "web",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    dueAt: input.dueAt ?? input.updatedAt ?? now,
    ease: input.ease ?? 2.5,
    intervalDays: input.intervalDays ?? 1,
    lapses: input.lapses ?? 0,
    streak: input.streak ?? 0,
    lastScore: input.lastScore ?? null,
    lastReviewedAt: input.lastReviewedAt ?? null,
    useCount: input.useCount ?? 0,
    difficultyScore: input.difficultyScore ?? null,
    lastUsedAt: input.lastUsedAt ?? null,
    errorBuckets: normalizedErrorBuckets,
  };
}

export async function getAll(userId: string): Promise<VocabEntry[]> {
  const v2 = await readJson<unknown>(v2Path(userId), []);
  if (Array.isArray(v2) && v2.length > 0) {
    return (v2 as Partial<VocabEntry>[]).map(ensureShape).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  const v1 = await readJson<unknown>(v1Path(userId), []);
  if (Array.isArray(v1) && v1.length > 0) {
    const migrated = (v1 as Partial<VocabEntry>[]).map(ensureShape);
    await writeJson(v2Path(userId), migrated);
    return migrated.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  if (userId === "legacy-migration-owner") {
    const migrated = await readLegacyAsVocab();
    if (migrated.length > 0) await writeJson(v2Path(userId), migrated);
    return migrated.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  return [];
}

export async function saveAll(userId: string, list: VocabEntry[]): Promise<void> {
  await writeJson(v2Path(userId), list.map(ensureShape));
}

export async function create(
  userId: string,
  input: {
    term: string;
    sentence?: string;
    tags?: string[];
    source?: "telegram" | "web";
    meaning?: string;
  },
): Promise<VocabEntry> {
  const list = await getAll(userId);
  const entry = buildDefaultVocab({
    term: input.term,
    sentence: input.sentence,
    tags: input.tags ?? [],
    source: input.source ?? "web",
    meaning: input.meaning,
  });
  await saveAll(userId, [entry, ...list]);
  return entry;
}

export async function createFromText(userId: string, text: string): Promise<VocabEntry | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const parsed = parseAddCommand(trimmed) ?? parseNaturalAddText(trimmed);
  return create(userId, {
    term: parsed.term,
    sentence: parsed.sentence,
    tags: parsed.tags ?? [],
    meaning: parsed.meaning,
    source: "telegram",
  });
}

export async function update(
  userId: string,
  id: string,
  patch: Partial<VocabEntry>,
): Promise<VocabEntry | null> {
  const list = await getAll(userId);
  const idx = list.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  const current = list[idx];
  const term = patch.term ? normalizeTerm(patch.term) : current.term;
  const updated: VocabEntry = ensureShape({
    ...current,
    ...patch,
    term,
    lemma: patch.lemma ?? deriveLemma(term),
    entryType: patch.entryType ?? current.entryType ?? deriveEntryType(term),
    pos: patch.pos ?? derivePos(term),
    tags: patch.tags ? parseCsvList(patch.tags.join(",")) : current.tags,
    wordFamily: patch.wordFamily ? normalizeWordFamily(patch.wordFamily) : current.wordFamily,
    updatedAt: Date.now(),
  });
  const next = [...list];
  next[idx] = updated;
  await saveAll(userId, next);
  return updated;
}

export async function remove(userId: string, id: string): Promise<boolean> {
  const list = await getAll(userId);
  const next = list.filter((item) => item.id !== id);
  if (next.length === list.length) return false;
  await saveAll(userId, next);
  return true;
}
