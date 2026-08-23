import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { badRequest, forbidden } from "@/lib/http";

const translationSchema = z.object({
  locale: z.enum(["ar", "en", "nl"]),
  content: z.object({ title: z.string().min(1), body: z.string() }),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

const createPageSchema = z.object({
  slug: z.string().min(1),
  translations: z.array(translationSchema).min(1),
});

export async function GET() {
  const pages = await prisma.page.findMany({
    include: { translations: true },
    orderBy: { slug: "asc" },
  });
  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const staff = await requireStaff(req, "assistant");
  if (!staff) return forbidden();

  const body = await req.json().catch(() => null);
  const parsed = createPageSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const { translations, ...data } = parsed.data;
  const page = await prisma.page.create({
    data: { ...data, translations: { create: translations } },
    include: { translations: true },
  });

  return NextResponse.json(page, { status: 201 });
}
