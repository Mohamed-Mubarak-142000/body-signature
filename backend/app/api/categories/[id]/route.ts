import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { badRequest, forbidden } from "@/lib/http";

type RouteParams = { params: Promise<{ id: string }> };

const updateCategorySchema = z.object({
  slug: z.string().min(1).optional(),
  parentId: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { translations: true, children: true, products: true },
  });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(category);
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const staff = await requireStaff(req, "assistant");
  if (!staff) return forbidden();

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const category = await prisma.category.update({
    where: { id },
    data: parsed.data,
    include: { translations: true },
  });
  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const staff = await requireStaff(req, "admin");
  if (!staff) return forbidden();

  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
