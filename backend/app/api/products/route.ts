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

const variantSchema = z.object({
  attribute: z.string().min(1),
  value: z.string().min(1),
  priceModifier: z.number().default(0),
  stockQuantity: z.number().int().default(0),
});

const createProductSchema = z.object({
  categoryId: z.string().min(1),
  sku: z.string().min(1),
  slug: z.string().min(1),
  price: z.number().nonnegative(),
  stockQuantity: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
  translations: z.array(translationSchema).min(1),
  images: z.array(z.object({ url: z.string().url(), sortOrder: z.number().int().default(0) })).default([]),
  variants: z.array(variantSchema).default([]),
});

// Public callers (the storefront) only ever see active products; a staff
// bearer token (the dashboard) sees everything, including inactive ones.
export async function GET(req: NextRequest) {
  const staff = await requireStaff(req, "assistant");

  const products = await prisma.product.findMany({
    where: staff ? {} : { isActive: true },
    include: { translations: true, images: true, variants: true, category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const staff = await requireStaff(req, "assistant");
  if (!staff) return forbidden();

  const body = await req.json().catch(() => null);
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const { translations, images, variants, ...data } = parsed.data;
  const product = await prisma.product.create({
    data: {
      ...data,
      translations: { create: translations },
      images: { create: images },
      variants: { create: variants },
    },
    include: { translations: true, images: true, variants: true, category: true },
  });

  return NextResponse.json(product, { status: 201 });
}
