import { NextRequest, NextResponse } from "next/server";
import { withAuthorizedUser } from "@/app/lib/server/api-auth";
import { badRequest, parseJsonBody } from "@/app/lib/server/http";
import { evaluateReviewAnswer } from "@/app/lib/review";
import { ReviewMode, ReviewTaskType } from "@/app/features/vocabulary/types";

export async function POST(request: NextRequest) {
  return withAuthorizedUser(async (userId) => {
    const parsed = await parseJsonBody<{
      vocabId?: string;
      mode?: ReviewMode;
      taskType?: ReviewTaskType;
      prompt?: string;
      answer?: string;
    }>(request);
    if (!parsed.ok) return parsed.response;
    const payload = parsed.data;

    if (!payload.vocabId || !payload.answer || !payload.taskType || !payload.prompt) {
      return badRequest("Missing fields");
    }

    try {
      const result = await evaluateReviewAnswer({
        userId,
        vocabId: payload.vocabId,
        mode: payload.mode ?? "daily",
        taskType: payload.taskType,
        prompt: payload.prompt,
        answer: payload.answer,
      });
      return NextResponse.json(result);
    } catch {
      return badRequest("Failed to evaluate answer");
    }
  });
}
