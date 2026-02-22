import { Bot, webhookCallback } from "grammy";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { saveVocabularyEntry } from "../lib/firestore.js";
import { parseVocabularyMessage } from "../lib/parseVocabulary.js";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot(token);

bot.on("message:text", async (ctx) => {
  const row = parseVocabularyMessage(ctx.message.text);
  if (row.length === 0) {
    await ctx.reply("Send a word or phrase to save (e.g. word | definition).");
    return;
  }
  await saveVocabularyEntry(row);
  await ctx.reply("Saved.");
});

const handleUpdate = webhookCallback(bot, "https");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.BOT_WEBHOOK_SECRET;
  if (secret) {
    const querySecret = typeof req.query?.secret === "string" ? req.query.secret : null;
    if (querySecret !== secret) {
      res.status(401).end("Unauthorized");
      return;
    }
  }

  if (req.method !== "POST") {
    res.status(405).end("Method Not Allowed");
    return;
  }

  try {
    await handleUpdate(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).end("Internal Server Error");
  }
}
