"use client";

import { useEffect, useState } from "react";
import { TopicMission } from "@/app/features/vocabulary/types";
import { fetchJsonOrNull } from "@/app/lib/client/http";

type MissionsResponse = { missions: TopicMission[] };

export function MissionsPanel() {
  const [missions, setMissions] = useState<TopicMission[]>([]);

  useEffect(() => {
    let active = true;
    void fetchJsonOrNull<MissionsResponse>("/api/missions").then((data) => {
      if (!active) return;
      setMissions(data?.missions ?? []);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-6">
      <h3 className="text-base font-semibold text-emerald-950">Topic Missions</h3>
      <p className="mt-1 text-xs text-emerald-900/75">
        Weekly missions per topic/tag to keep practice goal-oriented.
      </p>
      {missions.length === 0 ? (
        <p className="mt-3 text-sm text-emerald-900/70">Add more tagged words to unlock missions.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {missions.map((mission) => {
            const pct = Math.min(100, Math.round((mission.progress / mission.target) * 100));
            return (
              <li key={mission.id} className="rounded-lg border border-emerald-900/10 bg-emerald-50/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-emerald-950">{mission.title}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      mission.status === "completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {mission.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-emerald-900/80">
                  Progress: {mission.progress}/{mission.target}
                </p>
                <div className="mt-1 h-1.5 rounded-full bg-emerald-100">
                  <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-xs text-emerald-900/75">
                  Suggested terms: {mission.suggestedTerms.join(", ") || "n/a"}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
