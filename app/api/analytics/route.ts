import { NextResponse } from "next/server";
import { withAuthorizedUser } from "@/app/lib/server/api-auth";
import { getAnalyticsSnapshot } from "@/app/lib/learning-analytics";

export async function GET() {
  return withAuthorizedUser(async (userId) => {
    const analytics = await getAnalyticsSnapshot(userId);
    return NextResponse.json(analytics);
  });
}
