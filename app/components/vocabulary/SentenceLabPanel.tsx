"use client";

import { useState } from "react";
import { SentenceLabResult } from "@/app/features/vocabulary/types";
import { postJson } from "@/app/lib/client/http";

export function SentenceLabPanel() {
  const [sentence, setSentence] = useState("");
  const [targetTerm, setTargetTerm] = useState("");
  const [result, setResult] = useState<SentenceLabResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!sentence.trim()) return;
    setLoading(true);
    try {
      const data = await postJson<SentenceLabResult>("/api/sentence-lab", {
        sentence: sentence.trim(),
        targetTerm: targetTerm.trim() || undefined,
      });
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-6">
      <h3 className="text-base font-semibold text-emerald-950">AI Sentence Lab</h3>
      <p className="mt-1 text-xs text-emerald-900/75">
        Get grammar and naturalness scoring, plus casual/formal rewrites.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <input
          value={targetTerm}
          onChange={(event) => setTargetTerm(event.target.value)}
          placeholder="Target term (optional)"
          className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => void run()}
          disabled={loading}
          className="rounded-lg bg-emerald-900 px-3 py-2 text-sm font-medium text-white"
        >
          {loading ? "Analyzing..." : "Analyze sentence"}
        </button>
      </div>
      <textarea
        value={sentence}
        onChange={(event) => setSentence(event.target.value)}
        placeholder="Write your sentence..."
        className="mt-3 min-h-24 w-full rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
      />
      {result ? (
        <div className="mt-3 rounded-lg border border-emerald-900/10 bg-emerald-50/40 p-3 text-sm text-emerald-900">
          <p>
            Score {result.score}/100 • Grammar {result.grammar} • Naturalness {result.naturalness} •{" "}
            {result.register}
          </p>
          <p className="mt-1 text-xs">
            <strong>Casual:</strong> {result.rewriteCasual}
          </p>
          <p className="mt-1 text-xs">
            <strong>Formal:</strong> {result.rewriteFormal}
          </p>
          <ul className="mt-2 list-disc pl-4 text-xs">
            {result.tips.map((tip, idx) => (
              <li key={`${tip}-${idx}`}>{tip}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
