import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/require-customer";
import { forbidden } from "@/lib/http";

// The signed-in customer's own orders — separate from GET /api/orders
// (staff, all customers) to keep the two audiences from ever mixing up.
export async function GET(req: NextRequest) {
  const customer = await requireCustomer(req);
  if (!customer) return forbidden();

  const orders = await prisma.order.findMany({
    where: { userId: customer.sub },
    include: { items: { include: { product: { include: { translations: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}
