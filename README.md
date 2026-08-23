# Body Signature — Dashboard

The staff admin panel: Admin and Assistant sign in here to manage products,
categories, orders, bookings, content, and contact messages. See
`BACKEND_PRD.md` (in the `zefaaf-body-signature` repo) §4.2 for the role split.

**Status: scaffold.** Auth, layout, and role-gated nav are real. Most module
pages are placeholders until the corresponding [backend](../zefaaf-body-signature-backend)
endpoints exist — see that repo's README for what's built vs. planned.

## Stack

- Next.js (App Router) + Tailwind CSS
- Auth.js v5 (`lib/auth.ts`) — Credentials only, no Google (staff have no self-signup)

## Architecture

**No database, no Prisma.** This app has zero direct data access — every read
or write goes through the backend's HTTP API. Keep it that way; if a page
needs data, add the endpoint to the backend and fetch it from here.

**Login flow:** the Credentials provider's `authorize()` calls the backend's
`POST /api/staff-login` with the entered email/password. On success, the
backend returns a bearer token (a signed JWT, not a shared cookie — the two
apps run on different origins). That token is stored in *this app's own*
NextAuth session and attached as `Authorization: Bearer <token>` on every
subsequent backend request via `lib/backend.ts`'s `backendFetch()`. Use
`backendFetch()` for all server-side calls to the backend — don't hand-roll
`fetch()` against `BACKEND_URL` elsewhere or you'll lose the auth header.

**Role gating:** `lib/nav.ts` filters the sidebar by role; a page like
`app/(dashboard)/team/page.tsx` that's admin-only also checks
`session.user.role` itself, since the sidebar hiding a link doesn't stop
someone from typing the URL.

## Getting started

```bash
cp .env.example .env   # BACKEND_URL must point at a running backend
npm install
npm run dev             # http://localhost:3002
```

You'll need at least one staff user in the backend's database
(`role: admin` or `assistant`, with a bcrypt `passwordHash`) to log in —
there's no seed script yet.

## What's already real

- `lib/auth.ts` + `middleware.ts` — login, session, route protection
- `lib/nav.ts` + `components/sidebar.tsx` — role-gated navigation
- `app/(dashboard)/categories`, `.../services`, `.../messages` — real data
  fetched from the backend
- `app/(dashboard)/products`, `.../orders`, `.../bookings`, `.../content`,
  `.../team` — placeholders, waiting on backend endpoints
