import { Heading, Text } from "@react-email/components";

import { EmailLayout } from "./layout";

export function OtpCodeEmail({
  code,
  purpose,
}: {
  code: string;
  purpose: "verify_email" | "reset_password";
}) {
  const heading = purpose === "verify_email" ? "Confirm your email" : "Reset your password";
  return (
    <EmailLayout previewText={`Your Body Signature code: ${code}`}>
      <Heading as="h2" style={{ fontSize: 18, margin: "0 0 12px" }}>
        {heading}
      </Heading>
      <Text>Use this code to continue. It expires in 10 minutes.</Text>
      <Text style={{ fontSize: 32, fontWeight: 700, letterSpacing: 6 }}>{code}</Text>
      <Text style={{ fontSize: 13, color: "#888888" }}>
        If you didn&apos;t request this, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
