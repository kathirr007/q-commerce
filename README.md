# Quick Commerce

A quick-commerce (rapid grocery/delivery) app built with Nuxt 4, Supabase, and Drizzle ORM. Supports two database backends: **SQLite** for local/offline development and **Supabase (Postgres)** for production.

## Tech Stack

- **Framework** — Nuxt 4 with Nuxt UI, Pinia, VeeValidate + Zod
- **Database** — Drizzle ORM over SQLite (local) or Supabase Postgres (remote)
- **Auth** — Supabase Auth (PKCE flow)
- **Maps** — MapLibre GL + `@maplibre/maplibre-gl-directions`
- **PWA** — `@vite-pwa/nuxt` (standalone, auto-update)
- **Tooling** — pnpm workspaces, ESLint, TypeScript, tsx

## Getting Started

```bash
pnpm install
cp .env.example .env   # fill in Supabase keys if using remote DB
pnpm dev               # interactive prompt picks port + database
```

`pnpm dev` launches an interactive CLI (`scripts/dev.ts`) that asks for:

- **Port** — dev server port (default 3000)
- **Database** — SQLite (local, no network needed) or Supabase Postgres (remote)

Selections are persisted to `.env` so subsequent runs reuse your last choice.

## Database

The app supports two drivers, controlled by `DB_DRIVER` in `.env`.

| Driver | When to use | Data location |
|--------|-------------|---------------|
| `sqlite` | Local / offline development | `./data/qcommerce.sqlite` |
| `postgres` | Supabase / production | `NUXT_SUPABASE_DB_URL` |

### Schema

Tables: `users`, `stores`, `products`, `inventory`, `orders`, `order_items`, `deliveries`, `delivery_partners`, `payments`

Roles: `customer`, `delivery`, `store_manager`, `admin`  
Store types: `dark_store`, `retail`  
Payment methods: `razorpay`, `cod`

### SQLite

Push schema to the local SQLite file:

```bash
pnpm db:push:sqlite
```

The `data/` directory and tables are also created automatically on startup by the Nitro server plugin (`app/server/plugins/database.ts`) when `DB_DRIVER=sqlite`.

### Postgres (Supabase)

```bash
pnpm db:push:pg
```

Requires `NUXT_SUPABASE_DB_URL` set in `.env`.

### Other DB commands

```bash
pnpm db:generate   # generate migration files
pnpm db:migrate    # apply migrations
pnpm db:studio     # open Drizzle Studio
pnpm db:types      # regenerate Supabase TS types → app/types/database.types.ts
```

## Environment Variables

```env
# Database
DB_DRIVER=sqlite                          # sqlite | postgres
SQLITE_DB_PATH=./data/qcommerce.sqlite    # optional override
NUXT_SUPABASE_DB_URL=postgresql://...     # required for postgres driver

# Supabase (auth + realtime)
NUXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=your-anon-key

# Dev
PORT=3000
DEV_LOCATION=office                       # office (sqlite) | home (supabase)
```

## Route Rules

| Path | Rendering |
|------|-----------|
| `/` | Prerendered (static) |
| `/admin/**` | Client-side only (SPA) |
| `/delivery/**` | Client-side only (SPA) |
| All others | SSR |

Auth redirects unauthenticated users to `/login`; public routes (`/`, `/stores/*`, `/products/*`) are excluded.

## Scripts

```bash
pnpm dev          # interactive dev server launcher (prompts for port + DB)
pnpm dev:direct   # nuxt dev without the interactive prompts
pnpm build        # production build
pnpm preview      # preview production build
pnpm lint         # ESLint
pnpm typecheck    # vue-tsc + nuxt typecheck
```
