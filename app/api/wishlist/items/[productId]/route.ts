import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/require-customer";
import { forbidden } from "@/lib/http";

type RouteParams = { params: Promise<{ productId: string }> };

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const customer = await requireCustomer(req);
  if (!customer) return forbidden();

  const { productId } = await params;
  const wishlist = await prisma.wishlist.findUnique({ where: { userId: customer.sub } });
  if (!wishlist) return new NextResponse(null, { status: 204 });

  await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId } });
  return new NextResponse(null, { status: 204 });
}
