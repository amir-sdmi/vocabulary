"use client";

import { useEffect, useState } from "react";
import { AnalyticsSnapshot, MasteryLevel } from "@/app/features/vocabulary/types";
import { fetchJsonOrNull } from "@/app/lib/client/http";

const LEVEL_ORDER: MasteryLevel[] = ["seen", "practiced", "stable", "fluent"];

export function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsSnapshot | null>(null);

  useEffect(() => {
    let active = true;
    void fetchJsonOrNull<AnalyticsSnapshot>("/api/analytics").then((snapshot) => {
      if (!active) return;
      setData(snapshot);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-6">
      <h3 className="text-base font-semibold text-emerald-950">Learning Analytics Dashboard</h3>
      <p className="mt-1 text-xs text-emerald-900/75">
        Retention, mastery, growth, and struggling-word signal in one place.
      </p>
      {!data ? (
        <p className="mt-3 text-sm text-emerald-900/70">Loading analytics...</p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <Metric label="Retention 7d" value={`${data.retentionRate7d}%`} />
            <Metric label="Avg response" value={`${data.averageResponseScore7d}`} />
            <Metric label="Avg mastery" value={`${data.averageMastery}%`} />
            <Metric label="Active words" value={`${data.activeWords}`} />
          </div>

          <div className="mt-4 rounded-lg border border-emerald-900/10 bg-emerald-50/30 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
              Mastery breakdown
            </p>
            <div className="mt-2 space-y-1.5">
              {LEVEL_ORDER.map((level) => {
                const count = data.levelBreakdown[level] ?? 0;
                const pct = data.totalWords > 0 ? Math.round((count / data.totalWords) * 100) : 0;
                return (
                  <div key={level}>
                    <div className="flex items-center justify-between text-xs text-emerald-900/80">
                      <span>{level}</span>
                      <span>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-emerald-100">
                      <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <article className="rounded-lg border border-emerald-900/10 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">Top improved</p>
              <p className="mt-1 text-sm text-emerald-900/85">
                {data.topImprovedTerms.join(", ") || "Not enough practice data yet"}
              </p>
            </article>
            <article className="rounded-lg border border-emerald-900/10 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">Struggling terms</p>
              <p className="mt-1 text-sm text-emerald-900/85">
                {data.strugglingTerms.join(", ") || "None"}
              </p>
            </article>
          </div>
        </>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-900/10 bg-emerald-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-emerald-900/70">{label}</p>
      <p className="text-lg font-semibold text-emerald-950">{value}</p>
    </div>
  );
}
