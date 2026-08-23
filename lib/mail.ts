import type { ReactElement } from "react";
import { Resend } from "resend";
import { render } from "@react-email/render";

// Constructed lazily so importing this module doesn't crash local dev
// before RESEND_API_KEY is set.
let resend: Resend | undefined;
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

/**
 * Renders any email template from /emails into HTML and sends it via Resend.
 * Every template wraps in the same <EmailLayout> — see BACKEND_PRD.md §4.9.
 */
export async function sendMail(to: string, subject: string, template: ReactElement) {
  const html = await render(template);
  return getResend().emails.send({
    from: process.env.EMAIL_FROM ?? "Body Signature <no-reply@bodysignature.nl>",
    to,
    subject,
    html,
  });
}

/**
 * Best-effort send for notifications that must never block the request that
 * triggered them (OTP codes, order/booking status updates, contact-form
 * replies). Without RESEND_API_KEY configured — the default until someone
 * sets one up — this logs instead of throwing, so registration/checkout/etc.
 * stay fully testable in local dev with no email provider at all.
 */
export async function sendMailSafe(to: string, subject: string, template: ReactElement, devLabel: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[DEV EMAIL] ${devLabel} → ${to}: ${subject}`);
    return;
  }
  try {
    await sendMail(to, subject, template);
  } catch (error) {
    console.error(`Failed to send "${subject}" to ${to}:`, error);
    console.log(`[DEV EMAIL fallback] ${devLabel} → ${to}: ${subject}`);
  }
}
