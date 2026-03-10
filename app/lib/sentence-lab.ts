import { SentenceLabResult } from "@/app/features/vocabulary/types";

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function heuristicResult(sentence: string): SentenceLabResult {
  const trimmed = sentence.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const hasPunc = /[.!?]$/.test(trimmed);
  const grammar = clamp(70 + (hasPunc ? 15 : -10) + (words.length >= 6 ? 10 : -10));
  const naturalness = clamp(65 + (words.length >= 7 && words.length <= 20 ? 20 : -5));
  const register: SentenceLabResult["register"] =
    /\b(gonna|wanna|gotta|yep)\b/i.test(trimmed) ? "casual" : "neutral";
  const score = clamp((grammar + naturalness) / 2);
  const rewriteCasual = trimmed.replace(/\bI am\b/g, "I'm");
  const rewriteFormal = trimmed.replace(/\bI'm\b/g, "I am");
  const tips = [
    hasPunc ? "Good sentence ending punctuation." : "Add proper ending punctuation.",
    words.length < 6 ? "Expand with a clearer context clause." : "Length is good for production practice.",
  ];
  return {
    score,
    grammar,
    naturalness,
    register,
    rewriteCasual,
    rewriteFormal,
    tips,
  };
}

export async function evaluateSentenceLab(input: {
  sentence: string;
  targetTerm?: string;
}): Promise<SentenceLabResult> {
  const sentence = input.sentence.trim();
  const fallback = heuristicResult(sentence);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallback;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const prompt = `
Evaluate this learner sentence for grammar, naturalness, and register.
Return strict JSON with keys:
score, grammar, naturalness, register, rewriteCasual, rewriteFormal, tips.
tips should be array of short actionable strings.
Target term: ${input.targetTerm ?? "none"}
Sentence: ${sentence}
`.trim();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return only valid JSON." },
        { role: "user", content: prompt },
      ],
    }),
  }).catch(() => null);
  if (!response?.ok) return fallback;
  const raw = (await response.json().catch(() => null)) as
    | { choices?: Array<{ message?: { content?: string } }> }
    | null;
  const content = raw?.choices?.[0]?.message?.content;
  if (!content) return fallback;
  const parsed = (JSON.parse(content) as Partial<SentenceLabResult>) ?? {};
  return {
    score: clamp(parsed.score ?? fallback.score),
    grammar: clamp(parsed.grammar ?? fallback.grammar),
    naturalness: clamp(parsed.naturalness ?? fallback.naturalness),
    register:
      parsed.register === "casual" || parsed.register === "formal" || parsed.register === "neutral"
        ? parsed.register
        : fallback.register,
    rewriteCasual: parsed.rewriteCasual?.trim() || fallback.rewriteCasual,
    rewriteFormal: parsed.rewriteFormal?.trim() || fallback.rewriteFormal,
    tips: Array.isArray(parsed.tips) && parsed.tips.length > 0 ? parsed.tips : fallback.tips,
  };
}
