# Fidelity Wallet

Digital loyalty cards for restaurants (Apple Wallet and Google Wallet), with a web dashboard
where each restaurant manages its program. Product scope and rules: [PROJECT_VISION.md](PROJECT_VISION.md).

Prototype: there is no authentication yet, and Wallet integrations are not built.

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · Postgres with Drizzle ORM.

## Getting started

Requirements: Node.js 20.12+ and a Postgres database (a free [Neon](https://neon.tech) project works).

```bash
npm install
cp .env.example .env.local   # then put your DATABASE_URL in .env.local
npm run db:migrate           # create the tables
npm run db:seed              # load the demo restaurants
npm run dev                  # http://localhost:3000
```

## Database

| Command | What it does |
|---|---|
| `npm run db:migrate` | Applies the SQL migrations in `drizzle/` to the database in `DATABASE_URL`. Safe to re-run. |
| `npm run db:seed` | **Deletes all data** and reloads the demo restaurants. Never run it on real data. |
| `npm run db:generate` | After editing `src/db/schema.ts`, writes a new migration in `drizzle/`. Commit it. |

`DATABASE_URL` lives in `.env.local`, which is never committed. On a host such as Vercel,
set it as an environment variable. The build itself does not need the database.

The app connects through Neon's serverless driver (WebSocket on port 443), so it works on
networks that block the standard Postgres port 5432. To browse the data, use the **Tables**
view in the Neon console.

## Project structure

```
src/app/r/[restaurantId]/   Restaurant dashboard (one folder per section)
src/app/admin/              Fidelity Wallet admin (restaurant list)
src/services/               Data access: every page goes through here, scoped by restaurantId
src/db/                     Schema, client, demo seed data
src/data/mock/              Demo-only figures with no real source yet (dashboard, analytics)
src/components/             UI, layout, charts and per-section components
```

Rules that keep restaurants isolated: pages never query the database directly, and every
service call takes the active restaurant's ID and filters on it.
