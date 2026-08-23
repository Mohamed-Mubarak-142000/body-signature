import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/require-customer";
import { forbidden } from "@/lib/http";

// The signed-in customer's own bookings — separate from GET /api/bookings
// (staff, all customers).
export async function GET(req: NextRequest) {
  const customer = await requireCustomer(req);
  if (!customer) return forbidden();

  const bookings = await prisma.booking.findMany({
    where: { userId: customer.sub },
    include: { service: { include: { translations: true } } },
    orderBy: { requestedAt: "desc" },
  });
  return NextResponse.json(bookings);
}
