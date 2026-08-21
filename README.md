# Bamboo Store

A full-stack bamboo decor e-commerce platform: product catalog, cart, checkout,
Razorpay payments, order tracking, and an admin console — split into three
independently deployable applications sharing one PostgreSQL database.

## Overview

- **Customers** browse categories and products, add to cart, check out, pay
  via Razorpay, and view their orders.
- **Admins** manage products (including images via Cloudinary), categories,
  view all orders, and update order status.
- The backend is the single source of truth for prices, stock, and payment
  verification — neither frontend ever supplies a price, and Razorpay
  payments are verified server-side before an order is marked `PAID`.

## Architecture

```
www.example.com  →  customer-frontend  →  api.example.com  →  Backend  →  PostgreSQL
admin.example.com →  admin-frontend    →  api.example.com  →  Backend  →  PostgreSQL
```

Both frontends are separate Vite/React apps that talk to the same backend
over its REST API — the backend has no knowledge of which frontend called
it, only which user (via JWT) and which role (`CUSTOMER` / `ADMIN`).

```
bamboo-store/
├── customer-frontend/   React + Vite (JavaScript) — www.example.com
├── admin-frontend/      React + Vite (JavaScript) — admin.example.com
├── backend/              Node.js + Express (JavaScript) — api.example.com
├── database/             PostgreSQL schema, seed data, migrations
├── render.yaml            Render Blueprint for the backend
├── .gitignore
└── README.md
```

`admin-frontend` is a fully separate React application (its own Vite project,
own dependencies, own deploy target) — it is not a set of routes inside the
customer site.

### Backend folder structure

```
backend/src/
├── app.js, server.js
├── config/          db.js, cors.js, cloudinary.js, razorpay.js
├── controllers/      auth, product, category, order, payment (+ admin/*)
├── middleware/        authMiddleware (JWT), adminMiddleware (RBAC), errorHandler
├── models/            userModel, productModel, categoryModel, orderModel,
│                       orderItemModel, paymentModel, dashboardModel
├── routes/             auth, products, categories, orders, payments (+ admin/*)
├── services/           authService, orderService, paymentService
└── utils/              ApiError, asyncHandler, jwt, price, slugify, orderNumber, validators
```

## Stack

- **Customer frontend:** React, Vite, JavaScript, React Router, Axios
- **Admin frontend:** React, Vite, JavaScript, React Router, Axios
- **Backend:** Node.js, Express, JWT, bcrypt
- **Database:** PostgreSQL
- **Payments:** Razorpay (Checkout.js + server-side order creation/signature verification)
- **Images:** Cloudinary

## Security model

- Passwords are hashed with **bcrypt** (10 salt rounds) — never stored or logged in plaintext.
- Auth is **JWT** (`{ id, role }` payload, HS256, signed with `JWT_SECRET`), sent as `Authorization: Bearer <token>`.
- Every `/api/admin/*` route requires both a valid JWT **and** `role === 'ADMIN'` (`authMiddleware` + `adminMiddleware`), enforced centrally in `routes/admin/index.js` — not per-route, so there are no gaps.
- Customers can only ever read/act on their **own** orders and payments (`user_id` from the JWT, never a client-supplied id) — enforced in `orderController` and `paymentService.getOwnedOrder`.
- Product prices are **never accepted from the client**: the customer catalog is read-only, and order totals are computed server-side from PostgreSQL (`selling_price`) inside a locked transaction (`SELECT ... FOR UPDATE`) at checkout, then re-verified against the live catalog again before a Razorpay order is created (protects against a price changing between checkout and payment).
- An order only becomes `PAID` through `POST /api/payments/verify`, which recomputes the Razorpay HMAC-SHA256 signature (`crypto.timingSafeEqual`) — customers have no endpoint that sets a payment or order status directly. (Admins retain a manual `PATCH /api/admin/orders/:id/status` override for operational use, e.g. reconciling offline payments — this is an intentional admin-only capability, gated the same as every other admin route.)
- Unlisted products (`is_listed = false`) are filtered out of every customer-facing query (`findListedProducts`, `findListedById`) at the SQL level, not just in the UI.
- `RAZORPAY_KEY_SECRET` and `DATABASE_URL` exist only in backend environment variables — never sent to, bundled into, or readable by either frontend. Frontends only ever see the Razorpay **Key ID**, and only via the backend's `create-order` response.
- CORS is origin-restricted via `CORS_ORIGIN` (comma-separated allowlist) — see `backend/src/config/cors.js`. With no `CORS_ORIGIN` set, production defaults to allowing **no** browser origins (fail closed); development falls back to `localhost:5173`/`5174`.

