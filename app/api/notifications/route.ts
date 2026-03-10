import { NextResponse } from "next/server";
import { withAuthorizedUser } from "@/app/lib/server/api-auth";
import { getNotificationHint } from "@/app/lib/notifications";

export async function GET() {
  return withAuthorizedUser(async (userId) => {
    const hint = await getNotificationHint(userId);
    return NextResponse.json(hint);
  });
}
