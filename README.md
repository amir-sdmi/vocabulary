# vocabulary

Telegram bot backend (Vercel serverless). Sends a word or phrase to the bot → it’s saved to Firebase Firestore.

## How it works

1. **You** send a text message to the bot in Telegram (e.g. `hello` or `hello | a greeting`).
2. **Telegram** sends a `POST` to your deployed URL: `https://<your-domain>/api/webhook` with the message (webhook must be set once).
3. **Webhook** ([api/webhook.ts](api/webhook.ts)) receives the request, checks optional secret, then hands the body to grammY.
4. **grammY** runs the handler for `message:text`: the text is parsed by [lib/parseVocabulary.ts](lib/parseVocabulary.ts) (split by `|` or `,`, or one piece), then [lib/firestore.ts](lib/firestore.ts) writes one document to the Firestore collection **vocabulary** (collection is created on first write; no setup in Firebase).
5. **Bot** replies “Saved.” in Telegram.

```
User → Telegram → POST /api/webhook → parse text → Firestore (vocabulary) → reply "Saved."
```

## Scripts

- `npm run dev` — TypeScript check for local development
- `npm run vercel:dev` — run local Vercel serverless dev
- `npm run build` — TypeScript type-check
- `npm run vercel:build` — Vercel production build locally
- `npm run deploy` — deploy to Vercel production

## API

- `POST /api/webhook` — Telegram webhook; receives updates and saves vocabulary to Firestore.

## Env (Vercel)

- `BOT_TOKEN` — Telegram bot token (BotFather).
- `FIREBASE_SERVICE_ACCOUNT_JSON` — Firebase service account key (full JSON string).
- `BOT_WEBHOOK_SECRET` — Optional; if set, webhook URL must include `?secret=<value>`.

## Firebase

1. Create a project in [Firebase Console](https://console.firebase.google.com), enable **Firestore**.
2. Project Settings → Service accounts → Generate new private key → paste JSON into `FIREBASE_SERVICE_ACCOUNT_JSON`.

## First-time Vercel Setup

1. `npx vercel login`
2. `npx vercel pull --yes`
3. Set env vars in Vercel dashboard (or `.env` for `npm run vercel:dev`).
4. Deploy, then set Telegram webhook: `https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<your-domain>/api/webhook`
5. `npm run vercel:dev` for local testing.