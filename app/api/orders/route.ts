import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { forbidden } from "@/lib/http";

// Orders are created by customers checking out (not built yet — needs the
// cart/checkout flow, see BACKEND_PRD.md §4.8). This only lists them for
// staff; there's intentionally no POST here.
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
