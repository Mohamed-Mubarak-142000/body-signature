import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth-token";
import { unauthorized } from "@/lib/http";

// Resolves a bearer token to the user it belongs to — any role. Used by the
// marketing site's "token" Credentials provider to turn a token obtained
// from verify-otp/google (both of which already return one) into a session,
// without asking the customer to log in again right after verifying.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return unauthorized();

  const payload = await verifyAuthToken(token);
  if (!payload) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) return unauthorized();

  return NextResponse.json(user);
}
