import { SignJWT, jwtVerify } from "jose";

export type StaffTokenPayload = {
  sub: string;
  email: string;
  role: "admin" | "assistant";
};

function secret() {
  const value = process.env.STAFF_JWT_SECRET;
  if (!value) throw new Error("STAFF_JWT_SECRET is not set");
  return new TextEncoder().encode(value);
}

/**
 * Staff (admin/assistant) auth is a bearer token, not a cookie session —
 * the dashboard app runs on its own origin with its own NextAuth session,
 * so there's no shared cookie to check here. The dashboard's Credentials
 * provider gets this token from POST /api/staff-login and attaches it as
 * `Authorization: Bearer <token>` on every request to this API.
 */
export async function signStaffToken(payload: StaffTokenPayload) {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
}

export async function verifyStaffToken(token: string): Promise<StaffTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.email !== "string") return null;
    if (payload.role !== "admin" && payload.role !== "assistant") return null;
    return { sub: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}
