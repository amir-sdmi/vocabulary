import { ReviewMode } from "@/app/features/vocabulary/types";

export const REVIEW_MODE_OPTIONS: Array<{ mode: ReviewMode; label: string }> = [
  { mode: "daily", label: "Daily 10" },
  { mode: "trouble", label: "Trouble only" },
  { mode: "quick", label: "Quick 5 min" },
  { mode: "tag", label: "Review tag" },
  { mode: "recall", label: "Recall" },
  { mode: "writing", label: "Writing" },
  { mode: "collocation", label: "Collocation" },
  { mode: "error_correction", label: "Error fix" },
  { mode: "active_usage", label: "Active usage" },
  { mode: "weak_area", label: "Weak area" },
  { mode: "use_today", label: "Use today" },
];

export function isReviewMode(value: string): value is ReviewMode {
  return REVIEW_MODE_OPTIONS.some((item) => item.mode === value);
}
