import {
  parseCsvList,
  parseCsvRows,
  parsePipeRow,
  vocabToCsv,
} from "@/app/features/vocabulary/helpers";
import {
  ImportDedupeAction,
  ImportJob,
  ImportPreviewRow,
  ImportSource,
  VocabEntry,
} from "@/app/features/vocabulary/types";
import * as importsRepo from "@/app/lib/repositories/imports-repo";
import * as vocabRepo from "@/app/lib/repositories/vocab-repo";

function normalizeHeaders(headers: string[]) {
  return headers.map((h) => h.trim().toLowerCase());
}

function buildDefaultFieldMapping(headers: string[]) {
  const map: Record<string, string> = {};
  for (const header of headers) map[header] = header;
  return map;
}

function parseImportRow(headers: string[], row: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((h, i) => {
    out[h] = row[i] ?? "";
  });
  return out;
}

function toEntryFromRaw(raw: Record<string, string>): Partial<VocabEntry> {
  const term = raw.term?.trim() || raw.word?.trim() || raw.phrase?.trim() || "";
  const meaning = raw.meaning?.trim() || raw.definitioneasyen?.trim() || "";
  const meaningFa = raw.meaningfa?.trim() || "";
  const userExample = raw.example?.trim() || raw.userexample?.trim() || "";
  const tags = parseCsvList(raw.tags?.replaceAll("|", ","));
  const collocations = parseCsvList(raw.collocations?.replaceAll("|", ","));
  const synonyms = parseCsvList(raw.synonyms?.replaceAll("|", ","));
  const antonyms = parseCsvList(raw.antonyms?.replaceAll("|", ","));
  const pos = raw.pos?.trim() || "";
  const entryType = raw.entrytype?.trim() === "phrase" || term.includes(" ") ? "phrase" : "word";

  return {
    term,
    definitionEasyEn: meaning,
    meaningFa,
    userExample,
    tags,
    collocations,
    synonyms,
    antonyms,
    pos,
    entryType,
    wordFamily: {
      noun: raw.wordfamilynoun?.trim() || undefined,
      verb: raw.wordfamilyverb?.trim() || undefined,
      adjective: raw.wordfamilyadjective?.trim() || undefined,
      adverb: raw.wordfamilyadverb?.trim() || undefined,
    },
  };
}

function dedupeActionForEntry(
  list: VocabEntry[],
  parsed: Partial<VocabEntry>,
): { action: ImportDedupeAction; duplicateOf?: string } {
  const term = parsed.term?.trim().toLowerCase();
  if (!term) return { action: "skip" };
  const existing = list.find((x) => x.term.trim().toLowerCase() === term);
  if (!existing) return { action: "create" };
  if ((existing.definitionEasyEn || "").trim().toLowerCase() === (parsed.definitionEasyEn || "").trim().toLowerCase()) {
    return { action: "skip", duplicateOf: existing.id };
  }
  return { action: "update", duplicateOf: existing.id };
}

function makePreviewRows(input: {
  headers: string[];
  bodyRows: string[][];
  existing: VocabEntry[];
}): ImportPreviewRow[] {
  return input.bodyRows.map((row, index) => {
    const raw = parseImportRow(input.headers, row);
    const parsed = toEntryFromRaw(raw);
    const errors: string[] = [];
    if (!parsed.term?.trim()) errors.push("Missing term");
    const dedupe = dedupeActionForEntry(input.existing, parsed);
    return {
      row: index + 2,
      raw,
      parsed,
      errors,
      dedupeAction: errors.length > 0 ? "skip" : dedupe.action,
      duplicateOf: dedupe.duplicateOf,
    };
  });
}

export async function getVocabularies(userId: string): Promise<VocabEntry[]> {
  return vocabRepo.getAll(userId);
}

export async function createVocabulary(
  userId: string,
  input: {
    term: string;
    sentence?: string;
    tags?: string[];
    source?: "telegram" | "web";
    meaning?: string;
  },
): Promise<VocabEntry> {
  return vocabRepo.create(userId, input);
}

export async function createVocabularyFromTelegramText(
  userId: string,
  text: string,
): Promise<VocabEntry | null> {
  return vocabRepo.createFromText(userId, text);
}

export async function updateVocabulary(
  userId: string,
  id: string,
  patch: Partial<VocabEntry>,
): Promise<VocabEntry | null> {
  return vocabRepo.update(userId, id, patch);
}

export async function deleteVocabulary(userId: string, id: string): Promise<boolean> {
  return vocabRepo.remove(userId, id);
}

export async function getVocabulariesForExactUser(userId: string): Promise<VocabEntry[]> {
  return vocabRepo.getAll(userId);
}

