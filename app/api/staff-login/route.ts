import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { badRequest, unauthorized } from "@/lib/http";
import { signStaffToken } from "@/lib/staff-token";

// Called by the dashboard app's own Credentials provider (not by NextAuth
// here) — staff accounts have no self-signup, so this only ever verifies,
// never creates. See BACKEND_PRD.md §4.2.
//
// Returns a bearer token (not a cookie): the dashboard runs on its own
// origin, so it stores this token in its own session and attaches it as
// `Authorization: Bearer <token>` on every subsequent request to this API.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email as string | undefined;
  const password = body?.password as string | undefined;
  if (!email || !password) return badRequest("email and password are required");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return unauthorized("Invalid credentials");
  if (user.role !== "admin" && user.role !== "assistant") {
    return unauthorized("Invalid credentials");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return unauthorized("Invalid credentials");

  const token = await signStaffToken({ sub: user.id, email: user.email, role: user.role });

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}
