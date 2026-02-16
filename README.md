# vocabulary

Backend-only Vercel serverless project.

## Scripts

- `npm run dev` — TypeScript check for local development
- `npm run vercel:dev` — run local Vercel serverless dev
- `npm run build` — TypeScript type-check
- `npm run vercel:build` — Vercel production build locally
- `npm run deploy` — deploy to Vercel production

## API Routes

- `GET /api/hello?name=Amir`
- `GET /api/health`

## First-time Vercel Setup

1. `npx vercel login`
2. `npx vercel pull --yes`
3. `npm run vercel:dev`