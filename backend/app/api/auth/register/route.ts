import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { badRequest } from "@/lib/http";
import { generateOtp, OTP_TTL_MINUTES } from "@/lib/otp";
import { sendMailSafe } from "@/lib/mail";
import { OtpCodeEmail } from "@/emails/otp-code";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

// BACKEND_PRD.md §4.1 — email+password signup, gated behind OTP
// verification (POST /api/auth/verify-otp) before the account can log in.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing?.emailVerified) {
    return badRequest("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  // Re-registering an unverified email just resets it — no verified account
  // was ever created, so there's nothing to protect by rejecting this.
  const user = await prisma.user.upsert({
    where: { email: parsed.data.email },
    update: { passwordHash, name: parsed.data.name },
    create: {
      email: parsed.data.email,
      passwordHash,
      name: parsed.data.name,
      role: "customer",
      emailVerified: false,
    },
  });

  const code = generateOtp();
  await prisma.otpCode.create({
    data: {
      userId: user.id,
      code,
      purpose: "verify_email",
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000),
    },
  });

  await sendMailSafe(
    user.email,
    "Verify your email",
    OtpCodeEmail({ code, purpose: "verify_email" }),
    `verify_email OTP ${code}`,
  );

  return NextResponse.json({ message: "Check your email for a verification code." }, { status: 201 });
}
