import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { badRequest, unauthorized } from "@/lib/http";

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8),
});

// Verifies the code from POST /api/auth/forgot-password and sets a new
// password. Doesn't auto-login — the customer signs in fresh afterward.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return unauthorized("Invalid or expired code");

  const otp = await prisma.otpCode.findFirst({
    where: {
      userId: user.id,
      purpose: "reset_password",
      code: parsed.data.code,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return unauthorized("Invalid or expired code");

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);

  await prisma.$transaction([
    prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
  ]);

  return NextResponse.json({ message: "Password updated. You can now sign in." });
}
