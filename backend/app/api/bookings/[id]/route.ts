import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { badRequest, forbidden } from "@/lib/http";
import { sendMailSafe } from "@/lib/mail";
import { BookingStatusEmail } from "@/emails/booking-status";

type RouteParams = { params: Promise<{ id: string }> };

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "rejected", "rescheduled", "cancelled"]),
  adminNote: z.string().optional(),
});

// Approve/reject a booking request — BACKEND_PRD.md §4.5 requires manual
// admin/assistant review, never auto-confirm.
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const staff = await requireStaff(req, "assistant");
  if (!staff) return forbidden();

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const booking = await prisma.booking.update({
    where: { id },
    data: parsed.data,
    include: { service: { include: { translations: true } }, user: true },
  });

  const serviceName =
    booking.service.translations.find((t) => t.locale === "en")?.title ?? booking.service.slug;

  await sendMailSafe(
    booking.user.email,
    `Your booking: ${serviceName}`,
    BookingStatusEmail({ serviceName, status: booking.status }),
    `booking-status ${booking.status} for ${booking.user.email}`,
  );

  return NextResponse.json(booking);
}
