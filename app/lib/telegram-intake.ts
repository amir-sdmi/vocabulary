import { parseAddCommand } from "@/app/features/vocabulary/helpers";

export type TelegramExtractedEntry = {
  term: string;
  meaning?: string;
  sentence?: string;
  tags: string[];
  collocations: string[];
  synonyms: string[];
  antonyms: string[];
  wordFamily?: {
    noun?: string;
    verb?: string;
    adjective?: string;
    adverb?: string;
  };
  confidence: number;
  source: "heuristic" | "ai";
};

type LlmExtraction = {
  term?: string;
  meaning?: string;
  sentence?: string;
  tags?: string[];
  collocations?: string[];
  synonyms?: string[];
  antonyms?: string[];
  wordFamily?: {
    noun?: string;
    verb?: string;
    adjective?: string;
    adverb?: string;
  };
  confidence?: number;
};

function uniqueClean(values: string[] | undefined): string[] {
  if (!values) return [];
  return Array.from(
    new Set(
      values
        .map((v) => String(v).trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

function pickFallbackTerm(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (!cleaned) return "unknown";
  const withoutPunct = cleaned.replace(/[^\p{L}\p{N}\s'-]/gu, " ").replace(/\s+/g, " ").trim();
  if (!withoutPunct) return cleaned.slice(0, 30);
  const words = withoutPunct.split(" ").filter(Boolean);
  return words.slice(0, Math.min(4, words.length)).join(" ");
}

function heuristicExtract(text: string): TelegramExtractedEntry {
  const trimmed = text.trim();
  const parsedAdd = parseAddCommand(trimmed);
  const hashtagTags = Array.from(trimmed.matchAll(/#([a-z0-9_-]+)/gi)).map((m) => m[1].toLowerCase());

  if (parsedAdd) {
    return {
      term: parsedAdd.term,
      meaning: parsedAdd.meaning,
      sentence: parsedAdd.sentence,
      tags: uniqueClean([...(parsedAdd.tags ?? []), ...hashtagTags]),
      collocations: parsedAdd.term.includes(" ") ? [parsedAdd.term.toLowerCase()] : [],
      synonyms: [],
      antonyms: [],
      confidence: 0.8,
      source: "heuristic",
    };
  }

  const split = trimmed.split(/\s*[-:]\s*/);
  const hasDefinitionPattern = split.length >= 2 && split[0].length > 0 && split[1].length > 0;
  const term = hasDefinitionPattern ? split[0].trim() : pickFallbackTerm(trimmed);
  const meaning = hasDefinitionPattern ? split.slice(1).join(" ").trim() : undefined;
  const sentence = /[.!?]$/.test(trimmed) && trimmed.split(/\s+/).length > 4 ? trimmed : undefined;
  const collocations =
    !sentence && term.includes(" ") && term.split(/\s+/).length <= 5 ? [term.toLowerCase()] : [];

  return {
    term,
    meaning,
    sentence,
    tags: uniqueClean(hashtagTags),
    collocations,
    synonyms: [],
    antonyms: [],
    confidence: hasDefinitionPattern ? 0.75 : 0.55,
    source: "heuristic",
  };
}

async function aiExtract(text: string): Promise<LlmExtraction | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const prompt = `
You are a robust lexical parser for a Telegram vocabulary bot.
Convert ANY user message into a single vocabulary entry for learning.
If the message is short (one word/collocation), keep it as term.
If the message is noisy, pick the most teachable term/phrase.
If tags appear (#work), extract them.
If a meaning/example exists, extract it.
Never return an empty term.
Return strict JSON with keys:
term, meaning, sentence, tags, collocations, synonyms, antonyms, wordFamily, confidence.
wordFamily object keys: noun, verb, adjective, adverb.
Use lowercase tags.
confidence is 0..1.
Message:
${text}
`.trim();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return only valid JSON." },
        { role: "user", content: prompt },
      ],
    }),
  }).catch(() => null);

  if (!response?.ok) return null;
  const json = (await response.json().catch(() => null)) as
    | { choices?: Array<{ message?: { content?: string } }> }
    | null;
  const raw = json?.choices?.[0]?.message?.content;
  if (!raw) return null;
  return (JSON.parse(raw) as LlmExtraction) ?? null;
}

function normalizeLlmExtraction(raw: LlmExtraction, original: string): TelegramExtractedEntry {
  const term = String(raw.term || "").trim() || pickFallbackTerm(original);
  return {
    term,
    meaning: raw.meaning?.trim() || undefined,
    sentence: raw.sentence?.trim() || undefined,
    tags: uniqueClean(raw.tags),
    collocations: uniqueClean(raw.collocations),
    synonyms: uniqueClean(raw.synonyms),
    antonyms: uniqueClean(raw.antonyms),
    wordFamily: raw.wordFamily,
    confidence:
      typeof raw.confidence === "number" && raw.confidence >= 0 && raw.confidence <= 1
        ? raw.confidence
        : 0.7,
    source: "ai",
  };
}

export async function extractTelegramEntry(text: string): Promise<TelegramExtractedEntry> {
  const heuristic = heuristicExtract(text);
  const llm = await aiExtract(text);
  if (!llm) return heuristic;
  const normalized = normalizeLlmExtraction(llm, text);
  if (!normalized.term.trim()) return heuristic;
  return normalized;
}
