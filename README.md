# Body Signature — Monorepo

Three independent Next.js apps in one repo, merged from separate repos via
`git subtree` (each still has its own full commit history). Each app has its
own `package.json`, `node_modules`, `.env`, and lint/build scripts — they are
**not** npm workspaces sharing dependencies; they just live in the same git
repo now so a change that spans more than one of them (e.g. adding a field
to `Product`) lands as one PR/commit set instead of three.

```
/            → the marketing site (customer-facing, this is the app deployed today)
/backend     → the API (accounts, catalog, cart, orders, bookings, CMS, contact)
/dashboard   → the staff admin panel
```

Full product spec: `BACKEND_PRD.md` (this directory). Each subfolder's own
`README.md` covers its architecture in detail — read those before changing
that app's code, not this file.

## Running everything locally

Each app runs independently on its own port:

```bash
npm install && npm run dev              # this app       → http://localhost:3000
cd backend && npm install && npm run dev    # → http://localhost:3001
cd dashboard && npm install && npm run dev  # → http://localhost:3002
```

The marketing site and dashboard both call the backend over HTTP
(`BACKEND_URL` in their `.env`/`.env.local`) — nothing works end-to-end
without the backend running too.

## Why `turbopack.root` is set in backend/ and dashboard/'s next.config.ts

Turbopack auto-detects a project's root by walking up to the nearest
lockfile. Since this repo now has three lockfiles (this app's at the repo
root, plus one in each subfolder), `backend/` and `dashboard/`'s Turbopack
build would otherwise walk up and lock onto the *root* lockfile, resolving
node_modules and — critically — the Prisma-generated types from the wrong
place. Both subfolders pin `turbopack.root: __dirname` to stay contained to
their own directory. If you add a fourth app, give it the same fix.

## Why backend/ and dashboard/ are excluded from this app's tsconfig/eslint

This app's `tsconfig.json` (`include: ["**/*.ts", ...]`) and
`eslint.config.mjs` would otherwise recursively pick up every `.ts`/`.tsx`
file in the whole repo tree, including the other two apps' source —
breaking this app's type-check with errors from files it has no relationship
to (they use different path aliases, different `node_modules`, different
Prisma types). Both configs explicitly exclude `backend` and `dashboard`.
Don't remove those exclusions without giving each app its own isolated
tsconfig project reference instead.

## Deploying

Only this app (the marketing site) has hosting/domain set up today — see
the MVP plan. `backend/` and `dashboard/` aren't deployed yet; whichever
platform they end up on, point its "root directory" setting at the
respective subfolder, the same way you'd `cd` into it locally.
