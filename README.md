# Mini Food Ordering System

A small fullstack food ordering app: browse restaurants, add dishes to a cart, place an order and view its status.

| Part     | Stack                                                                 |
| -------- | --------------------------------------------------------------------- |
| Backend  | NestJS 11, TypeScript, Prisma 7, PostgreSQL 17, JWT (Passport), Swagger |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Axios, TanStack Query |

```
backend/    NestJS API, Prisma schema, SQL migrations, seed, Dockerfile
frontend/   Next.js app
docker-compose.yml   PostgreSQL + migrate/seed job + API
```

## URLs

| What          | URL                                  |
| ------------- | ------------------------------------ |
| Frontend      | http://localhost:3000                |
| API base URL  | http://localhost:3001                |
| Swagger UI    | http://localhost:3001/api/docs       |

## Demo account

The seed creates a customer you can log in with right away:

- **Email:** `demo@example.com`
- **Password:** `Demo1234!`

You can also register a new account at `/register`.

## Prerequisites

- Node.js 22+ and npm
- Docker with Docker Compose (for the Docker setup, or just for the database)

## Option A – Run with Docker

Docker Compose starts PostgreSQL, applies the migrations, seeds the demo data and runs the API.

```bash
docker compose up --build
```

Services:

- `db` – PostgreSQL 17 on port `5432` (user `postgres`, password `postgres`, database `mini_food`)
- `migrate` – one-off job: `prisma migrate deploy` and then `prisma db seed`
- `backend` – the API on port `3001`

The defaults can be overridden from the shell or a root `.env` file, e.g. `JWT_SECRET=... docker compose up`. The default `JWT_SECRET` is for local development only.

The frontend is not part of the Compose setup. Run it locally as in step 3 below.

## Option B – Run locally

### 1. Database

Use any PostgreSQL instance, or start just the database from Compose:

```bash
docker compose up -d db
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:deploy
npm run db:seed
npm run start:dev
```

`npm install` also generates the Prisma client. The API listens on http://localhost:3001.

Environment variables (`backend/.env`):

| Variable         | Description                                          | Default                  |
| ---------------- | ---------------------------------------------------- | ------------------------ |
| `DATABASE_URL`   | PostgreSQL connection string                         | – (required)             |
| `JWT_SECRET`     | JWT signing secret, at least 32 characters           | – (required)             |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `15m`, `1h`, `1d`               | `1h`                     |
| `PORT`           | HTTP port of the API                                 | `3001`                   |
| `CORS_ORIGINS`   | Comma-separated origins allowed to call the API      | `http://localhost:3000`  |

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000. `NEXT_PUBLIC_API_URL` in `.env.local` points to the API (default `http://localhost:3001`).

For a production build: `npm run build && npm run start`.

## Database: migrations and seed

The schema lives in `backend/prisma/schema.prisma`. The SQL migrations are in `backend/prisma/migrations/`.

| Command (in `backend/`) | What it does                                                      |
| ----------------------- | ----------------------------------------------------------------- |
| `npm run db:deploy`     | Applies all pending migrations (`prisma migrate deploy`)          |
| `npm run db:seed`       | Seeds restaurants, menus and the demo customer                    |
| `npm run db:migrate`    | Development: creates and applies a new migration from schema changes |
| `npm run db:reset`      | Drops the database, re-applies all migrations and re-seeds        |

The seed is idempotent: every record has a deterministic id, so running it again updates the existing rows instead of creating duplicates, and it never touches existing orders.

## API

All endpoints are documented in Swagger at http://localhost:3001/api/docs. To call protected endpoints there, log in, copy the `accessToken` and paste it into **Authorize**.

| Method | Path               | Auth   | Description                                         |
| ------ | ------------------ | ------ | --------------------------------------------------- |
| POST   | `/auth/register`   | –      | Register a customer (name, email, password); returns a JWT |
| POST   | `/auth/login`      | –      | Log in; returns a JWT                               |
| GET    | `/auth/who-am-i`   | Bearer | The currently authenticated user                    |
| GET    | `/restaurants`     | –      | List restaurants (optional filters)                 |
| GET    | `/restaurants/:id` | –      | Restaurant details including its menu               |
| POST   | `/orders`          | Bearer | Place an order for the logged-in customer           |
| GET    | `/orders/:id`      | Bearer | An order of the logged-in customer                  |
| GET    | `/orders/:id/events` | Bearer | Server-Sent Events: live status for that order    |

Notes:

- Every route requires a JWT unless it is marked public. Send the token as `Authorization: Bearer <token>`.
- Order prices and totals are calculated on the server from the current menu. Clients send only menu item ids and quantities.
- New orders start with status `PENDING`. Another customer's order returns `404`.
- After that, the server moves each order on its own: `PENDING` → `CONFIRMED` → `PREPARING` → `DELIVERING` → `DELIVERED`, about every 8 seconds. `GET /orders/:id/events` is a Server-Sent Events stream. The first `order.status` event is the current status; later events carry `{ orderId, status, updatedAt }` as the order advances. The order page follows this stream and updates without a reload.

## Frontend pages

| Page                | Description                                                        |
| ------------------- | ------------------------------------------------------------------ |
| `/login`            | Email + password; stores the JWT and redirects to `/restaurants`   |
| `/register`         | Name, email, password; logs the customer in automatically          |
| `/restaurants`      | Restaurant list                                                     |
| `/restaurants/[id]` | Restaurant details and menu, cart, **Place Order** → order page     |
| `/orders/[id]`      | Order details and status                                            |

`/restaurants` and `/orders` require login. Without a valid token you are redirected to `/login`.

## Tests and checks

```bash
cd backend
npm test
npm run test:cov
```

```bash
cd frontend
npm run typecheck
npm run lint
```
