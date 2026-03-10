import { NextRequest, NextResponse } from "next/server";
import { createVocabularyFromTelegramText } from "@/app/lib/vocabulary";
import { getTelegramUserId } from "@/app/lib/auth-user";
import { consumeLinkCode, resolveTelegramOwnerUserId } from "@/app/lib/account-link";
import { parseAddCommand, parseNaturalAddText } from "@/app/features/vocabulary/helpers";

const TELEGRAM_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramReply(chatId: number | string, text: string) {
  if (!TELEGRAM_BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  }).catch(() => undefined);
}

async function handleMediaIngestionStub(update: {
  message?: { voice?: unknown; photo?: unknown[] };
}) {
  if (update?.message?.voice || (update?.message?.photo && update.message.photo.length > 0)) {
    // Placeholder hook for future STT/OCR adapters.
    return { accepted: true };
  }
  return { accepted: false };
}

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

  const update = body as {
    message?: {
      text?: string;
      voice?: unknown;
      photo?: unknown[];
      from?: { id?: number | string };
      chat?: { id?: number | string };
    };
  };
  const media = await handleMediaIngestionStub(update);
  if (media.accepted) {
    const chatId = update.message?.chat?.id;
    if (chatId) {
      await sendTelegramReply(
        chatId,
        "Media received. Voice/image ingestion is prepared and will be processed in a future update.",
      );
    }
    return NextResponse.json({ ok: true, queued: true });
  }

  const text = update?.message?.text?.trim();
  if (!text) {
    return NextResponse.json({ ok: true });
  }

  const telegramUserId = getTelegramUserId(update);
  if (!telegramUserId) {
    return NextResponse.json({ ok: true });
  }

  const linkMatch = text.match(/^\/link\s+([A-Za-z0-9_-]+)$/i);
  if (linkMatch) {
    const result = await consumeLinkCode(telegramUserId, linkMatch[1]);
    const chatId = update.message?.chat?.id;
    if (chatId) {
      await sendTelegramReply(chatId, result.message);
    }
    return NextResponse.json({ ok: result.ok, message: result.message });
  }

  const ownerId = await resolveTelegramOwnerUserId(telegramUserId);
  const parsed = parseAddCommand(text) ?? parseNaturalAddText(text);
  const created = await createVocabularyFromTelegramText(ownerId, text);
  const chatId = update.message?.chat?.id;
  if (chatId && created) {
    const normalized = [
      `Saved: ${created.term}`,
      `Meaning: ${created.definitionEasyEn || parsed.meaning || "n/a"}`,
      `Tags: ${(created.tags.length > 0 ? created.tags : parsed.tags ?? []).join(", ") || "n/a"}`,
      `Example: ${created.userExample || parsed.sentence || "n/a"}`,
    ].join("\n");
    await sendTelegramReply(chatId, normalized);
  }
  return NextResponse.json({ ok: true });
}
