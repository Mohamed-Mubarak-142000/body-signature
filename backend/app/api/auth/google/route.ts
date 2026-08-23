import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { badRequest, forbidden, unauthorized } from "@/lib/http";
import { signAuthToken } from "@/lib/auth-token";

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  googleId: z.string().min(1),
});

// Called server-side by the marketing site's NextAuth `signIn` callback,
// never directly by a browser — this endpoint trusts the caller's claim
// that `email` belongs to `googleId` without re-checking it, because
// NextAuth's Google provider already verified that cryptographically before
// this runs. The shared secret is what limits "who can call this" to that
// trusted server, not the browser (BACKEND_PRD.md §4.1: Google sign-in
// counts as email-verified immediately).
export async function POST(req: NextRequest) {
  const internalSecret = req.headers.get("x-internal-secret");
  if (!internalSecret || internalSecret !== process.env.INTERNAL_API_SECRET) {
    return forbidden("Invalid internal secret");
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const existingAccount = await prisma.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider: "google", providerAccountId: parsed.data.googleId } },
    include: { user: true },
  });

  let user = existingAccount?.user;

  if (!user) {
    const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });

    if (existingUser) {
      if (existingUser.role !== "customer") return unauthorized("This email belongs to a staff account");
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: { emailVerified: true },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: parsed.data.email,
          name: parsed.data.name,
          role: "customer",
          emailVerified: true,
        },
      });
    }

    await prisma.oAuthAccount.create({
      data: { userId: user.id, provider: "google", providerAccountId: parsed.data.googleId },
    });
  }

  const token = await signAuthToken({ sub: user.id, email: user.email, role: "customer" });

  return NextResponse.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
