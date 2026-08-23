import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { requireCustomer } from "@/lib/require-customer";
import { badRequest, forbidden } from "@/lib/http";

// Staff-only: every booking, across all customers.
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

const requestBookingSchema = z.object({
  serviceId: z.string().min(1),
  slotId: z.string().optional(),
  requestedAt: z.string().datetime(),
});

// Customer books an appointment — always lands as "pending", never
// auto-confirmed (BACKEND_PRD.md §4.5: manual admin/assistant approval).
export async function POST(req: NextRequest) {
  const customer = await requireCustomer(req);
  if (!customer) return forbidden();

  const body = await req.json().catch(() => null);
  const parsed = requestBookingSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const service = await prisma.service.findUnique({ where: { id: parsed.data.serviceId } });
  if (!service || !service.isBookable) return badRequest("This service isn't bookable.");

  const booking = await prisma.booking.create({
    data: {
      userId: customer.sub,
      serviceId: parsed.data.serviceId,
      slotId: parsed.data.slotId,
      requestedAt: new Date(parsed.data.requestedAt),
    },
    include: { service: { include: { translations: true } } },
  });

  return NextResponse.json(booking, { status: 201 });
}
