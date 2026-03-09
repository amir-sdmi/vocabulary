import { NextResponse } from "next/server";
import { getRequiredUserId, unauthorizedJson } from "@/app/lib/server/api-auth";
import { getLearningInsights } from "@/app/lib/review";

export async function GET() {
  const userId = await getRequiredUserId();
  if (!userId) return unauthorizedJson();
  const insights = await getLearningInsights(userId);
  return NextResponse.json(insights);
}

