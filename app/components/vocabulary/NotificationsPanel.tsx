"use client";

import { useEffect, useState } from "react";
import { NotificationHint } from "@/app/features/vocabulary/types";
import { fetchJsonOrNull } from "@/app/lib/client/http";

export function NotificationsPanel() {
  const [hint, setHint] = useState<NotificationHint | null>(null);

  useEffect(() => {
    let active = true;
    void fetchJsonOrNull<NotificationHint>("/api/notifications").then((data) => {
      if (!active) return;
      setHint(data);
    });
    return () => {
      active = false;
    };
  }, []);

  async function enableBrowserReminder() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted" && hint) {
      const nextHour = hint.bestWindows[0]?.hour ?? 20;
      new Notification("LexiCoach reminder enabled", {
        body: `Best time today: ${String(nextHour).padStart(2, "0")}:00`,
      });
    }
  }

  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-emerald-950">Smart Notifications</h3>
          <p className="text-xs text-emerald-900/75">
            Suggests your best study windows and streak rescue prompts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void enableBrowserReminder()}
          className="rounded-lg border border-emerald-900/20 bg-white px-2.5 py-1 text-xs font-medium text-emerald-900"
        >
          Enable browser reminder
        </button>
      </div>
      {!hint ? (
        <p className="mt-3 text-sm text-emerald-900/70">Analyzing your best windows...</p>
      ) : (
        <div className="mt-3 space-y-2 text-sm text-emerald-900/85">
          <p>{hint.suggestedNext}</p>
          <p>
            Best windows:{" "}
            {hint.bestWindows
              .map((w) => `${String(w.hour).padStart(2, "0")}:00`)
              .join(", ") || "n/a"}
          </p>
          {hint.streakRescue ? <p className="text-amber-700">{hint.streakRescue}</p> : <p>Goal already met today.</p>}
        </div>
      )}
    </section>
  );
}
