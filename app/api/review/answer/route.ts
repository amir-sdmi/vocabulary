import { NextRequest, NextResponse } from "next/server";
import { getRequiredUserId, unauthorizedJson } from "@/app/lib/server/api-auth";
import { evaluateReviewAnswer } from "@/app/lib/review";

export async function POST(request: NextRequest) {
  const userId = await getRequiredUserId();
  if (!userId) return unauthorizedJson();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as {
    vocabId?: string;
    mode?: "daily" | "trouble" | "quick" | "tag";
    taskType?: "fill_gap" | "rewrite" | "free_sentence";
    prompt?: string;
    answer?: string;
  };

  if (!payload.vocabId || !payload.answer || !payload.taskType || !payload.prompt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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
    return NextResponse.json({ error: "Failed to evaluate answer" }, { status: 400 });
  }
}

