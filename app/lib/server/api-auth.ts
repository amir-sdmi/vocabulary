import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserIdFromSession } from "@/app/lib/auth-user";

export async function getRequiredUserId(): Promise<string | null> {
  const session = await auth();
  return getUserIdFromSession(session);
}

export function unauthorizedJson() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function withAuthorizedUser(
  handler: (userId: string) => Promise<NextResponse>,
): Promise<NextResponse> {
  const userId = await getRequiredUserId();
  if (!userId) return unauthorizedJson();
  return handler(userId);
}
