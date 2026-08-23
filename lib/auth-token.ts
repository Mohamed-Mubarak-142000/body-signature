import { SignJWT, jwtVerify } from "jose";

export type Role = "customer" | "assistant" | "admin";
export type AuthTokenPayload = { sub: string; email: string; role: Role };

function secret() {
  const value = process.env.AUTH_TOKEN_SECRET;
  if (!value) throw new Error("AUTH_TOKEN_SECRET is not set");
  return new TextEncoder().encode(value);
}

/**
 * Every browser-facing app (dashboard for staff, marketing site for
 * customers) has its own session on its own origin — there's no cookie this
 * API can read from either. Both get a bearer token from this API instead
 * (POST /api/staff-login, POST /api/auth/login, POST /api/auth/verify-otp,
 * POST /api/auth/google) and attach it as `Authorization: Bearer <token>` on
 * every request. lib/require-staff.ts and lib/require-customer.ts verify it
 * and branch on `role`.
 */
export async function signAuthToken(payload: AuthTokenPayload, expiresIn: string = "30d") {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret());
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.email !== "string") return null;
    if (payload.role !== "admin" && payload.role !== "assistant" && payload.role !== "customer") {
      return null;
    }
    return { sub: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}