## Local Setup

Each app runs independently and reads its config from environment variables —
no secrets are hardcoded anywhere in the codebase. You'll need Node.js
`>=18.18.0` and a PostgreSQL database.

### 1. Database

Provision a local or hosted PostgreSQL instance (a hosted free tier such as
Neon or Supabase works fine for local development too), then run:

```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
```

`database/schema.sql` creates all 6 tables (`users`, `categories`, `products`,
`orders`, `order_items`, `payments`) with their constraints, indexes, and
`updated_at` triggers. `database/migrations/` is where future incremental
schema changes go (empty for now — the project hasn't needed one yet).

#### Seed data

`database/seed.sql` inserts:
- Two accounts (bcrypt-hashed passwords, for local login testing only — never use these in production):
  - **Admin:** `admin@bamboostore.test` / `Admin@12345`
  - **Customer:** `customer@bamboostore.test` / `Customer@12345`
- 5 categories and 10 products across them (with realistic stock/pricing/discounts)
- One sample `PAID` order with items and a payment record, so the order history and admin order views have something to show immediately

### 2. Backend API

```bash
cd backend
cp .env.example .env      # fill in real values — see Environment variables below
npm install
npm run dev                # http://localhost:5000, auto-reloads via nodemon
```

### 3. Customer frontend

```bash
cd customer-frontend
npm install
npm run dev                 # http://localhost:5173
```

### 4. Admin frontend

```bash
cd admin-frontend
npm install
npm run dev                 # http://localhost:5174
```

Both frontends read `VITE_API_URL` from their `.env.*` files and talk to the
backend over HTTP via Axios; `.env.development` already points both at
`http://localhost:5000/api` so local setup works out of the box.

### Running everything together

Open three terminals (backend, customer-frontend, admin-frontend) and run the
three `npm run dev` commands above. With the seed data loaded, you can
immediately: log in as the customer to browse → cart → checkout → pay (Razorpay
test mode, see below) → view the order; and log in as the admin to see the
dashboard, manage products/categories, and view/update orders.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on (`5000` locally) |
| `NODE_ENV` | `development` or `production` — also controls CORS fail-open/closed default and DB SSL |
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgres://user:pass@host:5432/dbname` |
| `CORS_ORIGIN` | Comma-separated list of allowed browser origins, e.g. `https://www.example.com,https://admin.example.com` |
| `JWT_SECRET` | Random, high-entropy secret used to sign/verify JWTs — **never reuse a dev value in production** |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (safe to expose to frontends, but they get it from the backend anyway) |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret — **backend-only, never exposed to any frontend** |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret — **backend-only** |

`backend/.env.example` documents the same keys as a template; `.env.development`
and `.env.production` are tracked with non-secret defaults filled in (ports,
`CORS_ORIGIN` for each environment, `JWT_EXPIRES_IN`) — the actual secret
values are always supplied via your local `.env` or your host's dashboard,
never committed.

### Frontends (`customer-frontend/.env.*`, `admin-frontend/.env.*`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, e.g. `http://localhost:5000/api` or `https://api.example.com/api` |

Neither frontend needs a Razorpay env var — the customer frontend receives
the Razorpay Key ID dynamically from `POST /api/payments/create-order`'s
response at payment time, keeping key management in one place (the backend).

## Razorpay Setup

1. Sign in to the [Razorpay Dashboard](https://dashboard.razorpay.com) and switch to **Test Mode** (top-left toggle) — no business verification is required for test mode.
2. Go to **Settings → API Keys → Generate Test Key**, and copy the `Key Id` (`rzp_test_...`) and `Key Secret` (shown once).
3. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in the backend's environment (`.env` locally, or your host's env var dashboard in production).
4. Test payments with Razorpay's published test instruments (test mode only, no real money moves):
   - **Success card:** `4111 1111 1111 1111`, any future expiry, any CVV
   - **UPI success:** `success@razorpay`
   - **UPI failure:** `failure@razorpay`
   - Closing the checkout modal without paying exercises the "cancelled" path
5. When you're ready for real payments, generate **Live Mode** keys the same way and swap them into your production backend's env vars — no code changes needed.

The full payment flow: `checkout` creates a `PENDING` order in Postgres →
`POST /api/payments/create-order` re-validates prices/stock and creates a
Razorpay order → Razorpay Checkout collects payment → `POST
/api/payments/verify` recomputes the HMAC signature server-side and only
then flips the order to `PAID`.

## Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier is enough for this project).
2. From the Cloudinary dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in the backend's environment.
4. The admin product form uploads images through the backend, which forwards them to Cloudinary via `backend/src/config/cloudinary.js` — the API secret never reaches the admin frontend.

## Deployment (free/low-cost, no Docker)

| App | Suggested host | Domain |
|---|---|---|
| customer-frontend | Vercel / Netlify | `www.example.com` |
| admin-frontend | Vercel / Netlify | `admin.example.com` |
| backend | Render / Railway | `api.example.com` |
| database | Neon / Supabase (PostgreSQL) | — |
| images | Cloudinary | — |
| payments | Razorpay | — |

### Database (Neon or Supabase)

1. Create a free Postgres project; copy its connection string as `DATABASE_URL`.
2. Run the schema and seed against it: `psql "$DATABASE_URL" -f database/schema.sql` and (optionally, for a demo dataset rather than production data) `psql "$DATABASE_URL" -f database/seed.sql`.
3. Both Neon and Supabase require SSL — the backend already handles this: `backend/src/config/db.js` sets `ssl: { rejectUnauthorized: false }` automatically whenever `NODE_ENV=production`.

### Backend (Render or Railway)

- **Render:** a `render.yaml` Blueprint is included at the repo root — connect the repo, Render reads it and provisions a web service rooted at `backend/` with `npm install` / `npm start` and a `/health` check. Fill in the `sync: false` env vars (`DATABASE_URL`, `CORS_ORIGIN`, `JWT_SECRET`, Razorpay/Cloudinary keys) in the Render dashboard — they're intentionally left out of the Blueprint since they're secrets.
- **Railway:** create a new service from the repo, set the root directory to `backend/`, build command `npm install`, start command `npm start`. Railway auto-detects Node and doesn't need a config file.
- Either way, set `NODE_ENV=production` and point `CORS_ORIGIN` at your two frontend domains (see Domain configuration below).

### Frontends (Vercel or Netlify)

Both `customer-frontend/` and `admin-frontend/` include:
- `vercel.json` — SPA rewrite (`/* → /index.html`) so React Router's client-side routes don't 404 on a hard refresh/direct link, on Vercel.
- `public/_redirects` — the equivalent for Netlify.

For either host: set the project root to `customer-frontend/` (or
`admin-frontend/`), build command `npm run build`, output directory `dist`,
and set `VITE_API_URL=https://api.example.com/api` as a build-time env var
(Vite inlines `VITE_*` vars at build time, so this must be set *before*
building, not just at runtime).

### Domain configuration

Point three DNS records (as CNAME/ALIAS records, per your host's instructions) at each service:

| Domain | Points to |
|---|---|
| `www.example.com` | customer-frontend deployment (Vercel/Netlify) |
| `admin.example.com` | admin-frontend deployment (Vercel/Netlify) |
| `api.example.com` | backend deployment (Render/Railway) |

Then, on the backend, set:
```
CORS_ORIGIN=https://www.example.com,https://admin.example.com
```
so the browser-facing API only accepts requests from those two origins (see
`backend/src/config/cors.js`) — replace `example.com` throughout this README
and in `.env.production`/`render.yaml` with your actual domain once you have one.

Finally, update `VITE_API_URL` in both frontends' production env config to
`https://api.example.com/api` (already the default in
`customer-frontend/.env.production` and `admin-frontend/.env.production` —
just swap in your real domain).

## Design Palette

| Token | Hex |
|---|---|
| Primary Bamboo | `#6B7A3D` |
| Deep Bamboo | `#3F4A24` |
| Bamboo Gold | `#C9A227` |
| Warm Bamboo | `#D8B56A` |
| Ivory | `#F7F3E8` |
| Surface | `#FFFDF7` |
| Text | `#292B22` |
| Muted | `#73766A` |
