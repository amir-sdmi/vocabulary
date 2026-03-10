import { NextResponse } from "next/server";
import { withAuthorizedUser } from "@/app/lib/server/api-auth";
import { getGoalSnapshot } from "@/app/lib/goals";

export async function GET() {
  return withAuthorizedUser(async (userId) => {
    const snapshot = await getGoalSnapshot(userId);
    return NextResponse.json(snapshot);
  });
}
