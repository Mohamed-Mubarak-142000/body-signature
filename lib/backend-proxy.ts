import { NextRequest, NextResponse } from "next/server";

/**
 * Thin server-side proxy factory for pre-auth backend endpoints (register,
 * verify-otp, forgot/reset password) — same reasoning as app/api/contact:
 * avoids CORS and keeps BACKEND_URL out of the client bundle. These calls
 * carry no session token; they're what *establishes* one.
 */
export function proxyToBackend(path: string) {
  return async function POST(req: NextRequest) {
    const body = await req.text();
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json({ error: "Not configured yet" }, { status: 503 });
    }

    const res = await fetch(`${backendUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  };
}
