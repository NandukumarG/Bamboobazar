# Bamboo Store

A bamboo decor e-commerce platform split into three independently deployable applications.

## Architecture

```text
bamboo-store/
├── customer-frontend/   React + Vite (JavaScript) — www.example.com
├── admin-frontend/      React + Vite (JavaScript) — admin.example.com
├── backend/              Node.js + Express (JavaScript) — api.example.com
├── database/             PostgreSQL schema, seed data, migrations
├── .gitignore
└── README.md
```

`admin-frontend` is a fully separate React application (its own Vite project, own
dependencies, own deploy target) — it is not a set of routes inside the customer site.

## Stack

- **Customer frontend:** React, Vite, JavaScript, React Router, Axios
- **Admin frontend:** React, Vite, JavaScript, React Router, Axios
- **Backend:** Node.js, Express, JavaScript, REST API, JWT, bcrypt
- **Database:** PostgreSQL
- **Payments:** Razorpay
- **Images:** Cloudinary

## Local Development

Each app runs independently and reads its config from environment variables — no
secrets are hardcoded anywhere in the codebase.

### 1. Database

Provision a local or hosted PostgreSQL instance (e.g. via Neon or Supabase), then run:

```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
```

Future schema changes go into `database/migrations/`.

### 2. Backend API

```bash
cd backend
cp .env.example .env      # fill in real values locally
npm install
npm run dev                # starts on PORT (default 5000)
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

Both frontends read `VITE_API_URL` and `VITE_RAZORPAY_KEY_ID` from their `.env.*`
files and talk to the backend over HTTP via Axios.

## Deployment (free-tier friendly, no Docker)

| App               | Suggested host      | Domain              |
|--------------------|---------------------|----------------------|
| customer-frontend | Vercel / Netlify    | www.example.com     |
| admin-frontend    | Vercel / Netlify    | admin.example.com   |
| backend           | Render / Railway    | api.example.com     |
| database          | Neon / Supabase     | —                    |
| images            | Cloudinary          | —                    |

## Design Palette

| Token          | Hex       |
|----------------|-----------|
| Primary Bamboo | `#6B7A3D` |
| Deep Bamboo    | `#3F4A24` |
| Bamboo Gold    | `#C9A227` |
| Warm Bamboo    | `#D8B56A` |
| Ivory          | `#F7F3E8` |
| Surface        | `#FFFDF7` |
| Text           | `#292B22` |
| Muted          | `#73766A` |

This part of the project sets up structure and configuration only — no features or
detailed UI have been built yet.
