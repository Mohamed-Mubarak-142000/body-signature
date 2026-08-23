import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { badRequest, forbidden } from "@/lib/http";

type RouteParams = { params: Promise<{ id: string }> };

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "rejected", "rescheduled", "cancelled"]),
  adminNote: z.string().optional(),
});

// Approve/reject a booking request — BACKEND_PRD.md §4.5 requires manual
// admin/assistant review, never auto-confirm. Email notification is still
// TODO (needs RESEND_API_KEY configured, see lib/mail.ts).
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

  return NextResponse.json(booking);
}
