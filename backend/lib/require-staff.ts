import type { NextRequest } from "next/server";

import { verifyAuthToken, type AuthTokenPayload } from "@/lib/auth-token";

/**
 * Guard for dashboard-facing routes. Returns the staff payload, or null when
 * the caller isn't an authenticated admin/assistant — callers should
 * respond with `forbidden()` from lib/http.ts.
 *
 * Role split: BACKEND_PRD.md §4.2 — admin gets everything an assistant does
 * plus staff/settings management; there's no third dashboard role.
 */
export async function requireStaff(
  req: NextRequest,
  minRole: "assistant" | "admin" = "assistant",
): Promise<AuthTokenPayload | null> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  const staff = await verifyAuthToken(token);
  if (!staff) return null;
  if (staff.role !== "admin" && staff.role !== "assistant") return null;
  if (minRole === "admin" && staff.role !== "admin") return null;
  return staff;
}
