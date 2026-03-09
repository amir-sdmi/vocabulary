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
