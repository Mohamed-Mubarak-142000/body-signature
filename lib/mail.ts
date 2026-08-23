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
