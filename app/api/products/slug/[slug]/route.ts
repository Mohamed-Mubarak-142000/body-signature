import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ slug: string }> };

// Public lookup for the storefront product-detail page — only ever returns
// active products (staff use GET /api/products/[id] for everything,
// including inactive ones).
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: { translations: true, images: true, variants: true, category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}
