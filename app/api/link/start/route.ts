import { NextResponse } from "next/server";
import { getRequiredUserId, unauthorizedJson } from "@/app/lib/server/api-auth";
import { createLinkCode } from "@/app/lib/account-link";

export async function POST() {
  const userId = await getRequiredUserId();
  if (!userId) return unauthorizedJson();

  const link = await createLinkCode(userId);
  return NextResponse.json({
    code: link.code,
    expiresAt: link.expiresAt,
    instruction:
      "Open Telegram and send: /link " + link.code + " to your bot within 20 minutes.",
  });
}

