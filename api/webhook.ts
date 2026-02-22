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
  const secret = process.env.BOT_WEBHOOK_SECRET;
  if (secret && req.query?.secret !== secret) {
    return res.status(401).end("Unauthorized");
  }

  if (req.method === "GET") {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://YOUR_VERCEL_DOMAIN";
    const webhookPath = secret ? "/api/webhook?secret=YOUR_SECRET" : "/api/webhook";
    const webhookUrl = base + webhookPath;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).end(
      "Bot webhook endpoint.\n\n" +
        "1. Connect Telegram to this app. Open in browser (replace BOT_TOKEN):\n" +
        "   https://api.telegram.org/botBOT_TOKEN/setWebhook?url=" +
        encodeURIComponent(webhookUrl) +
        "\n   " +
        (secret ? "Replace YOUR_SECRET with your BOT_WEBHOOK_SECRET value.\n   " : "") +
        "\n2. Check: https://api.telegram.org/botBOT_TOKEN/getWebhookInfo\n   Should show your url.\n\n" +
        "3. Send a message to your bot."
    );
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
