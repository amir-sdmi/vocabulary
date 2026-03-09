This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create local env file:
   ```bash
   cp .env.example .env.local
   ```
3. Fill credentials in `.env.local`:
   - `BLOB_READ_WRITE_TOKEN`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (for local: `http://localhost:3000`)
4. Run:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Auth + Multi-user

- Login is Google-only (NextAuth).
- Every API call is user-scoped.
- Each user only sees their own vocabulary records.
- User keys are separated in Blob by `web:<email>`.

## Learning Coach Features

- Daily guided review session (10 words)
- Trouble-only review and quick 5-minute review
- Tag-based review shortcut
- Production-first tasks per word:
  - Fill-gap
  - Rewrite
  - Free sentence
- Automatic scoring + correction feedback
- SRS scheduling with due date, interval, ease, lapses, streak
- Mistake notebook (top repeated error categories with tips)
- Progress metrics (retained/forgotten/usable/reviews7d/avg score)

## Telegram Account Linking

1. Sign in on web app.
2. In **Daily Coach**, click **Generate link code**.
3. Send `/link CODE` to your Telegram bot.
4. Telegram vocabulary is migrated into your web account.

## Telegram Ingestion

- Telegram words are stored under a separate user namespace: `telegram:<telegram_user_id>`.
- Web login users and Telegram users are isolated by default.
- Bot replies (`Saved...`, `/link` status) require `TELEGRAM_BOT_TOKEN`.

Set webhook:
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://YOUR_DOMAIN/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

## Export

- CSV: `/api/vocab/export?format=csv`
- JSON: `/api/vocab/export?format=json`
- Anki CSV: `/api/vocab/export?format=anki`
- Weekly summary text report: `/api/vocab/export?format=weekly`

Exports require login and only include the signed-in user’s vocabularies.

## New API Endpoints

- `GET /api/review/session?mode=daily|trouble|quick|tag&tag=work`
- `POST /api/review/answer`
- `GET /api/stats`
- `GET /api/mistakes`
- `POST /api/link/start`

## Legacy notes

The previous single-user blob key was `vocabulary`. Current app storage is per-user and uses `vocabulary-db-v1/<user>.json`.

## Default Next.js Docs

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**Environment variables:** For local development, put your secrets in `.env.local`. Next.js loads it automatically (and does not commit it). Copy from `.env.example` which variables are needed.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Telegram bot

Messages sent to your bot appear on the home page.

1. Create a bot with [@BotFather](https://t.me/BotFather) and get the bot token.
2. Set the webhook (use your deployed URL or ngrok for local):
   ```bash
   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://YOUR_DOMAIN/api/telegram/webhook"
   ```
   Optional secret (set the same value in `TELEGRAM_WEBHOOK_SECRET` env and in the URL):
   ```bash
   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://YOUR_DOMAIN/api/telegram/webhook&secret_token=your-secret"
   ```
3. Send a message to your bot; it should show up under "From Telegram" on the home page (refreshes every 5 seconds).

**Storage:** Vocabularies are stored in [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) under the key `vocabulary`. Create a Blob store in your Vercel project (Storage tab), then set `BLOB_READ_WRITE_TOKEN` in Vercel. For local dev, add the same variable to `.env.local`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
