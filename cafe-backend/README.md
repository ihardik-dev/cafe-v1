# Cafe Backend

A TypeScript modular-monolith backend for the cafe website. It uses Fastify, PostgreSQL, Prisma 7, Zod, JWT, bcrypt, Vitest, Pino and Swagger/OpenAPI.

## Implemented scope

- Customer registration/login, 7-day JWT authentication, logout-by-client-token-discard, and read-only own profile.
- Public category and available-menu browsing.
- Admin-only category and menu-item management. Category deletion is blocked while menu items exist.
- Frontend-only cart: there is deliberately no cart table or cart API.
- Authenticated demonstration orders. Prices are re-read from PostgreSQL, unavailable/deleted items are rejected, totals are computed server-side in minor currency units, and order-item names/prices are snapshots.
- Customer-owned order history and cancellation for at most 60 seconds after server-side `createdAt`.
- Authenticated reservations with Asia/Kolkata input interpretation, guest count 1–6, future-date validation, customer-owned history, and cancellation only when at least 24 hours remain.
- A `Table` model with only `id` and `isActive`; no assignment or capacity behavior.
- Swagger UI at `/docs`, health endpoint at `/health`, request logging with sensitive-value redaction, and login/registration rate limits.

There are no payment gateways, refunds, webhooks, stock/inventory, delivery, coupons, customer/admin order or reservation dashboards, account deletion, notifications, Redis, workers, microservices, or double-booking prevention.

## Requirements

- Node.js 20.19+ (Node.js 22 recommended)
- npm
- PostgreSQL 16+ (or Docker Desktop / Docker Engine with Compose)

## Local installation

```bash
npm install
cp .env.example .env
```

Edit `.env` and set a unique `JWT_SECRET` with at least 32 characters, the PostgreSQL connection URL, and the seeded admin credentials. The example database URL is suitable only when PostgreSQL is running locally with the example credentials.

Generate the Prisma client and apply the migration:

```bash
npm run db:generate
npm run db:deploy
npm run db:seed
```

For active schema development, use `npm run db:migrate` instead of `npm run db:deploy` to create/apply a development migration.

Start the development server:

```bash
npm run dev
```

The API listens on `http://localhost:4000` by default. Interactive API documentation is at `http://localhost:4000/docs` and the database-backed health check is at `http://localhost:4000/health`.

## Docker Compose

Create `.env` from `.env.example`, set `JWT_SECRET`, `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`, then run:

```bash
docker compose up --build
```

Compose starts PostgreSQL with a persistent named volume, waits for its health check, applies migrations, runs the idempotent seed, and starts the API. The API is exposed on the host port specified by `PORT` (default `4000`).

Stop the services with `docker compose down`. The named PostgreSQL volume is retained. To delete the database volume as well, use `docker compose down -v` (destructive).

## Database schema and seed

The Prisma schema contains exactly these seven models: `User`, `Category`, `MenuItem`, `Order`, `OrderItem`, `Reservation`, and `Table`. The initial SQL migration is in `prisma/migrations/20261109000000_init/`.

Seeding creates the five requested categories (`Coffee`, `Tea`, `Cold Beverages`, `Snacks`, `Desserts`) and upserts one admin identity using `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. No menu items or prices are invented. The seed is idempotent and updates the existing seeded admin (including its email) when run again with changed environment credentials.

## API outline

All business routes are under `/api/v1`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a CUSTOMER |
| POST | `/auth/login` | Public | Login and receive a 7-day JWT |
| POST | `/auth/logout` | Authenticated | Client discards the stateless JWT |
| GET | `/users/me` | Authenticated | Read own profile |
| GET | `/categories` | Public | Browse categories |
| GET | `/menu` | Public | Browse AVAILABLE items; optional `categoryId` |
| GET | `/menu/:id` | Public | View an AVAILABLE item |
| POST/PATCH/DELETE | `/admin/categories[/:id]` | ADMIN | Manage categories |
| GET/POST | `/admin/menu-items` | ADMIN | List all items / create an item |
| PATCH/DELETE | `/admin/menu-items/:id` | ADMIN | Update / permanently delete an item |
| POST | `/orders` | CUSTOMER | Create a confirmed demonstration order |
| GET | `/orders` | CUSTOMER | Own order history |
| GET | `/orders/:id` | CUSTOMER | Read an owned order |
| POST | `/orders/:id/cancel` | CUSTOMER | Cancel within 60 seconds |
| POST | `/reservations` | CUSTOMER | Create a reservation |
| GET | `/reservations` | CUSTOMER | Own reservation history; optional `filter=upcoming\|previous\|cancelled` |
| POST | `/reservations/:id/cancel` | CUSTOMER | Cancel at least 24 hours before reservation |

Send JWTs as `Authorization: Bearer <token>`. Admins are permitted only on menu/category management routes. They do not have order/reservation management endpoints.

### Reservation date/time format

`reservationDateTime` is accepted as `YYYY-MM-DDTHH:mm` and interpreted as Asia/Kolkata local time (UTC+05:30). For example, `2027-01-15T19:30` means 7:30 PM in India. The API stores the corresponding instant in PostgreSQL.

### Order payload

```json
{
  "items": [
    { "menuItemId": "<menu-item-uuid>", "quantity": 2 }
  ]
}
```

The request schema does not accept client-supplied item prices or totals; the backend reads current item prices from PostgreSQL. Quantity must be 1–10 for each item. A deleted or unavailable item causes checkout to fail without changing the customer's frontend cart.

After successful checkout, the response includes the notice:

> This is a dummy order created for demonstration purposes. No real order has been placed and no real payment has been made.

### Logout behavior

JWTs are stateless and no token blacklist or token database is added. Logout is therefore completed by the frontend deleting its stored token. The logout endpoint documents and acknowledges that action; a copied token remains valid until expiry.

## Testing and checks

```bash
npm run db:generate
npm run typecheck
npm test
npm run build
```

The Vitest suite exercises validation, money arithmetic, India-local datetime parsing, cancellation boundary rules, API auth/RBAC/response behavior, and mocked service-level database interactions. The PostgreSQL integration tests are enabled when `TEST_DATABASE_URL` points to a dedicated database with migrations already applied (for example, apply migrations with `DATABASE_URL="$TEST_DATABASE_URL" npm run db:deploy` before running `TEST_DATABASE_URL="$TEST_DATABASE_URL" npm test`); otherwise those two integration tests are skipped. The `/health` endpoint checks the actual configured database connection.

## Response conventions

Success responses use `{ "success": true, "message": "...", "data": ... }`. Errors use `{ "success": false, "message": "...", "errors": [...] }` when field-level validation details are available. Password hashes are never returned. Pino redacts authorization/cookie headers and request-body passwords.

## Environment variables

See `.env.example`. Never commit `.env` or use the example admin credentials in a public deployment. In production, use a unique high-entropy JWT secret and strong admin password, and restrict database network access.
