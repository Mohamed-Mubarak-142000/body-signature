import { NextResponse } from "next/server";

export function notImplemented(feature: string) {
  return NextResponse.json(
    { error: `Not implemented yet: ${feature}` },
    { status: 501 },
  );
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
