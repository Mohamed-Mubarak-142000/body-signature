import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { badRequest } from "@/lib/http";
import { generateOtp, OTP_TTL_MINUTES } from "@/lib/otp";
import { sendMailSafe } from "@/lib/mail";
import { OtpCodeEmail } from "@/emails/otp-code";

const schema = z.object({ email: z.string().email() });

// Always returns the same generic message regardless of whether the email
// exists, to avoid leaking which addresses have accounts.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user?.passwordHash) {
    const code = generateOtp();
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code,
        purpose: "reset_password",
        expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000),
      },
    });
    await sendMailSafe(
      user.email,
      "Reset your password",
      OtpCodeEmail({ code, purpose: "reset_password" }),
      `reset_password OTP ${code}`,
    );
  }

  return NextResponse.json({ message: "If that email has an account, a code was sent." });
}
