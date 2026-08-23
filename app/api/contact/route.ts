import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { badRequest, forbidden } from "@/lib/http";
import { sendMailSafe } from "@/lib/mail";
import { ContactAcknowledgementEmail } from "@/emails/contact-acknowledgement";
import { ContactNotifyStaffEmail } from "@/emails/contact-notify-staff";

const submitSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
  locale: z.enum(["ar", "en", "nl"]),
  // Honeypot: a hidden form field real visitors never fill in.
  // Bots that auto-fill every field trip this and get silently dropped.
  website: z.string().max(0).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  if (parsed.data.website) {
    // Honeypot tripped — pretend success so the bot doesn't learn anything.
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  // TODO(contact feature): rate-limit by IP/email — see BACKEND_PRD.md §4.4.
  const { website: _honeypot, ...data } = parsed.data;
  const submission = await prisma.contactSubmission.create({ data });

  await sendMailSafe(
    data.email,
    "We've received your message",
    ContactAcknowledgementEmail({ name: data.name }),
    `contact-ack to ${data.email}`,
  );

  if (process.env.CONTACT_NOTIFY_EMAIL) {
    await sendMailSafe(
      process.env.CONTACT_NOTIFY_EMAIL,
      `New enquiry from ${data.name}`,
      ContactNotifyStaffEmail(data),
      `contact-notify-staff about ${data.email}`,
    );
  }

  return NextResponse.json({ id: submission.id }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const staff = await requireStaff(req, "assistant");
  if (!staff) return forbidden();

  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(submissions);
}
