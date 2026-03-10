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
            <article className="rounded-xl border border-emerald-900/10 bg-white p-3 lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
                Interactive graph canvas
              </p>
              <GraphCanvas graph={graph} />
            </article>

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

function GraphCanvas({ graph }: { graph: MemoryGraph }) {
  const width = 920;
  const height = 360;
  const centerX = width / 2;
  const centerY = height / 2;
  const terms = graph.nodes.filter((n) => n.type === "term").slice(0, 24);
  const others = graph.nodes.filter((n) => n.type !== "term").slice(0, 30);
  const termMap = new Map<string, { x: number; y: number; label: string; r: number }>();
  const otherMap = new Map<string, { x: number; y: number; label: string; r: number; type: string }>();

  terms.forEach((node, i) => {
    const angle = (Math.PI * 2 * i) / Math.max(1, terms.length);
    const radius = 95 + (i % 3) * 24;
    termMap.set(node.id, {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      label: node.label,
      r: Math.max(5, Math.min(12, 4 + node.weight * 0.35)),
    });
  });

  others.forEach((node, i) => {
    const angle = (Math.PI * 2 * i) / Math.max(1, others.length);
    const radius = 165 + (i % 4) * 16;
    otherMap.set(node.id, {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      label: node.label,
      type: node.type,
      r: Math.max(4, Math.min(9, 3 + node.weight * 0.3)),
    });
  });

  const points = new Map([...termMap.entries(), ...otherMap.entries()]);
  const edges = graph.edges.filter((e) => points.has(e.from) && points.has(e.to)).slice(0, 120);

  return (
    <div className="mt-2 overflow-auto rounded-lg border border-emerald-900/10 bg-[radial-gradient(circle_at_top_left,#f2fff6_0%,#ffffff_55%,#eefaf4_100%)] p-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[320px] w-full min-w-[760px]">
        {edges.map((edge) => {
          const from = points.get(edge.from)!;
          const to = points.get(edge.to)!;
          return (
            <line
              key={edge.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="rgba(16, 88, 53, 0.22)"
              strokeWidth={Math.min(2.5, 0.5 + edge.weight * 0.18)}
            />
          );
        })}

        {Array.from(otherMap.entries()).map(([id, point]) => (
          <g key={id}>
            <circle
              cx={point.x}
              cy={point.y}
              r={point.r}
              fill={
                point.type === "tag"
                  ? "rgba(125, 211, 252, 0.7)"
                  : point.type === "error"
                    ? "rgba(253, 164, 175, 0.75)"
                    : "rgba(253, 230, 138, 0.75)"
              }
              stroke="rgba(9, 35, 20, 0.35)"
            />
          </g>
        ))}

        {Array.from(termMap.entries()).map(([id, point]) => (
          <g key={id}>
            <circle
              cx={point.x}
              cy={point.y}
              r={point.r}
              fill="rgba(16, 185, 129, 0.82)"
              stroke="rgba(9, 35, 20, 0.38)"
              strokeWidth={1.2}
            />
            <text
              x={point.x + point.r + 3}
              y={point.y + 3}
              fontSize="9"
              fill="rgba(9, 35, 20, 0.88)"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
