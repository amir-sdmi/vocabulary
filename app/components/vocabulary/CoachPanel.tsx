"use client";

import { useState } from "react";
import { ReviewQueueItem } from "@/app/features/vocabulary/types";

type ReviewMode =
  | "daily"
  | "trouble"
  | "quick"
  | "tag"
  | "recall"
  | "writing"
  | "collocation"
  | "error_correction"
  | "active_usage"
  | "weak_area"
  | "use_today";

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
      const response = await fetch(query);
      const data = (await response.json()) as { items: ReviewQueueItem[] };
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

    const response = await fetch("/api/review/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vocabId: item.vocab.id,
        mode,
        taskType: task.type,
        prompt: task.prompt,
        answer: answer.trim(),
      }),
    });
    const data = (await response.json()) as {
      attempt?: { score: number; feedback: string; fixedAnswer: string };
    };
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
    const response = await fetch("/api/link/start", { method: "POST" });
    const data = (await response.json()) as { code?: string };
    if (data.code) setLinkCode(data.code);
  }

  const current = items[index];
  const currentTask = current?.tasks[taskIndex];

  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-emerald-950">Daily Coach</h2>
        <div className="flex gap-2">
          <button
            onClick={() => void startSession("daily")}
            className="rounded-lg border border-emerald-900/20 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-900"
          >
            Daily 10
          </button>
          <button
            onClick={() => void startSession("trouble")}
            className="rounded-lg border border-emerald-900/20 bg-white px-3 py-1.5 text-sm text-emerald-900"
          >
            Trouble only
          </button>
          <button
            onClick={() => void startSession("quick")}
            className="rounded-lg border border-emerald-900/20 bg-white px-3 py-1.5 text-sm text-emerald-900"
          >
            Quick 5 min
          </button>
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
          <button
            onClick={() => void startSession("recall")}
            className="rounded-lg border border-emerald-900/20 bg-white px-3 py-1.5 text-sm text-emerald-900"
          >
            Recall
          </button>
          <button
            onClick={() => void startSession("writing")}
            className="rounded-lg border border-emerald-900/20 bg-white px-3 py-1.5 text-sm text-emerald-900"
          >
            Writing
          </button>
          <button
            onClick={() => void startSession("collocation")}
            className="rounded-lg border border-emerald-900/20 bg-white px-3 py-1.5 text-sm text-emerald-900"
          >
            Collocation
          </button>
          <button
            onClick={() => void startSession("error_correction")}
            className="rounded-lg border border-emerald-900/20 bg-white px-3 py-1.5 text-sm text-emerald-900"
          >
            Error fix
          </button>
          <button
            onClick={() => void startSession("active_usage")}
            className="rounded-lg border border-emerald-900/20 bg-white px-3 py-1.5 text-sm text-emerald-900"
          >
            Active usage
          </button>
          <button
            onClick={() => void startSession("weak_area")}
            className="rounded-lg border border-emerald-900/20 bg-white px-3 py-1.5 text-sm text-emerald-900"
          >
            Weak area
          </button>
          <button
            onClick={() => void startSession("use_today")}
            className="rounded-lg border border-emerald-900/20 bg-white px-3 py-1.5 text-sm text-emerald-900"
          >
            Use today
          </button>
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
