# Body Signature — Backend

The API layer for the Body Signature platform: accounts, catalog, cart/wishlist,
orders, booking, CMS, and contact-form handling. Consumed by the marketing site
(this monorepo's root) and the [dashboard](../dashboard) app.

Full product spec: `../BACKEND_PRD.md` at this monorepo's root (§5 has the ERD
this schema implements).

**Status:** everything in the PRD is implemented and verified end-to-end against
a live Supabase Postgres instance — register → verify → login → cart → checkout
→ staff status updates all work. What's *not* built: an actual payment gateway
(out of scope per the PRD) and a mobile app (also out of scope).

## Stack

- Next.js (App Router) — used purely as an API server, no pages of its own
- PostgreSQL + Prisma (`prisma/schema.prisma`)
- Bearer-token auth for both staff and customers (`lib/auth-token.ts`) — no
  NextAuth here; see [Architecture notes](#architecture-notes) for why
- Resend + React Email (`lib/mail.ts`, `emails/*`) — one shared branded layout
  for every transactional email, with a console-log dev fallback when
  `RESEND_API_KEY` isn't set
- Zod for request validation

## Getting started

Database is Supabase Postgres (project ref `etoshkfpvpndorjbdtns`) — Supabase
is used as a plain Postgres host here, not for auth; see
[Architecture notes](#architecture-notes).

```bash
cp .env.example .env   # fill in [YOUR-PASSWORD] from Supabase → Project Settings → Database
npm install
npx prisma migrate dev --name init   # runs against DIRECT_URL
npm run db:seed                      # creates admin@bodysignature.nl / ChangeMe123!
npm run dev                          # http://localhost:3001, runs against DATABASE_URL (pooled)
```

A Supabase MCP server is configured in `.mcp.json` (project-scoped) for
DB/debugging work from inside Claude Code — run `claude /mcp` once to
authenticate it.

**No `RESEND_API_KEY`? That's fine for local dev.** `lib/mail.ts`'s
`sendMailSafe()` logs `[DEV EMAIL] ...` to the console instead of failing —
including the OTP code itself, so registration/password-reset are fully
testable without a real email provider.

## Architecture notes

- **No NextAuth in this app.** An earlier version wired up NextAuth here for
  customer auth, but that never made sense: this app has no pages, and
  Google's OAuth redirect needs a browser-facing page to land on. Auth here
  is plain REST (`/api/auth/*`) plus bearer tokens (`lib/auth-token.ts`).
  NextAuth lives in the two browser-facing apps — the marketing site
  (customers, including Google) and the dashboard (staff) — each with its
  own session, each getting its token from this API.
- **One bearer-token mechanism, two roles.** `signAuthToken`/`verifyAuthToken`
  in `lib/auth-token.ts` sign/verify a JWT carrying `{sub, email, role}` for
  *any* user — staff and customers alike. `lib/require-staff.ts` and
  `lib/require-customer.ts` are thin guards on top that check `role`. Staff
  get theirs from `POST /api/staff-login` (8h expiry); customers get theirs
  from `POST /api/auth/verify-otp`, `POST /api/auth/login`, or
  `POST /api/auth/google` (30d expiry).
- **`POST /api/auth/google` trusts its caller, not the request body.** It
  marks an email verified based on a claim with no password check — that's
  only safe because it's gated by `INTERNAL_API_SECRET` and is meant to be
  called exclusively by the marketing site's server-side NextAuth `signIn`
  callback, which already had Google cryptographically verify the identity
  before calling it. Never expose this endpoint to the browser directly.
- **Neither browser app has direct database access.** Both talk to this API
  over HTTP so Prisma/the schema only live in one place. Keep it that way —
  don't add a second Prisma client anywhere else.
- **Stock isn't touched at checkout.** `POST /api/orders` snapshots price at
  purchase time but doesn't decrement `Product.stockQuantity` — whether that
  should be automatic or a manual staff toggle is still an open call
  (`BACKEND_PRD.md` §9).

## API surface

**Public (no auth):**
`GET /api/categories`, `GET /api/products` (active products only for public
callers; a staff bearer token also gets inactive ones — same endpoint,
behavior branches on the caller), `GET /api/products/slug/[slug]` (what the
storefront's product page uses), `GET /api/services`, `GET /api/pages`,
`GET /api/pages/[slug]`, `POST /api/contact`

**Customer auth (`lib/require-customer.ts`):**
`POST /api/auth/register` → `POST /api/auth/verify-otp` (returns a token) →
logged in. Repeat visits: `POST /api/auth/login` or `POST /api/auth/google`.
Forgot password: `POST /api/auth/forgot-password` → `POST /api/auth/reset-password`.
`GET /api/me` resolves any bearer token to its user (any role).

**Customer-only (bearer token, `role: customer`):**
`GET/POST /api/cart`, `PATCH/DELETE /api/cart/items/[id]`,
`GET/POST /api/wishlist`, `DELETE /api/wishlist/items/[productId]`,
`POST /api/orders` (checkout from cart), `GET /api/me/orders`,
`POST /api/bookings`, `GET /api/me/bookings`

**Staff-only (bearer token, `role: admin | assistant`, `lib/require-staff.ts`):**
`POST/GET/PATCH/DELETE` on `/api/categories`, `/api/products`, `/api/services`,
`/api/pages` · `GET /api/orders` (all orders) + `PATCH /api/orders/[id]`
(status transitions) · `GET /api/bookings` (all bookings) +
`PATCH /api/bookings/[id]` (approve/reject/reschedule) ·
`GET /api/contact` (submissions) · `GET/POST /api/staff`,
`DELETE /api/staff/[id]` (admin-only)

**Staff login:** `POST /api/staff-login` (separate from `/api/auth/*`, which
is customer-only — see Architecture notes)

Every status-changing endpoint (`orders/[id]`, `bookings/[id]`) and
`register`/`forgot-password`/`contact` sends an email via `sendMailSafe`.

## What's real vs. open

Built and tested: everything above. What's still an open product decision
rather than a missing feature — see `BACKEND_PRD.md` §9:

- Payment method on `Order` is a placeholder enum (`cod` | `manual_transfer`)
  — no payment gateway per the PRD.
- Stock isn't auto-decremented on checkout.
- Shipping cost isn't computed — `shippingAddress` is stored as free text.
- Returns/exchanges aren't modeled.
