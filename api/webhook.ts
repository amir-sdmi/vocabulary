import { Bot, webhookCallback } from "grammy";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot(token);

bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;
  console.log("Received message:", text);
  await ctx.reply("Got it.");
});

const handleUpdate = webhookCallback(bot, "https");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (process.env.BOT_WEBHOOK_SECRET && req.query?.secret !== process.env.BOT_WEBHOOK_SECRET) {
    return res.status(401).end("Unauthorized");
  }
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }
  try {
    await handleUpdate(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).end("Internal Server Error");
  }
}
