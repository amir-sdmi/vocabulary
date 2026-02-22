import { NextRequest, NextResponse } from "next/server";
import { addMessage } from "@/app/lib/messages";

const TELEGRAM_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (TELEGRAM_SECRET) {
    const secret = request.headers.get("x-telegram-bot-api-secret-token");
    if (secret !== TELEGRAM_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const update = body as { message?: { text?: string } };
  const text = update?.message?.text?.trim();
  if (!text) {
    return NextResponse.json({ ok: true });
  }

  addMessage(text);
  return NextResponse.json({ ok: true });
}
