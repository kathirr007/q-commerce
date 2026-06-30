# Quick-Commerce App — Development Plan

## Tech Stack

| Layer | Choice | Version |
|-------|--------|---------|
| **Runtime** | Node + pnpm | 22.23 / 11.9 |
| **Frontend + Backend** | Nuxt (fullstack with Nitro) | 4.4.8 |
| **UI Framework** | Nuxt UI (Tailwind v4) | 4.9.0 |
| **Language** | TypeScript | 6.0 |
| **Mobile** | PWA via `@vite-pwa/nuxt` → Capacitor later | 1.1.1 |
| **Database** | Supabase (Postgres + real-time + auth + storage) | — |
| **Auth SDK** | `@nuxtjs/supabase` (PKCE flow, JWT secret) | 2.0.9 |
| **DB ORM** | Drizzle ORM | 0.45 |
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
├────────────────────────────────────────────────┤
│             Supabase (DB + Auth + Realtime)     │
└────────────────────────────────────────────────┘
```

---

## Project Structure

```
qcommerce/
├── app/                  # Main Nuxt app (customer facing)
│   ├── pages/
│   ├── components/
│   ├── server/           # API routes + middleware
│   │   ├── api/
│   │   └── utils/
│   └── nuxt.config.ts
├── layers/               # Nuxt layers
│   ├── admin/            # Admin dashboard layer
│   │   ├── pages/admin/
│   │   └── nuxt.config.ts
│   ├── delivery/         # Delivery partner layer
│   │   ├── pages/delivery/
│   │   └── nuxt.config.ts
│   └── shared/           # Shared composables + types + UI
│       ├── composables/
│       ├── types/
│       └── components/
├── db/                   # Database schema + migrations (Drizzle)
├── packages/             # Shared utility packages (optional)
└── docker/               # Docker config for VPS deployment
```

---

## Database Schema (Core Entities)

```
users
  id, role (customer|delivery|store_manager|admin), name, phone, email, location

stores
  id, name, type (dark_store|retail), location (PostGIS point), status, operating_hours

products
  id, store_id, name, description, price, images[], category_id, status

inventory
  id, product_id, store_id, stock_level, reserved_stock

orders
  id, user_id, store_id, status, total, delivery_address,
  delivery_fee, payment_status, created_at

order_items
  id, order_id, product_id, quantity, unit_price

deliveries
  id, order_id, delivery_partner_id, status,
  pickup_time, delivered_time, route[]

payments
  id, order_id, method, status, transaction_id, amount

delivery_partners
  id, user_id, status (online|offline|busy), current_location, vehicle_type
```

---

## Implementation Roadmap (20 Weeks)

### Phase 1: Foundation (Weeks 1-3)
- Nuxt 4.4 project setup with TypeScript 6.0 (Node 22 + pnpm 11)
- Supabase project + DB schema setup with Drizzle ORM 0.45
- Supabase Auth 2.0 (email + phone OTP, PKCE flow, JWT secret)
- Nuxt UI 4.9 component setup (layout, nav, buttons, forms)
- Deploy to Railway/Oracle Cloud free tier

### Phase 2: Customer App Core (Weeks 4-7)
- Store listing with MapLibre GL 5.24 + OSM map
- Product catalog + search + filters
- Cart with Pinia 3.0 (persisted to Supabase)
- Checkout flow with VeeValidate 4.15 + Zod 3.25
- Razorpay payment integration
- Order confirmation page

### Phase 3: Admin Dashboard (Weeks 8-10)
- Admin Nuxt layer (separate layout + middleware + auth role check)
- Store CRUD
- Product + inventory management
- Order management (list, status update)
- Delivery partner management

### Phase 4: Delivery & Real-time (Weeks 11-14)
- Delivery partner portal (PWA via `@vite-pwa/nuxt` 1.1)
- Real-time status updates via Supabase Realtime
- Basic delivery assignment (nearest driver)
- Order tracking page (customer-facing map)
- Firebase Cloud Messaging for push notifications
- SMS via MSG91

### Phase 5: Analytics (Weeks 15-17)
- Admin analytics dashboard with real-time stats
- Export reports (CSV via Nuxt server API)
- Delivery partner earnings tracking
- Basic product popularity insights

### Phase 6: PWA Polish & App Publishing (Weeks 18-20)
- `@vite-pwa/nuxt` configuration (offline support, install prompt)
- Performance optimization (lazy loading, image optimization)
- Security hardening (rate limiting, input validation, RLS policies in Supabase)
- Wrap with Capacitor if app store submission is needed

---

## Key Nuxt 4 Patterns

### Server routes (API endpoints):
```typescript
// server/api/products/[id].get.ts
export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { data } = await supabase
    .from('products')
    .select('*, stores(*)')
    .eq('id', id)
    .single()
  return data
})
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
