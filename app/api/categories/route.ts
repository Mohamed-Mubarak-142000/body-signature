import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { badRequest, forbidden } from "@/lib/http";

const translationSchema = z.object({
  locale: z.enum(["ar", "en", "nl"]),
  name: z.string().min(1),
  description: z.string().optional(),
});

const createCategorySchema = z.object({
  slug: z.string().min(1),
  parentId: z.string().optional(),
  imageUrl: z.string().url().optional(),
  translations: z.array(translationSchema).min(1),
});

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: { translations: true, children: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const staff = await requireStaff(req, "assistant");
  if (!staff) return forbidden();

  const body = await req.json().catch(() => null);
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const { translations, ...data } = parsed.data;
  const category = await prisma.category.create({
    data: {
      ...data,
      translations: { create: translations },
    },
    include: { translations: true },
  });

  return NextResponse.json(category, { status: 201 });
}
