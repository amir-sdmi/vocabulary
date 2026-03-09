import { get, put } from "@vercel/blob";
import {
  defaultErrorBuckets,
  deriveLemma,
  derivePos,
  normalizeTerm,
  parseAddCommand,
  parseCsvList,
  vocabToCsv,
} from "@/app/features/vocabulary/helpers";
import { VocabEntry } from "@/app/features/vocabulary/types";

type LegacyMessage = {
  id: string;
  text: string;
  at: number;
};

const VOCAB_BLOB_PATHNAME = "vocabulary-db-v1";
const LEGACY_BLOB_PATHNAME = "vocabulary";

function buildDefaultVocab(input: {
  term: string;
  sentence?: string;
  tags?: string[];
  source: "telegram" | "web";
}): VocabEntry {
  const now = Date.now();
  const term = normalizeTerm(input.term);
  return {
    id: `vocab-${now}-${Math.random().toString(36).slice(2, 9)}`,
    term,
    lemma: deriveLemma(term),
    pos: derivePos(term),
    definitionEasyEn: "",
    meaningFa: "",
    userExample: input.sentence?.trim() ?? "",
    aiExamples: [],
    collocations: [],
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
    errorBuckets: defaultErrorBuckets(),
  };
}

function patchVocabEntry(existing: VocabEntry, patch: Partial<VocabEntry>): VocabEntry {
  const term = patch.term ? normalizeTerm(patch.term) : existing.term;
  return {
    ...existing,
    ...patch,
    term,
    lemma: patch.lemma ?? deriveLemma(term),
    pos: patch.pos ?? derivePos(term),
    tags: patch.tags ? parseCsvList(patch.tags.join(",")) : existing.tags,
    aiExamples: patch.aiExamples ?? existing.aiExamples,
    collocations: patch.collocations ?? existing.collocations,
    updatedAt: Date.now(),
    dueAt: patch.dueAt ?? existing.dueAt,
    ease: patch.ease ?? existing.ease,
    intervalDays: patch.intervalDays ?? existing.intervalDays,
    lapses: patch.lapses ?? existing.lapses,
    streak: patch.streak ?? existing.streak,
    lastScore: patch.lastScore ?? existing.lastScore,
    lastReviewedAt: patch.lastReviewedAt ?? existing.lastReviewedAt,
    useCount: patch.useCount ?? existing.useCount,
    errorBuckets: patch.errorBuckets ?? existing.errorBuckets,
  };
}

async function readBlobJson(pathname: string): Promise<unknown> {
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return [];
    const raw = await new Response(result.stream).text();
    return JSON.parse(raw) as unknown;
  } catch {
    return [];
  }
}

function userBlobPath(userId: string): string {
  const normalized = userId.trim().toLowerCase().replaceAll(/[^a-z0-9._-]/g, "_");
  return `${VOCAB_BLOB_PATHNAME}/${normalized}.json`;
}

async function writeVocab(userId: string, list: VocabEntry[]): Promise<void> {
  await put(userBlobPath(userId), JSON.stringify(list), {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
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
    pos: input.pos ?? derivePos(term),
    definitionEasyEn: input.definitionEasyEn ?? "",
    meaningFa: input.meaningFa ?? "",
    userExample: input.userExample ?? "",
    aiExamples: input.aiExamples ?? [],
    collocations: input.collocations ?? [],
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
    errorBuckets: normalizedErrorBuckets,
  };
}

async function readLegacyAsVocab(): Promise<VocabEntry[]> {
  const legacy = (await readBlobJson(LEGACY_BLOB_PATHNAME)) as unknown;
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
      const parsed = parseAddCommand(message.text);
      const term = parsed?.term ?? message.text.trim();
      const sentence = parsed?.sentence ?? "";
      return {
        ...buildDefaultVocab({
          term,
          sentence,
          source: "telegram",
        }),
        id: `legacy-${message.id}`,
        createdAt: message.at,
        updatedAt: message.at,
      };
    });
}

export async function getVocabularies(userId: string): Promise<VocabEntry[]> {
  const data = (await readBlobJson(userBlobPath(userId))) as unknown;

  if (Array.isArray(data) && data.length > 0) {
    return [...(data as Partial<VocabEntry>[]).map(ensureShape)].sort((a, b) => b.updatedAt - a.updatedAt);
  }

  if (userId === "legacy-migration-owner") {
    const migrated = await readLegacyAsVocab();
    if (migrated.length > 0) {
      await writeVocab(userId, migrated);
    }
    return [...migrated].sort((a, b) => b.updatedAt - a.updatedAt);
  }

  return [];
}

export async function createVocabulary(
  userId: string,
  input: {
    term: string;
    sentence?: string;
    tags?: string[];
    source?: "telegram" | "web";
  },
): Promise<VocabEntry> {
  const list = await getVocabularies(userId);
  const entry = buildDefaultVocab({
    term: input.term,
    sentence: input.sentence,
    tags: input.tags ?? [],
    source: input.source ?? "web",
  });
  const updated = [entry, ...list];
  await writeVocab(userId, updated);
  return entry;
}

export async function createVocabularyFromTelegramText(
  userId: string,
  text: string,
): Promise<VocabEntry | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const parsed = parseAddCommand(trimmed);

  if (parsed) {
    return createVocabulary(userId, {
      term: parsed.term,
      sentence: parsed.sentence,
      source: "telegram",
    });
  }

  return createVocabulary(userId, {
    term: trimmed,
    source: "telegram",
  });
}

export async function updateVocabulary(
  userId: string,
  id: string,
  patch: Partial<VocabEntry>,
): Promise<VocabEntry | null> {
  const list = await getVocabularies(userId);
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updatedItem = patchVocabEntry(list[index], patch);
  const updatedList = [...list];
  updatedList[index] = updatedItem;
  await writeVocab(userId, updatedList);
  return updatedItem;
}

export async function deleteVocabulary(userId: string, id: string): Promise<boolean> {
  const list = await getVocabularies(userId);
  const updated = list.filter((item) => item.id !== id);
  if (updated.length === list.length) return false;
  await writeVocab(userId, updated);
  return true;
}

export async function getVocabulariesForExactUser(userId: string): Promise<VocabEntry[]> {
  const data = (await readBlobJson(userBlobPath(userId))) as unknown;
  if (!Array.isArray(data)) return [];
  return (data as Partial<VocabEntry>[]).map(ensureShape).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveVocabulariesForExactUser(userId: string, list: VocabEntry[]): Promise<void> {
  await writeVocab(userId, list.map((item) => ensureShape(item)));
}

export function toCsv(list: VocabEntry[]): string {
  return vocabToCsv(list);
}
