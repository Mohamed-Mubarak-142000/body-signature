import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { badRequest, forbidden } from "@/lib/http";

type RouteParams = { params: Promise<{ id: string }> };

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

const updateProductSchema = z.object({
  categoryId: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
  translations: z.array(translationSchema).min(1).optional(),
  images: z.array(z.object({ url: z.string().url(), sortOrder: z.number().int().default(0) })).optional(),
  variants: z.array(variantSchema).optional(),
});

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { translations: true, images: true, variants: true, category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const staff = await requireStaff(req, "assistant");
  if (!staff) return forbidden();

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const { translations, images, variants, ...data } = parsed.data;

  // Nested collections are replaced wholesale rather than diffed — simplest
  // correct behavior for a dashboard form that always submits the full set.
  const product = await prisma.$transaction(async (tx) => {
    if (translations) {
      await tx.productTranslation.deleteMany({ where: { productId: id } });
    }
    if (images) {
      await tx.productImage.deleteMany({ where: { productId: id } });
    }
    if (variants) {
      await tx.productVariant.deleteMany({ where: { productId: id } });
    }

    return tx.product.update({
      where: { id },
      data: {
        ...data,
        ...(translations && { translations: { create: translations } }),
        ...(images && { images: { create: images } }),
        ...(variants && { variants: { create: variants } }),
      },
      include: { translations: true, images: true, variants: true, category: true },
    });
  });

  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const staff = await requireStaff(req, "admin");
  if (!staff) return forbidden();

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
