import type { NextRequest } from "next/server";

import { verifyAuthToken, type AuthTokenPayload } from "@/lib/auth-token";

/**
 * Guard for customer-facing routes (cart, wishlist, orders, bookings) —
 * same bearer-token mechanism as lib/require-staff.ts, scoped to role
 * "customer". See BACKEND_PRD.md §4.1: no guest checkout, login is
 * required before booking or ordering.
 */
export async function requireCustomer(req: NextRequest): Promise<AuthTokenPayload | null> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  const customer = await verifyAuthToken(token);
  if (!customer || customer.role !== "customer") return null;
  return customer;
}
