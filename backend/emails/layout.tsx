import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";

// The one shared branded layout every transactional email renders into —
// see BACKEND_PRD.md §4.9. Colors match the marketing site's brand tokens
// (app/globals.css in the zefaaf-body-signature repo).
const GOLD = "#e7bb7e";
const INK = "#211c16";
const IVORY = "#fbf8f3";

export function EmailLayout({
  previewText,
  children,
}: {
  previewText: string;
  children: ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: IVORY, fontFamily: "Georgia, 'Times New Roman', serif", color: INK, margin: 0, padding: "32px 0" }}>
        <Container style={{ backgroundColor: "#ffffff", maxWidth: 480, margin: "0 auto", padding: 32, borderTop: `4px solid ${GOLD}` }}>
          <Text style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: INK, margin: "0 0 24px" }}>
            Body Signature
          </Text>
          <Section>{children}</Section>
          <Hr style={{ borderColor: "#eeeeee", margin: "32px 0 16px" }} />
          <Text style={{ fontSize: 12, color: "#888888" }}>
            This is an automated message — please don&apos;t reply directly to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
