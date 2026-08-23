import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { requireCustomer } from "@/lib/require-customer";
import { badRequest, forbidden } from "@/lib/http";

// Staff-only: every order, across all customers.
export async function GET(req: NextRequest) {
  const staff = await requireStaff(req, "assistant");
  if (!staff) return forbidden();

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

const checkoutSchema = z.object({
  shippingAddress: z.string().min(1),
  phone: z.string().min(1),
  paymentMethod: z.enum(["cod", "manual_transfer"]),
});

function generateOrderNumber() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BS-${Date.now().toString(36).toUpperCase()}-${random}`;
}

// Customer checkout: turns their cart into an Order, snapshotting each
// line's price at purchase time. Doesn't touch product stock — whether
// stock auto-depletes or staff toggle it manually is still an open
// question (BACKEND_PRD.md §9).
export async function POST(req: NextRequest) {
  const customer = await requireCustomer(req);
  if (!customer) return forbidden();

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const cart = await prisma.cart.findUnique({
    where: { userId: customer.sub },
    include: { items: { include: { product: true, variant: true } } },
  });

  if (!cart || cart.items.length === 0) return badRequest("Your cart is empty.");

  const orderItems = cart.items.map((item) => {
    const unitPrice = Number(item.product.price) + Number(item.variant?.priceModifier ?? 0);
    return {
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice,
      subtotal: unitPrice * item.quantity,
    };
  });
  const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: customer.sub,
        orderNumber: generateOrderNumber(),
        totalAmount,
        shippingAddress: parsed.data.shippingAddress,
        phone: parsed.data.phone,
        paymentMethod: parsed.data.paymentMethod,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    await tx.orderStatusHistory.create({
      data: { orderId: created.id, status: "pending", note: "Order placed" },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return created;
  });

  return NextResponse.json(order, { status: 201 });
}
