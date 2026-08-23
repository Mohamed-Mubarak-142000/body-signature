import { NextRequest, NextResponse } from "next/server";

// Thin server-side proxy to the backend's contact endpoint. Keeping this
// here (rather than having the browser call the backend directly) avoids
// CORS entirely and keeps BACKEND_URL out of the client bundle.
export async function POST(req: NextRequest) {
  const body = await req.text();

  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: "Contact form is not configured yet" }, { status: 503 });
  }

  const res = await fetch(`${backendUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
