# vocabulary

Telegram bot backend (Vercel serverless). Saves vocabulary messages to Firebase Firestore.

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