import { NextResponse } from "next/server";
import { getRequiredUserId, unauthorizedJson } from "@/app/lib/server/api-auth";
import { getGoalSnapshot } from "@/app/lib/goals";

export async function GET() {
  const userId = await getRequiredUserId();
  if (!userId) return unauthorizedJson();
  const snapshot = await getGoalSnapshot(userId);
  return NextResponse.json(snapshot);
}
