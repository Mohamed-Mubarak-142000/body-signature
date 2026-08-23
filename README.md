# Body Signature — Backend

The API layer for the Body Signature platform: accounts, catalog, cart/wishlist,
orders, booking, CMS, and contact-form handling. Consumed by the marketing site
(`zefaaf-body-signature`) and the [dashboard](../zefaaf-body-signature-dashboard) app.

Full product spec: `BACKEND_PRD.md` in the `zefaaf-body-signature` repo (§5 has the ERD
this schema implements).

**Status:** the data model, auth foundation, and CRUD for catalog/CMS/staff/
orders/bookings are real and working end-to-end against a live Supabase
Postgres instance. What's still missing is customer-facing account creation
(register/OTP/login) and checkout/booking submission — see
[Planned API surface](#planned-api-surface) below.

## Stack

- Next.js (App Router) — used purely as an API server, no pages of its own
- PostgreSQL + Prisma (`prisma/schema.prisma`)
- Auth.js v5 (`lib/auth.ts`) — Credentials + Google, JWT sessions, no adapter
  (our own `User`/`OAuthAccount`/`OtpCode` tables are the source of truth)
- Resend + React Email (`lib/mail.ts`, `emails/*`) — one shared branded layout
  for every transactional email
- Zod for request validation

## Getting started

Database is Supabase Postgres (project ref `etoshkfpvpndorjbdtns`) — Supabase
is used as a plain Postgres host + file storage here, not for auth; see
[Architecture notes](#architecture-notes).

```bash
cp .env.example .env   # fill in [YOUR-PASSWORD] from Supabase → Project Settings → Database
npm install
npx prisma migrate dev --name init   # runs against DIRECT_URL
npm run dev                          # http://localhost:3001, runs against DATABASE_URL (pooled)
```

A Supabase MCP server is configured in `.mcp.json` (project-scoped) for
DB/debugging work from inside Claude Code — run `claude /mcp` once to
authenticate it.

## Architecture notes

- **Supabase is a Postgres host, not an auth provider.** We connect to it
  purely through Prisma/`DATABASE_URL`. Don't add `@supabase/ssr` or
  `@supabase/supabase-js`-based auth here — sign-in stays on Auth.js
  (customers) and the bearer-token flow (staff), both described below.
- **No PrismaAdapter.** NextAuth's default adapter expects its own
  `Account`/`Session`/`VerificationToken` shape. We model identity ourselves
  (`User`, `OAuthAccount`, `OtpCode`) per the PRD, so account linking happens
  by hand in `lib/auth.ts`'s `signIn` callback (not yet implemented — see below).
- **Staff auth is a bearer token, not a shared cookie session.** The dashboard
  runs on its own origin with its own NextAuth session, so there's no cookie
  this app can read from it. `POST /api/staff-login` is a plain JSON endpoint
  (not part of the NextAuth flow here) that verifies an admin/assistant and
  returns a short-lived JWT (`lib/staff-token.ts`, signed with
  `STAFF_JWT_SECRET`). The dashboard's Credentials provider calls it, stashes
  the token in its own session, and attaches it as `Authorization: Bearer
  <token>` on every request to this API. `lib/require-staff.ts` verifies that
  header — it does not call `auth()`. Staff accounts have no self-signup;
  only `role: admin | assistant` can get a token.
- **The dashboard has no direct database access.** It talks to this API over
  HTTP so Prisma/the schema only live in one place. Keep it that way — don't
  add a second Prisma client to the dashboard repo.
- **Cross-domain OAuth.** Google's redirect flow runs on whichever domain
  hosts this app. Once the marketing site needs customer login, decide whether
  it calls this API directly or this API's `/api/auth/*` pages are what
  customers land on — not resolved yet.

## Planned API surface

Not built yet — customer-facing account creation and the flows that depend
on a logged-in customer:

| Area | Endpoints | PRD section | Blocks |
|---|---|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/verify-otp`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` | §4.1 | — |
| Cart | `GET /api/cart`, `POST /api/cart/items`, `PATCH/DELETE /api/cart/items/[id]` | §4.7 | Auth |
| Wishlist | `GET /api/wishlist`, `POST/DELETE /api/wishlist/items/[productId]` | §4.7 | Auth |
| Order creation | `POST /api/orders` (from cart, computes total/order number) | §4.8 | Auth, Cart |
| Booking creation | `POST /api/bookings` | §4.5 | Auth |
| Email sending | Wire `lib/mail.ts` into contact/order-status/booking-status | §4.9 | `RESEND_API_KEY` |

Once Auth exists, `Order`/`Booking` rows can actually be created by
customers — the dashboard's Orders/Bookings pages already have real
list + status-transition UI waiting for that data.

## What's already real

- `prisma/schema.prisma` — all 25 entities from the ERD, migrated onto Supabase
- Categories: `GET/POST /api/categories`, `GET/PATCH/DELETE /api/categories/[id]`
- Products: `GET/POST /api/products`, `GET/PATCH/DELETE /api/products/[id]` (nested translations/images/variants)
- Services: `GET/POST /api/services`, `GET/PATCH/DELETE /api/services/[id]`
- Pages/CMS: `GET/POST /api/pages`, `GET/PATCH/DELETE /api/pages/[slug]` (per-locale upsert)
- Orders: `GET /api/orders`, `GET/PATCH /api/orders/[id]` (staff status transitions + history)
- Bookings: `GET /api/bookings`, `PATCH /api/bookings/[id]` (staff approve/reject/reschedule)
- Team: `GET/POST /api/staff`, `DELETE /api/staff/[id]` (admin-only)
- Contact: `POST /api/contact` (honeypot spam guard; email sending still TODO), `GET /api/contact` (staff)
- `POST /api/staff-login` — returns a bearer token (`lib/staff-token.ts`), not a cookie
- `lib/auth.ts` + `app/api/auth/[...nextauth]/route.ts` — Credentials + Google wired,
  Google account linking still TODO
- `emails/` — shared layout + OTP, order-status, booking-status, contact-ack templates (not yet sent anywhere)
- `prisma/seed.ts` — creates a default admin (`npm run db:seed`)
