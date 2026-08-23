import type { NextRequest } from "next/server";

import { verifyStaffToken, type StaffTokenPayload } from "@/lib/staff-token";

/**
 * Guard for dashboard-facing routes. Reads the bearer token the dashboard
 * attaches to every request (see lib/staff-token.ts for why this isn't a
 * cookie session). Returns the staff payload, or null when the caller isn't
 * an authenticated admin/assistant — callers should respond with
 * `forbidden()` from lib/http.ts.
 *
 * Role split: BACKEND_PRD.md §4.2 — admin gets everything an assistant does
 * plus staff/settings management; there's no third dashboard role.
 */
export async function requireStaff(
  req: NextRequest,
  minRole: "assistant" | "admin" = "assistant",
): Promise<StaffTokenPayload | null> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  const staff = await verifyStaffToken(token);
  if (!staff) return null;
  if (minRole === "admin" && staff.role !== "admin") return null;
  return staff;
}
