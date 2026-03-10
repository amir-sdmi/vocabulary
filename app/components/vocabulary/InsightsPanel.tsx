"use client";

import { useEffect, useState } from "react";

type StatsResponse = {
  totalWords: number;
  retainedWords: number;
  forgottenWords: number;
  usableWords: number;
  reviews7d: number;
  avgScore7d: number;
  troubleWords: Array<{ id: string; term: string; lapses: number; lastScore: number | null }>;
  topErrors: Array<{ type: string; count: number }>;
};

type MistakesResponse = {
  notebook: Array<{ type: string; count: number; tip: string }>;
};

type GoalResponse = {
  today: {
    correctProductionCount: number;
    target: number;
    met: boolean;
  };
  streak: number;
};

type WeeklyResponse = {
  weekStart: string;
  weekEnd: string;
  recommendation: string;
};

export function InsightsPanel() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [mistakes, setMistakes] = useState<MistakesResponse | null>(null);
  const [goal, setGoal] = useState<GoalResponse | null>(null);
  const [weekly, setWeekly] = useState<WeeklyResponse | null>(null);

  async function load() {
    void fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStats(data))
      .catch(() => setStats(null));
    void fetch("/api/mistakes")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setMistakes(data))
      .catch(() => setMistakes(null));
    void fetch("/api/goal")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setGoal(data))
      .catch(() => setGoal(null));
    void fetch("/api/reports/weekly")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setWeekly(data))
      .catch(() => setWeekly(null));
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-emerald-950">Progress Snapshot</h3>
          <button
            onClick={() => void load()}
            className="rounded-lg border border-emerald-900/20 bg-white px-2.5 py-1 text-xs font-medium text-emerald-900"
          >
            Refresh
          </button>
        </div>
        {!stats ? (
          <p className="mt-2 text-sm text-emerald-900/70">Loading metrics...</p>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Metric label="Total words" value={stats.totalWords} />
              <Metric label="Retained" value={stats.retainedWords} />
              <Metric label="Forgotten" value={stats.forgottenWords} />
              <Metric label="Usable" value={stats.usableWords} />
              <Metric label="Reviews (7d)" value={stats.reviews7d} />
              <Metric label="Avg score (7d)" value={stats.avgScore7d} />
            </div>
            {goal ? (
              <div className="mt-3 rounded-lg border border-emerald-900/10 bg-emerald-50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
                  Daily goal
                </p>
                <p className="mt-1 text-sm text-emerald-900/90">
                  Correct production: {goal.today.correctProductionCount}/{goal.today.target} • streak:{" "}
                  {goal.streak} day(s)
                </p>
              </div>
            ) : null}
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
                Trouble words
              </p>
              <p className="mt-1 text-sm text-emerald-900/80">
                {stats.troubleWords.slice(0, 5).map((x) => x.term).join(", ") || "None"}
              </p>
            </div>
          </>
        )}
      </article>

      <article className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-emerald-950">Mistake Notebook</h3>
        {!mistakes ? (
          <p className="mt-2 text-sm text-emerald-900/70">Loading notes...</p>
        ) : mistakes.notebook.length === 0 ? (
          <p className="mt-2 text-sm text-emerald-900/70">No repeated mistakes yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {mistakes.notebook.map((item) => (
              <li key={item.type} className="rounded-lg border border-emerald-900/10 bg-emerald-50/50 p-3">
                <p className="text-sm font-medium text-emerald-900">
                  {item.type} ({item.count})
                </p>
                <p className="mt-1 text-xs text-emerald-900/80">{item.tip}</p>
              </li>
            ))}
          </ul>
        )}
        {weekly ? (
          <div className="mt-3 rounded-lg border border-emerald-900/10 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
              Weekly Recommendation ({weekly.weekStart} to {weekly.weekEnd})
            </p>
            <p className="mt-1 text-xs text-emerald-900/85">{weekly.recommendation}</p>
          </div>
        ) : null}
      </article>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-emerald-900/10 bg-emerald-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-emerald-900/70">{label}</p>
      <p className="text-lg font-semibold text-emerald-950">{value}</p>
    </div>
  );
}
