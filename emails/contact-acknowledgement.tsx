import { Heading, Text } from "@react-email/components";

import { EmailLayout } from "./layout";

export function ContactAcknowledgementEmail({ name }: { name: string }) {
  return (
    <EmailLayout previewText="We've received your message">
      <Heading as="h2" style={{ fontSize: 18, margin: "0 0 12px" }}>
        Thank you, {name}
      </Heading>
      <Text>
        We&apos;ve received your message and someone from our team will get back to you shortly.
      </Text>
    </EmailLayout>
  );
}
