import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Reveal } from "@/components/effects/Reveal";
import { ContactForm } from "@/components/sections/ContactForm";
import { SectionHeader } from "@/components/sections/SectionHeader";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact");
  return { title: t("title"), description: t("subtitle") };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <section className="mx-auto max-w-5xl px-6 pt-10 pb-20">
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        className="mb-14"
      />

      <div className="grid gap-12 md:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <ContactForm />
        </Reveal>

        <Reveal
          delay={0.1}
          className="h-fit rounded-2xl border border-border/70 bg-card p-8"
        >
          <h2 className="font-heading text-lg text-foreground">
            {t("infoTitle")}
          </h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">{t("phoneTitle")}</dt>
              <dd className="mt-1 text-foreground">{t("phoneValue")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("emailTitle")}</dt>
              <dd className="mt-1 text-foreground">{t("email")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("addressTitle")}</dt>
              <dd className="mt-1 text-foreground">{t("address")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("hoursTitle")}</dt>
              <dd className="mt-1 text-foreground">{t("hours")}</dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
