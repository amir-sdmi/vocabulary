import { NextResponse } from "next/server";
import { withAuthorizedUser } from "@/app/lib/server/api-auth";
import { getTopicMissions } from "@/app/lib/missions";

export async function GET() {
  return withAuthorizedUser(async (userId) => {
    const missions = await getTopicMissions(userId);
    return NextResponse.json({ missions });
  });
}
