import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { badRequest, forbidden } from "@/lib/http";

const translationSchema = z.object({
  locale: z.enum(["ar", "en", "nl"]),
  title: z.string().min(1),
  description: z.string().optional(),
});

const createServiceSchema = z.object({
  slug: z.string().min(1),
  isBookable: z.boolean().default(true),
  durationMinutes: z.number().int().positive().default(30),
  translations: z.array(translationSchema).min(1),
});

export async function GET() {
  const services = await prisma.service.findMany({
    include: { translations: true },
    orderBy: { slug: "asc" },
  });
  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const staff = await requireStaff(req, "assistant");
  if (!staff) return forbidden();

  const body = await req.json().catch(() => null);
  const parsed = createServiceSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const { translations, ...data } = parsed.data;
  const service = await prisma.service.create({
    data: { ...data, translations: { create: translations } },
    include: { translations: true },
  });

  return NextResponse.json(service, { status: 201 });
}
