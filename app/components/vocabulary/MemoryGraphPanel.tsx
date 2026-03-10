"use client";

import { useEffect, useState } from "react";
import { MemoryGraph } from "@/app/features/vocabulary/types";
import { fetchJsonOrNull } from "@/app/lib/client/http";

export function MemoryGraphPanel() {
  const [graph, setGraph] = useState<MemoryGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let active = true;
    void fetchJsonOrNull<MemoryGraph>("/api/graph").then((data) => {
      if (!active) return;
      setGraph(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [refreshTick]);

  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-emerald-950">Context Memory Graph</h3>
          <p className="text-xs text-emerald-900/70">
            Semantic links between your words, collocations, tags, and recurrent mistakes.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            setRefreshTick((v) => v + 1);
          }}
          className="rounded-lg border border-emerald-900/20 bg-white px-2.5 py-1 text-xs font-medium text-emerald-900"
        >
          {loading ? "Refreshing..." : "Refresh graph"}
        </button>
      </div>

      {!graph ? (
        <p className="mt-3 text-sm text-emerald-900/70">Loading graph intelligence...</p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Nodes" value={graph.nodes.length} />
            <Stat label="Edges" value={graph.edges.length} />
            <Stat label="Clusters" value={graph.clusters.length} />
            <Stat label="Recommendations" value={graph.recommendations.length} />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <article className="rounded-xl border border-emerald-900/10 bg-emerald-50/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
                Top clusters
              </p>
              {graph.clusters.length === 0 ? (
                <p className="mt-2 text-xs text-emerald-900/75">Not enough linked items yet.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {graph.clusters.slice(0, 3).map((cluster) => (
                    <li key={cluster.id} className="rounded-lg border border-emerald-900/10 bg-white p-2">
                      <p className="text-sm font-medium text-emerald-950">{cluster.label}</p>
                      <p className="mt-1 text-xs text-emerald-900/80">{cluster.reason}</p>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="rounded-xl border border-emerald-900/10 bg-emerald-50/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
                Action recommendations
              </p>
              {graph.recommendations.length === 0 ? (
                <p className="mt-2 text-xs text-emerald-900/75">No recommendation yet. Add and review more words.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {graph.recommendations.slice(0, 3).map((item, idx) => (
                    <li key={`${item.title}-${idx}`} className="rounded-lg border border-emerald-900/10 bg-white p-2">
                      <p className="text-sm font-medium text-emerald-950">{item.title}</p>
                      <p className="mt-1 text-xs text-emerald-900/80">{item.description}</p>
                      <p className="mt-1 text-xs text-emerald-900/75">
                        Focus: {item.focusTerms.join(", ") || "n/a"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        </>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-emerald-900/10 bg-emerald-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-emerald-900/70">{label}</p>
      <p className="text-lg font-semibold text-emerald-950">{value}</p>
    </div>
  );
}
