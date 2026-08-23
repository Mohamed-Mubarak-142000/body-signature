import { Heading, Text } from "@react-email/components";

import { EmailLayout } from "./layout";

const STATUS_COPY: Record<string, string> = {
  pending: "We've received your order and it's awaiting confirmation.",
  confirmed: "Your order has been confirmed.",
  processing: "Your order is being prepared.",
  shipped: "Your order is on its way.",
  delivered: "Your order has been delivered.",
  cancelled: "Your order has been cancelled.",
};

export function OrderStatusEmail({
  orderNumber,
  status,
}: {
  orderNumber: string;
  status: keyof typeof STATUS_COPY;
}) {
  return (
    <EmailLayout previewText={`Order ${orderNumber}: ${STATUS_COPY[status]}`}>
      <Heading as="h2" style={{ fontSize: 18, margin: "0 0 12px" }}>
        Order {orderNumber}
      </Heading>
      <Text>{STATUS_COPY[status]}</Text>
    </EmailLayout>
  );
}
