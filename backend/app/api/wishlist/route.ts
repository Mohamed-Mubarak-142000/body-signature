import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/require-customer";
import { badRequest, forbidden } from "@/lib/http";

const addItemSchema = z.object({ productId: z.string().min(1) });

async function getOrCreateWishlist(userId: string) {
  return prisma.wishlist.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: { items: { include: { product: { include: { translations: true, images: true } } } } },
  });
}

export async function GET(req: NextRequest) {
  const customer = await requireCustomer(req);
  if (!customer) return forbidden();

  const wishlist = await getOrCreateWishlist(customer.sub);
  return NextResponse.json(wishlist);
}

export async function POST(req: NextRequest) {
  const customer = await requireCustomer(req);
  if (!customer) return forbidden();

  const body = await req.json().catch(() => null);
  const parsed = addItemSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const wishlist = await getOrCreateWishlist(customer.sub);

  await prisma.wishlistItem.upsert({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId: parsed.data.productId } },
    update: {},
    create: { wishlistId: wishlist.id, productId: parsed.data.productId },
  });

  const updated = await getOrCreateWishlist(customer.sub);
  return NextResponse.json(updated, { status: 201 });
}
