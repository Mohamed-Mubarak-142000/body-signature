import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { badRequest, unauthorized } from "@/lib/http";
import { signAuthToken } from "@/lib/auth-token";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

// Confirms the code from POST /api/auth/register, marks the account
// verified, and logs the customer straight in (BACKEND_PRD.md §4.1).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return unauthorized("Invalid code");

  const otp = await prisma.otpCode.findFirst({
    where: {
      userId: user.id,
      purpose: "verify_email",
      code: parsed.data.code,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return unauthorized("Invalid or expired code");

  await prisma.$transaction([
    prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } }),
  ]);

  const token = await signAuthToken({ sub: user.id, email: user.email, role: "customer" });

  return NextResponse.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
