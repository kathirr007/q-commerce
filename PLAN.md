# Quick-Commerce App — Development Plan

## Tech Stack

| Layer | Choice | Version |
|-------|--------|---------|
| **Runtime** | Node + pnpm | 22.23 / 11.9 |
| **Frontend + Backend** | Nuxt (fullstack with Nitro) | 4.4.8 |
| **UI Framework** | Nuxt UI (Tailwind v4) | 4.9.0 |
| **Language** | TypeScript | 6.0 |
| **Mobile** | PWA via `@vite-pwa/nuxt` → Capacitor later | 1.1.1 |
| **DB (local dev)** | SQLite via `better-sqlite3` (no network needed) | 12.x |
| **DB (production)** | Supabase (Postgres + real-time + auth + storage) | — |
| **Auth SDK** | `@nuxtjs/supabase` (PKCE flow, JWT secret) | 2.0.9 |
| **DB ORM** | Drizzle ORM (dual-driver: sqlite + postgres) | 0.45 |
| **Payments** | Razorpay | — |
| **Maps** | MapLibre GL | 5.24 |
| **SMS** | MSG91 or Amazon SNS | — |
| **Email** | Resend or Brevo | — |
| **Push Notifs** | Firebase Cloud Messaging | — |
| **File Storage** | Supabase Storage or Cloudflare R2 | — |
| **State** | Pinia | 3.0 |
| **Forms** | VeeValidate + Zod | 4.15 / 3.25 |
| **Hosting** | Railway free tier → Hostinger VPS (₹299/mo) | — |
| **CI/CD** | GitHub Actions | — |
| **Monitoring** | Sentry free tier | — |

**Monthly cost: ~₹70/mo (domain) during exploration, ~₹500-700/mo at pilot scale**

---

## Architecture

```
┌────────────────────────────────────────────────┐
│               Nuxt 4 Application                │
├────────────────────────────────────────────────┤
│  Pages (Customer Web)  │  Admin Dashboard      │
│  ───────────────────── │  ────────────────     │
│  Nuxt UI Components    │  Nuxt UI (same lib)   │
├────────────────────────────────────────────────┤
│  Pinia (state) │ Auth Middleware │ PWA Module  │
├────────────────────────────────────────────────┤
│              Nitro Server Engine                │
│  ┌──────┬──────┬──────┬──────┬──────┬──────┐  │
│  │ Auth │Catalog│ Cart │Orders│Payment│Admin│  │
│  └──────┴──────┴──────┴──────┴──────┴──────┘  │
│        server/utils/db.ts  (useDb())            │
│        server/plugins/database.ts               │
├──────────────────┬─────────────────────────────┤
│  SQLite          │  Supabase (Postgres)         │
│  (DB_DRIVER=     │  (DB_DRIVER=postgres)        │
│   sqlite)        │  Auth + Realtime + Storage   │
│  ./data/*.sqlite │  NUXT_SUPABASE_DB_URL        │
└──────────────────┴─────────────────────────────┘
```

The active driver is selected at startup via `DB_DRIVER` env var. Both drivers share the same Drizzle schema shape; the SQLite schema lives in `db/schema.sqlite.ts` and the Postgres schema in `db/schema.ts`.

**Why dual-DB?** Restricted network blocks outbound connections to Supabase (port 5432 / HTTPS to `*.supabase.co`). SQLite runs fully local with zero network dependency, so all feature development and UI work happens against SQLite on the restricted network. Supabase is used from home or when testing auth/realtime-specific features.

| Context | `DB_DRIVER` | Auth | Realtime |
|---------|-------------|------|----------|
| Restricted network (no internet) | `sqlite` | disabled / mock | not available |
| Home / CI | `postgres` | Supabase Auth | Supabase Realtime |

---

## Project Structure

```
qcommerce/
├── app/                        # Main Nuxt app (customer facing)
│   ├── assets/css/main.css     # Global Tailwind / CSS
│   ├── pages/
│   ├── components/
│   ├── server/
│   │   ├── api/                # Nitro API routes
│   │   ├── plugins/
│   │   │   └── database.ts     # Auto-runs SQLite migrations on startup
│   │   └── utils/
│   │       ├── db.ts           # useDb() — returns Drizzle client for active driver
│   │       └── supabase.ts     # Supabase server helper
│   └── types/
│       └── database.types.ts   # Generated Supabase TS types (pnpm db:types)
├── db/
│   ├── schema.ts               # Postgres schema (Drizzle)
│   ├── schema.sqlite.ts        # SQLite schema (Drizzle)
│   ├── drizzle.config.ts       # Dual-driver Drizzle config (DB_DRIVER env)
│   └── migrations/
│       ├── pg/                 # Postgres migration files
│       └── sqlite/             # SQLite migration files
├── scripts/
│   └── dev.ts                  # Interactive dev launcher (port + DB selector)
├── data/                       # SQLite database files (gitignored)
├── nuxt.config.ts
├── package.json
└── .env                        # Local env (gitignored; copy from .env.example)
```

