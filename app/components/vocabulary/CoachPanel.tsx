"use client";

import { useState } from "react";
import { ReviewMode, ReviewQueueItem } from "@/app/features/vocabulary/types";
import { fetchJson, postJson } from "@/app/lib/client/http";
import { REVIEW_MODE_OPTIONS } from "@/app/features/vocabulary/review-modes";

export function CoachPanel() {
  const [mode, setMode] = useState<ReviewMode>("daily");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [index, setIndex] = useState(0);
  const [taskIndex, setTaskIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string>("");
  const [linkCode, setLinkCode] = useState("");
  const [tag, setTag] = useState("");
  const [sessionScores, setSessionScores] = useState<Array<{ term: string; score: number }>>([]);
  const primaryModes = REVIEW_MODE_OPTIONS.filter((item) =>
    ["daily", "trouble", "quick"].includes(item.mode),
  );
  const skillModes = REVIEW_MODE_OPTIONS.filter(
    (item) => !["daily", "trouble", "quick", "tag"].includes(item.mode),
  );

  async function startSession(selectedMode: ReviewMode) {
    setMode(selectedMode);
    setLoading(true);
    setFeedback("");
    setSessionScores([]);
    try {
      const query =
        selectedMode === "tag"
          ? `/api/review/session?mode=tag&tag=${encodeURIComponent(tag.trim().toLowerCase())}`
          : `/api/review/session?mode=${selectedMode}`;
      const data = await fetchJson<{ items: ReviewQueueItem[] }>(query);
      setItems(data.items ?? []);
      setIndex(0);
      setTaskIndex(0);
      setAnswer("");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    const item = items[index];
    const task = item?.tasks[taskIndex];
    if (!item || !task || !answer.trim()) return;

    const data = await postJson<{
      attempt?: { score: number; feedback: string; fixedAnswer: string };
    }>("/api/review/answer", {
        vocabId: item.vocab.id,
        mode,
        taskType: task.type,
        prompt: task.prompt,
        answer: answer.trim(),
    });
    const attempt = data.attempt;

    if (attempt) {
      setSessionScores((currentScores) => [
        ...currentScores,
        { term: item.vocab.term, score: attempt.score },
      ]);
      setFeedback(
        `Score ${attempt.score}/100. ${attempt.feedback} Fix: ${attempt.fixedAnswer}`,
      );
    }
    setAnswer("");

    if (taskIndex < item.tasks.length - 1) {
      setTaskIndex((v) => v + 1);
      return;
    }
    if (index < items.length - 1) {
      setIndex((v) => v + 1);
      setTaskIndex(0);
      return;
    }
    const all = [...sessionScores, ...(attempt ? [{ term: item.vocab.term, score: attempt.score }] : [])];
    const avg = all.length > 0 ? Math.round(all.reduce((s, x) => s + x.score, 0) / all.length) : 0;
    const trouble = all.filter((x) => x.score < 70).map((x) => x.term);
    setFeedback(
      (old) =>
        `${old}\nSession complete.\nDaily score: ${avg}/100\nTrouble words: ${
          trouble.join(", ") || "None"
        }\nPlan: I will prioritize weak words in tomorrow's session.`,
    );
  }

  async function generateLinkCode() {
    const data = await postJson<{ code?: string }>("/api/link/start", {});
    if (data.code) setLinkCode(data.code);
  }

  const current = items[index];
  const currentTask = current?.tasks[taskIndex];

  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-emerald-950">Daily Coach</h2>
        <div className="flex gap-2">
          {primaryModes.map((item) => (
            <button
              key={item.mode}
              onClick={() => void startSession(item.mode)}
              className={`rounded-lg border border-emerald-900/20 px-3 py-1.5 text-sm text-emerald-900 ${
                item.mode === "daily" ? "bg-emerald-50" : "bg-white"
              }`}
            >
              {item.label}
            </button>
          ))}
          <input
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            placeholder="tag"
            className="w-28 rounded-lg border border-emerald-900/20 bg-white px-2 py-1.5 text-xs"
          />
          <button
            onClick={() => void startSession("tag")}
            className="rounded-lg border border-emerald-900/20 bg-white px-3 py-1.5 text-sm text-emerald-900"
          >
            Review tag
          </button>
          {skillModes.map((item) => (
            <button
              key={item.mode}
              onClick={() => void startSession(item.mode)}
              className="rounded-lg border border-emerald-900/20 bg-white px-3 py-1.5 text-sm text-emerald-900"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-emerald-900/10 bg-emerald-50/40 p-3 text-sm text-emerald-900/85">
        <p className="font-medium">Link Telegram to this account</p>
        <p className="mt-1">Generate code then send <code>/link CODE</code> to your Telegram bot.</p>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => void generateLinkCode()}
            className="rounded-lg border border-emerald-900/20 bg-white px-3 py-1.5 text-xs font-medium"
          >
            Generate link code
          </button>
          {linkCode ? <code className="rounded bg-white px-2 py-1 text-xs">{linkCode}</code> : null}
        </div>
      </div>

      {loading ? <p className="mt-3 text-sm text-emerald-900/70">Loading session...</p> : null}
      {!loading && !current ? (
        <p className="mt-3 text-sm text-emerald-900/70">
          Start a session to practice fill-gap, rewrite, and free sentence tasks.
        </p>
      ) : null}

      {current && currentTask ? (
        <div className="mt-4 space-y-3 rounded-xl border border-emerald-900/10 bg-white p-4">
          <p className="text-xs text-emerald-900/60">
            Word {index + 1}/{items.length} • Task {taskIndex + 1}/{current.tasks.length} •{" "}
            <strong>{current.vocab.term}</strong>
          </p>
          <p className="text-sm text-emerald-900">{currentTask.prompt}</p>
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Type your answer..."
            className="min-h-20 w-full rounded-lg border border-emerald-900/20 px-3 py-2 text-sm"
          />
          <button
            onClick={() => void submitAnswer()}
            className="rounded-lg bg-emerald-900 px-3 py-2 text-sm font-medium text-white"
          >
            Check answer
          </button>
          {feedback ? (
            <pre className="whitespace-pre-wrap rounded-lg border border-emerald-900/10 bg-emerald-50/60 p-3 text-xs text-emerald-900">
              {feedback}
            </pre>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
