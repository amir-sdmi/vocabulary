import { NextRequest, NextResponse } from "next/server";
import { getRequiredUserId, unauthorizedJson } from "@/app/lib/server/api-auth";
import { buildReviewQueue } from "@/app/lib/review";
import { ReviewMode } from "@/app/features/vocabulary/types";

const ALLOWED_MODES: ReviewMode[] = [
  "daily",
  "trouble",
  "quick",
  "tag",
  "recall",
  "writing",
  "collocation",
  "error_correction",
  "active_usage",
  "weak_area",
  "use_today",
];

export async function GET(request: NextRequest) {
  const userId = await getRequiredUserId();
  if (!userId) return unauthorizedJson();

  const { searchParams } = new URL(request.url);
  const modeRaw = (searchParams.get("mode") ?? "daily").toLowerCase() as ReviewMode;
  const tag = (searchParams.get("tag") ?? "").trim().toLowerCase();
  const mode = ALLOWED_MODES.includes(modeRaw) ? modeRaw : "daily";

  const queue = await buildReviewQueue({
    userId,
    mode,
    tag: mode === "tag" ? tag : undefined,
  });

  return NextResponse.json({
    sessionId: `review-${Date.now()}`,
    mode,
    count: queue.length,
    items: queue,
  });
}
