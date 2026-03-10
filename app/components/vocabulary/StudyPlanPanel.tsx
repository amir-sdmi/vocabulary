"use client";

import { useEffect, useState } from "react";
import { ReviewMode, StudyPlan } from "@/app/features/vocabulary/types";
import { fetchJsonOrNull } from "@/app/lib/client/http";

const MODE_LABEL: Record<ReviewMode, string> = {
  daily: "Daily 10",
  trouble: "Trouble only",
  quick: "Quick review",
  tag: "Tag review",
  recall: "Recall",
  writing: "Writing",
  collocation: "Collocation",
  error_correction: "Error correction",
  active_usage: "Active usage",
  weak_area: "Weak area",
  use_today: "Use today",
};

export function StudyPlanPanel() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetchJsonOrNull<StudyPlan>("/api/study-plan").then((data) => {
      if (!active) return;
      setPlan(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  function startTask(mode: ReviewMode) {
    window.location.assign(`/?startMode=${mode}#coach`);
  }

  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-6">
      <h3 className="text-base font-semibold text-emerald-950">7-Day Auto Study Plan</h3>
      <p className="mt-1 text-xs text-emerald-900/75">
        Personalized daily sessions from weak patterns, due cards, and memory graph context.
      </p>
      {loading || !plan ? (
        <p className="mt-3 text-sm text-emerald-900/70">Generating plan...</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {plan.tasks.map((task) => (
            <li key={`${task.day}-${task.mode}`} className="rounded-lg border border-emerald-900/10 bg-emerald-50/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-emerald-950">
                  {task.day} • {MODE_LABEL[task.mode]}
                </p>
                {task.day === plan.today ? (
                  <button
                    type="button"
                    onClick={() => startTask(task.mode)}
                    className="rounded-md bg-emerald-900 px-2 py-1 text-xs font-medium text-white"
                  >
                    Start today
                  </button>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-emerald-900/80">{task.reason}</p>
              <p className="mt-1 text-xs text-emerald-900/75">
                Focus: {task.focusTerms.join(", ") || "Balanced review set"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
