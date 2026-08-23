# Body Signature — Dashboard

The staff admin panel: Admin and Assistant sign in here to manage products,
categories, orders, bookings, content, and contact messages. See
`BACKEND_PRD.md` (in the `zefaaf-body-signature` repo) §4.2 for the role split.

**Status:** every module is real — full CRUD for Categories/Products/Services/
Content, status-transition UI for Orders/Bookings, and Team management —
wired to the live [backend](../zefaaf-body-signature-backend). Orders and
Bookings tables will stay empty until the backend's customer-facing
register/checkout/booking-creation flows exist (see that repo's README);
the staff side (list + approve/reject/ship, etc.) is ready for that data now.

## Stack

- Next.js (App Router) + Tailwind CSS
- Auth.js v5 (`lib/auth.ts`) — Credentials only, no Google (staff have no self-signup)
- TanStack Table (`@tanstack/react-table/legacy` — see below) for every list view
- React Hook Form + Zod (`lib/schemas.ts`) for every create/edit form

## Architecture

**No database, no Prisma.** This app has zero direct data access — every read
or write goes through the backend's HTTP API. Keep it that way; if a page
needs data, add the endpoint to the backend and fetch it from here.

**Login flow:** the Credentials provider's `authorize()` calls the backend's
`POST /api/staff-login` with the entered email/password. On success, the
backend returns a bearer token (a signed JWT, not a shared cookie — the two
apps run on different origins). That token is stored in *this app's own*
NextAuth session.

**Two ways data reaches the backend, both carrying that token:**
- **Server Components** (initial page load) call `lib/backend.ts`'s
  `backendFetch()` directly.
- **Client Components** (forms, row actions) can't hold the bearer token
  safely, so they call this app's own `/api/backend/[...path]` catch-all
  route (`app/api/backend/[...path]/route.ts`), which re-attaches the token
  server-side and forwards to the real backend endpoint. Always go through
  `/api/backend/*` from client code — never call `BACKEND_URL` directly from
  the browser.

**Role gating:** `lib/nav.ts` filters the sidebar by role; a page like
`app/(dashboard)/team/page.tsx` that's admin-only also checks
`session.user.role` itself, since the sidebar hiding a link doesn't stop
someone from typing the URL.

**TanStack Table v9 note:** v9 shipped a new store-based architecture
(`useTable`) alongside a `/legacy` export that's a drop-in for the well-known
v8 API (`useLegacyTable`, `getCoreRowModel`, `flexRender`, `LegacyColumnDef`).
`components/data-table.tsx` deliberately uses the `/legacy` import — it's the
better-understood, more stable surface, not a temporary shim.

**Forms with `z.coerce`:** `productFormSchema` and `serviceFormSchema` coerce
numeric fields (price, stock, duration) from form input. Because the input
and output types differ, their client components type `useForm` as
`useForm<Input, unknown, Output>` (see `products-client.tsx`/
`services-client.tsx` and the `*FormInput`/`*FormOutput` exports in
`lib/schemas.ts`) rather than a single inferred type — that's required for
`zodResolver` to type-check, not incidental.

## Getting started

```bash
cp .env.example .env   # BACKEND_URL must point at a running backend
npm install
npm run dev             # http://localhost:3002
```

Log in with the backend's seeded admin (`npm run db:seed` in the backend repo
creates `admin@bodysignature.nl` / `ChangeMe123!` — change that password via
the Team page once real staff accounts exist... once there's a "change
password" feature; for now it's a straight DB update).

## What's already real

- `lib/auth.ts` + `proxy.ts` — login, session, route protection (Next 16
  renamed `middleware.ts` to `proxy.ts`; see that file's comment if you're
  used to the old name)
- `lib/nav.ts` + `components/sidebar.tsx` — role-gated navigation
- `components/data-table.tsx`, `components/modal.tsx`, `components/form-field.tsx` —
  shared building blocks every module page uses
- Categories, Products, Services, Content: full list + create/edit/delete
- Orders, Bookings: list + inline status-transition dropdown
- Team: list + add/remove (admin-only)
- `app/api/backend/[...path]/route.ts` — the client-mutation proxy described above
