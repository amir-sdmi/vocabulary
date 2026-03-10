import { NextRequest, NextResponse } from "next/server";
import { withAuthorizedUser } from "@/app/lib/server/api-auth";
import { buildReviewQueue } from "@/app/lib/review";
import { ReviewMode } from "@/app/features/vocabulary/types";
import { isReviewMode } from "@/app/features/vocabulary/review-modes";

export async function GET(request: NextRequest) {
  return withAuthorizedUser(async (userId) => {
    const { searchParams } = new URL(request.url);
    const modeRaw = (searchParams.get("mode") ?? "daily").toLowerCase() as ReviewMode;
    const tag = (searchParams.get("tag") ?? "").trim().toLowerCase();
    const mode = isReviewMode(modeRaw) ? modeRaw : "daily";

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
  });
}
