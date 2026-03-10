import { NextResponse } from "next/server";
import { getRequiredUserId, unauthorizedJson } from "@/app/lib/server/api-auth";
import { generateWeeklyReport } from "@/app/lib/reports";

export async function GET() {
  const userId = await getRequiredUserId();
  if (!userId) return unauthorizedJson();
  const report = await generateWeeklyReport(userId);
  return NextResponse.json(report);
}