> **Layers planned but not yet created:** `layers/admin`, `layers/delivery`, `layers/shared`. Admin and delivery routes currently use `routeRules` SPA mode (`/admin/**`, `/delivery/**`) within the single app.

---

## Database Schema (Core Entities)

Schema is implemented in both `db/schema.sqlite.ts` (SQLite) and `db/schema.ts` (Postgres). Both are kept in sync manually.

```
users
  id (uuid), name, phone, email (unique),
  role (customer|delivery|store_manager|admin), location (json), created_at

stores
  id (uuid), name, type (dark_store|retail),
  location (json), status (active|inactive), operating_hours (json), created_at

products
  id (uuid), store_id → stores, name, description,
  price, images (json[]), category_id, status (active|inactive), created_at

inventory
  id (uuid), product_id → products, store_id → stores,
  stock_level, reserved_stock

orders
  id (uuid), user_id → users, store_id → stores,
  status (pending|confirmed|preparing|out_for_delivery|delivered|cancelled),
  total, delivery_address, delivery_fee (default 20),
  payment_status (pending|paid|failed|refunded), created_at

order_items
  id (uuid), order_id → orders, product_id → products,
  quantity, unit_price

deliveries
  id (uuid), order_id → orders, delivery_partner_id → users,
  status (assigned|picked_up|in_transit|delivered),
  pickup_time, delivered_time, route (json[])

payments
  id (uuid), order_id → orders,
  method (razorpay|cod), status (pending|paid|failed|refunded),
  transaction_id, amount

delivery_partners
  id (uuid), user_id → users (unique),
  status (online|offline|busy), current_location (json),
  vehicle_type (bike|scooter|car)
```

**Indexes (SQLite):** `products(store_id)`, `orders(user_id)`, `orders(store_id)`, `order_items(order_id)`, `deliveries(order_id)`, `inventory(store_id)`

---

## Implementation Roadmap (20 Weeks)

### Phase 1: Foundation (Weeks 1-3) ✅ COMPLETE
- [x] Nuxt 4.4 project setup with TypeScript 6.0 (Node 22 + pnpm 11)
- [x] Drizzle ORM 0.45 with **dual-driver support** (SQLite for local dev, Postgres for production)
  - `db/schema.sqlite.ts` — SQLite schema
  - `db/schema.ts` — Postgres schema
  - `db/drizzle.config.ts` — switches on `DB_DRIVER` env var
- [x] `app/server/utils/db.ts` — `useDb()` singleton, picks driver at startup
- [x] `app/server/plugins/database.ts` — auto-runs SQLite `CREATE TABLE IF NOT EXISTS` migrations on Nitro startup (no manual migration step needed locally)
- [x] `scripts/dev.ts` — interactive CLI launcher: prompts for port + DB backend, persists choice to `.env`
- [x] Supabase Auth (`@nuxtjs/supabase`) wired up — PKCE flow, redirect rules, public route exclusions
- [x] Nuxt UI 4.9 + Tailwind v4 + icon bundles (lucide, simple-icons)
- [x] PWA manifest configured (`@vite-pwa/nuxt`)
- [x] MapLibre GL + `@maplibre/maplibre-gl-directions` installed
- [x] VeeValidate + Zod installed
- [x] ESLint configured (stylistic rules)
- [x] `.gitignore` updated (`data/` excluded)
- [x] `pnpm db:push:sqlite` working (requires `data/` directory)

### Phase 2: Customer App Core (Weeks 4-7)
> Develop against SQLite locally (`pnpm dev` → restricted network/sqlite). All API routes use `useDb()` — no Supabase-direct calls in server code.
- [ ] Store listing with MapLibre GL 5.24 + OSM tiles (works offline, no Supabase needed)
- [ ] Product catalog + search + filters
- [ ] Cart with Pinia 3.0 (client-side store; no network required)
- [ ] Checkout flow with VeeValidate 4.15 + Zod 3.25
- [ ] Order placement via Nitro API → `useDb()` (works on both SQLite + Postgres)
- [ ] Razorpay payment integration *(home only — requires network + Supabase prod)*
- [ ] Order confirmation page

