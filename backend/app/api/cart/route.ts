import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/require-customer";
import { badRequest, forbidden } from "@/lib/http";

const addItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().positive().default(1),
});

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: { items: { include: { product: { include: { translations: true, images: true } }, variant: true } } },
  });
}

export async function GET(req: NextRequest) {
  const customer = await requireCustomer(req);
  if (!customer) return forbidden();

  const cart = await getOrCreateCart(customer.sub);
  return NextResponse.json(cart);
}

// Adding the same product+variant combination again increments quantity
// rather than creating a duplicate row.
export async function POST(req: NextRequest) {
  const customer = await requireCustomer(req);
  if (!customer) return forbidden();

  const body = await req.json().catch(() => null);
  const parsed = addItemSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const cart = await getOrCreateCart(customer.sub);
  const { productId, variantId, quantity } = parsed.data;

  const existing = cart.items.find(
    (item) => item.productId === productId && (item.variantId ?? null) === (variantId ?? null),
  );

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, variantId, quantity },
    });
  }

  const updated = await getOrCreateCart(customer.sub);
  return NextResponse.json(updated, { status: 201 });
}
