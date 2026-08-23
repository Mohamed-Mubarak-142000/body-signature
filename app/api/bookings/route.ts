import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { forbidden } from "@/lib/http";

// Bookings are created by logged-in customers (needs the customer
// register/login flow, see BACKEND_PRD.md §4.1 — not built yet). This only
// lists them for staff; there's intentionally no POST here.
export async function GET(req: NextRequest) {
  const staff = await requireStaff(req, "assistant");
  if (!staff) return forbidden();

  const bookings = await prisma.booking.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      service: { include: { translations: true } },
      slot: true,
    },
    orderBy: { requestedAt: "desc" },
  });
  return NextResponse.json(bookings);
}