### Phase 3: Admin Dashboard (Weeks 8-10)
> All CRUD is through Nitro API routes using `useDb()`, so it works on SQLite at the restricted network. Auth role-check middleware is skipped/mocked when `DB_DRIVER=sqlite` (no Supabase session available).
- [ ] Admin section (`/admin/**` — SPA via routeRules, role-gated middleware)
- [ ] Auth guard: enforce `role=admin` when on Postgres; bypass guard in SQLite dev mode
- [ ] Store CRUD
- [ ] Product + inventory management
- [ ] Order management (list, status update)
- [ ] Delivery partner management
- [ ] *(Optional later)* Extract to `layers/admin` Nuxt layer

### Phase 4: Delivery & Real-time (Weeks 11-14)
> Core delivery logic (assignment, status polling) built against SQLite. Supabase Realtime and push notifications are home-only features — wrap behind `if (DB_DRIVER === 'postgres')` guards.
- [ ] Delivery partner portal (`/delivery/**` — SPA via routeRules)
- [ ] Delivery assignment + status updates via Nitro API + `useDb()` (SQLite-compatible)
- [ ] Order tracking page with MapLibre GL (works offline with OSM tiles)
- [ ] Real-time status updates via Supabase Realtime *(Postgres/home only)*
- [ ] Firebase Cloud Messaging push notifications *(Postgres/home only)*
- [ ] SMS via MSG91 *(Postgres/home only)*
- [ ] *(Optional later)* Extract to `layers/delivery` Nuxt layer

### Phase 5: Analytics (Weeks 15-17)
> All queries via `useDb()` — aggregate queries work on both SQLite and Postgres. Real-time dashboard widgets are Postgres-only.
- [ ] Admin analytics dashboard — static aggregates via `useDb()` (SQLite-compatible)
- [ ] Real-time stats widgets via Supabase Realtime *(Postgres/home only)*
- [ ] Export reports (CSV via Nuxt server API — works on both drivers)
- [ ] Delivery partner earnings tracking
- [ ] Basic product popularity insights

### Phase 6: PWA Polish & App Publishing (Weeks 18-20)
- [ ] `@vite-pwa/nuxt` offline support + install prompt
- [ ] Performance optimization (lazy loading, image optimization via `@nuxt/image`)
- [ ] Security hardening (rate limiting, input validation, RLS policies in Supabase)
- [ ] Production deploy: switch `DB_DRIVER=postgres` + set `NUXT_SUPABASE_DB_URL`
- [ ] Wrap with Capacitor if app store submission is needed

---

## Key Nuxt 4 Patterns

### Server routes (API endpoints):
All API routes use `useDb()` so they work on both SQLite (restricted network) and Postgres (home/prod) without changes.

```typescript
// server/api/products/[id].get.ts
export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { db, schema } = useDb()
  const product = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, id))
    .get()
  return product
})
```

For Postgres-only features (auth user lookup, realtime subscriptions), check the driver first:

```typescript
const { driver } = useDb()
if (driver === 'postgres') {
  // Supabase Realtime or Auth-specific logic
}
```

### Auto-imported composables:
```typescript
// composables/useOrder.ts
export const useOrder = () => {
  const orders = ref([])
  async function placeOrder(cartItems) { ... }
  return { orders, placeOrder }
}
```

### Auth middleware:
```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && to.path !== '/login') return navigateTo('/login')
})
```

### RLS policy example (Supabase):
```sql
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');
```

---

## Nuxt Packages

| Purpose | Package | Version |
|---------|---------|---------|
| State management | Pinia | 3.0 |
| Auth | `@nuxtjs/supabase` | 2.0 |
| Database ORM | Drizzle ORM | 0.45 |
| UI components | Nuxt UI | 4.9 |
| Forms + validation | VeeValidate + Zod | 4.15 / 3.25 |
| PWA | `@vite-pwa/nuxt` | 1.1 |
| Maps | `maplibre-gl` | 5.24 |
| Sitemap/SEO | `@nuxtjs/sitemap` | 8.2 |
| Image optimization | `@nuxt/image` | 2.0 |
| Utilities | `@vueuse/core` + `@vueuse/nuxt` | 14.3 |

---

## Future Migration Path

| Stage | When | Action |
|-------|------|--------|
| Explorer | Solo dev, single city pilot | Nuxt fullstack + Supabase + Railway/VPS |
| Growing | 2-3 team members, multi-city | Extract backend to NestJS (Nuxt frontend), split monorepo with Turborepo |
| Scaling | 5+ devs, 100K orders/mo | Microservices (NestJS), dedicated Redis, Kafka for orders, team squads |
| Enterprise | National rollout | Kubernetes, dedicated DevOps, multi-region DB |
