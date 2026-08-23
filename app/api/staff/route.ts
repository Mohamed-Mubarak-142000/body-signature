import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { badRequest, forbidden } from "@/lib/http";

const createStaffSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(["admin", "assistant"]),
});

// Team management — admin-only, no self-signup (BACKEND_PRD.md §4.2).
export async function GET(req: NextRequest) {
  const staff = await requireStaff(req, "admin");
  if (!staff) return forbidden();

  const users = await prisma.user.findMany({
    where: { role: { in: ["admin", "assistant"] } },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const staff = await requireStaff(req, "admin");
  if (!staff) return forbidden();

  const body = await req.json().catch(() => null);
  const parsed = createStaffSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role,
      passwordHash,
      emailVerified: true,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
