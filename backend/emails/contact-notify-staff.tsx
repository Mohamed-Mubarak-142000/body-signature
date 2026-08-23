import { Heading, Text } from "@react-email/components";

import { EmailLayout } from "./layout";

export function ContactNotifyStaffEmail({
  name,
  email,
  phone,
  message,
}: {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}) {
  return (
    <EmailLayout previewText={`New enquiry from ${name}`}>
      <Heading as="h2" style={{ fontSize: 18, margin: "0 0 12px" }}>
        New contact form submission
      </Heading>
      <Text>
        <strong>From:</strong> {name} ({email})
        {phone ? ` — ${phone}` : ""}
      </Text>
      <Text>{message}</Text>
    </EmailLayout>
  );
}
