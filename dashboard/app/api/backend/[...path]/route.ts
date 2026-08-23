import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

// Generic proxy so client components can mutate data without the backend's
// bearer token ever reaching the browser — see lib/backend.ts and this
// repo's README ("no direct database access... talks to the backend over
// HTTP"). Every /api/backend/* call here re-attaches the staff token
// server-side and forwards to the real endpoint.
async function handle(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const body = req.method === "GET" || req.method === "DELETE" ? undefined : await req.text();

  const res = await backendFetch(`/api/${path.join("/")}${req.nextUrl.search}`, {
    method: req.method,
    body,
  });

  const text = await res.text();
  return new NextResponse(text || null, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}

export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
