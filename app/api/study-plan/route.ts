import { NextResponse } from "next/server";
import { withAuthorizedUser } from "@/app/lib/server/api-auth";
import { generateStudyPlan } from "@/app/lib/study-plan";

export async function GET() {
  return withAuthorizedUser(async (userId) => {
    const plan = await generateStudyPlan(userId);
    return NextResponse.json(plan);
  });
}
