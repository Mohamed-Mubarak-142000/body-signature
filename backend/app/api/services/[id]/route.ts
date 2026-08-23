import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { badRequest, forbidden } from "@/lib/http";

type RouteParams = { params: Promise<{ id: string }> };

const translationSchema = z.object({
  locale: z.enum(["ar", "en", "nl"]),
  title: z.string().min(1),
  description: z.string().optional(),
});

const updateServiceSchema = z.object({
  slug: z.string().min(1).optional(),
  isBookable: z.boolean().optional(),
  durationMinutes: z.number().int().positive().optional(),
  translations: z.array(translationSchema).min(1).optional(),
});

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const service = await prisma.service.findUnique({
    where: { id },
    include: { translations: true },
  });
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(service);
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const staff = await requireStaff(req, "assistant");
  if (!staff) return forbidden();

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateServiceSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const { translations, ...data } = parsed.data;

  const service = await prisma.$transaction(async (tx) => {
    if (translations) {
      await tx.serviceTranslation.deleteMany({ where: { serviceId: id } });
    }
    return tx.service.update({
      where: { id },
      data: {
        ...data,
        ...(translations && { translations: { create: translations } }),
      },
      include: { translations: true },
    });
  });

  return NextResponse.json(service);
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const staff = await requireStaff(req, "admin");
  if (!staff) return forbidden();

  const { id } = await params;
  await prisma.service.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
