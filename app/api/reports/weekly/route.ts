import { NextResponse } from "next/server";
import { withAuthorizedUser } from "@/app/lib/server/api-auth";
import { generateWeeklyReport } from "@/app/lib/reports";

export async function GET() {
  return withAuthorizedUser(async (userId) => {
    const report = await generateWeeklyReport(userId);
    return NextResponse.json(report);
  });
}
