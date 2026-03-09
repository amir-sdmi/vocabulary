import { NextRequest, NextResponse } from "next/server";
import { getRequiredUserId, unauthorizedJson } from "@/app/lib/server/api-auth";
import { buildReviewQueue } from "@/app/lib/review";

export async function GET(request: NextRequest) {
  const userId = await getRequiredUserId();
  if (!userId) return unauthorizedJson();

  const { searchParams } = new URL(request.url);
  const modeRaw = (searchParams.get("mode") ?? "daily").toLowerCase();
  const tag = (searchParams.get("tag") ?? "").trim().toLowerCase();
  const mode =
    modeRaw === "trouble" || modeRaw === "quick" || modeRaw === "tag" ? modeRaw : "daily";

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

