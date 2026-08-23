import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/require-customer";
import { badRequest, forbidden } from "@/lib/http";

type RouteParams = { params: Promise<{ id: string }> };

const updateSchema = z.object({ quantity: z.number().int().positive() });

async function ownsItem(itemId: string, userId: string) {
  const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
  return item && item.cart.userId === userId ? item : null;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const customer = await requireCustomer(req);
  if (!customer) return forbidden();

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const item = await ownsItem(id, customer.sub);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.cartItem.update({
    where: { id },
    data: { quantity: parsed.data.quantity },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const customer = await requireCustomer(req);
  if (!customer) return forbidden();

  const { id } = await params;
  const item = await ownsItem(id, customer.sub);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.cartItem.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