export async function saveVocabulariesForExactUser(userId: string, list: VocabEntry[]): Promise<void> {
  return vocabRepo.saveAll(userId, list);
}

export function toCsv(list: VocabEntry[]): string {
  return vocabToCsv(list);
}

export async function previewImport(input: {
  userId: string;
  source: ImportSource;
  content: string;
}): Promise<ImportJob> {
  const rows = parseCsvRows(input.content);
  if (rows.length === 0) {
    throw new Error("No rows found");
  }
  const headers = normalizeHeaders(rows[0]);
  const bodyRows = rows.slice(1);
  const existing = await getVocabularies(input.userId);
  const previewRows = makePreviewRows({ headers, bodyRows, existing });
  const validRows = previewRows.filter((x) => x.errors.length === 0);
  const now = Date.now();
  const job: ImportJob = {
    id: `import-${now}-${Math.random().toString(36).slice(2, 8)}`,
    userId: input.userId,
    source: input.source,
    status: "previewed",
    createdAt: now,
    updatedAt: now,
    fieldMapping: buildDefaultFieldMapping(headers),
    rowsTotal: previewRows.length,
    rowsValid: validRows.length,
    rowsCreated: 0,
    rowsUpdated: 0,
    rowsSkipped: previewRows.length - validRows.length,
    errors: previewRows.flatMap((x) => x.errors.map((message) => ({ row: x.row, message }))),
    previewRows,
  };
  await importsRepo.add(input.userId, job);
  return job;
}

export async function executeImport(input: {
  userId: string;
  source: ImportSource;
  content: string;
}): Promise<ImportJob> {
  const preview = await previewImport(input);
  const list = await getVocabularies(input.userId);
  let created = 0;
  let updated = 0;
  let skipped = preview.rowsSkipped;
  let working = [...list];

  for (const row of preview.previewRows) {
    if (row.errors.length > 0) continue;
    const parsed = row.parsed;
    if (!parsed.term?.trim()) {
      skipped += 1;
      continue;
    }
    const existing = working.find((x) => x.term.trim().toLowerCase() === parsed.term!.trim().toLowerCase());
    if (!existing) {
      const fresh = await createVocabulary(input.userId, {
        term: parsed.term,
        sentence: parsed.userExample,
        tags: parsed.tags ?? [],
        meaning: parsed.definitionEasyEn,
        source: "web",
      });
      if (parsed.collocations?.length || parsed.synonyms?.length || parsed.antonyms?.length || parsed.wordFamily) {
        await updateVocabulary(input.userId, fresh.id, {
          collocations: parsed.collocations ?? [],
          synonyms: parsed.synonyms ?? [],
          antonyms: parsed.antonyms ?? [],
          wordFamily: parsed.wordFamily,
          pos: parsed.pos,
          entryType: parsed.entryType,
          meaningFa: parsed.meaningFa,
        });
      }
      created += 1;
      working = await getVocabularies(input.userId);
      continue;
    }
    const changed =
      (parsed.definitionEasyEn && parsed.definitionEasyEn !== existing.definitionEasyEn) ||
      (parsed.userExample && parsed.userExample !== existing.userExample) ||
      (parsed.meaningFa && parsed.meaningFa !== existing.meaningFa);
    if (!changed) {
      skipped += 1;
      continue;
    }
    await updateVocabulary(input.userId, existing.id, {
      definitionEasyEn: parsed.definitionEasyEn || existing.definitionEasyEn,
      meaningFa: parsed.meaningFa || existing.meaningFa,
      userExample: parsed.userExample || existing.userExample,
      tags: parsed.tags?.length ? parsed.tags : existing.tags,
      collocations: parsed.collocations?.length ? parsed.collocations : existing.collocations,
      synonyms: parsed.synonyms?.length ? parsed.synonyms : existing.synonyms,
      antonyms: parsed.antonyms?.length ? parsed.antonyms : existing.antonyms,
      wordFamily: parsed.wordFamily ?? existing.wordFamily,
      entryType: parsed.entryType ?? existing.entryType,
      pos: parsed.pos || existing.pos,
    });
    updated += 1;
  }

  const completed: ImportJob = {
    ...preview,
    status: "completed",
    updatedAt: Date.now(),
    rowsCreated: created,
    rowsUpdated: updated,
    rowsSkipped: skipped,
  };
  await importsRepo.add(input.userId, completed);
  return completed;
}

export function parseGoogleSheetCsv(raw: string): string[][] {
  return parseCsvRows(raw);
}

export function parseAnkiCsv(raw: string): string[][] {
  return parseCsvRows(raw).map((row) => {
    if (row.length >= 4) return row;
    const parts = parsePipeRow(row[0] ?? "");
    return parts.length >= 4 ? parts : row;
  });
}
