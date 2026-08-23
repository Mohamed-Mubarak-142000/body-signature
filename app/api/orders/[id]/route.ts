import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { badRequest, forbidden } from "@/lib/http";

type RouteParams = { params: Promise<{ id: string }> };

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
  note: z.string().optional(),
});

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } },
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

// Advances the order lifecycle (BACKEND_PRD.md §4.8: pending → confirmed →
// processing → shipped → delivered, or → cancelled). Records who changed it
// and appends to the history — email notification is still TODO (needs
// RESEND_API_KEY configured, see lib/mail.ts).
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const staff = await requireStaff(req, "assistant");
  if (!staff) return forbidden();

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id },
      data: { status: parsed.data.status },
      include: { items: true, statusHistory: true },
    });
    await tx.orderStatusHistory.create({
      data: {
        orderId: id,
        changedByUserId: staff.sub,
        status: parsed.data.status,
        note: parsed.data.note,
      },
    });
    return updated;
  });

  return NextResponse.json(order);
}
