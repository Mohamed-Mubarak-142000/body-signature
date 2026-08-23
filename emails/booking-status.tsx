import { Heading, Text } from "@react-email/components";

import { EmailLayout } from "./layout";

const STATUS_COPY: Record<string, string> = {
  pending: "We've received your booking request and it's awaiting review.",
  confirmed: "Your appointment has been confirmed.",
  rejected: "We're unable to accommodate this booking request.",
  rescheduled: "We've proposed a new time for your appointment.",
  cancelled: "Your booking has been cancelled.",
};

export function BookingStatusEmail({
  serviceName,
  status,
}: {
  serviceName: string;
  status: keyof typeof STATUS_COPY;
}) {
  return (
    <EmailLayout previewText={`${serviceName}: ${STATUS_COPY[status]}`}>
      <Heading as="h2" style={{ fontSize: 18, margin: "0 0 12px" }}>
        {serviceName}
      </Heading>
      <Text>{STATUS_COPY[status]}</Text>
    </EmailLayout>
  );
}
