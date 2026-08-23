import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { badRequest, forbidden } from "@/lib/http";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const staff = await requireStaff(req, "admin");
  if (!staff) return forbidden();

  const { id } = await params;
  if (id === staff.sub) return badRequest("You can't remove your own account.");

  await prisma.user.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
