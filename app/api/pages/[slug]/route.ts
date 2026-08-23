import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { badRequest, forbidden } from "@/lib/http";

type RouteParams = { params: Promise<{ slug: string }> };

const translationSchema = z.object({
  locale: z.enum(["ar", "en", "nl"]),
  content: z.object({ title: z.string().min(1), body: z.string() }),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

const updatePageSchema = z.object({
  translations: z.array(translationSchema).min(1),
});

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({
    where: { slug },
    include: { translations: true },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

// Translations are upserted per locale rather than replaced wholesale, so
// editing one locale's copy never clobbers the others.
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const staff = await requireStaff(req, "assistant");
  if (!staff) return forbidden();

  const { slug } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updatePageSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await Promise.all(
    parsed.data.translations.map((translation) =>
      prisma.pageTranslation.upsert({
        where: { pageId_locale: { pageId: page.id, locale: translation.locale } },
        create: { ...translation, pageId: page.id },
        update: translation,
      }),
    ),
  );

  const updated = await prisma.page.findUnique({
    where: { slug },
    include: { translations: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const staff = await requireStaff(req, "admin");
  if (!staff) return forbidden();

  const { slug } = await params;
  await prisma.page.delete({ where: { slug } });
  return new NextResponse(null, { status: 204 });
}
