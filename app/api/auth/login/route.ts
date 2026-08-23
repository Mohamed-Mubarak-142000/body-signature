import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { badRequest, unauthorized } from "@/lib/http";
import { signAuthToken } from "@/lib/auth-token";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Customer email+password login — same bearer-token shape as
// POST /api/staff-login, called by the marketing site's Credentials
// provider. Google sign-in goes through POST /api/auth/google instead.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.passwordHash || user.role !== "customer") {
    return unauthorized("Invalid credentials");
  }
  if (!user.emailVerified) return unauthorized("Please verify your email first");

  const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!isValid) return unauthorized("Invalid credentials");

  const token = await signAuthToken({ sub: user.id, email: user.email, role: "customer" });

  return NextResponse.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
