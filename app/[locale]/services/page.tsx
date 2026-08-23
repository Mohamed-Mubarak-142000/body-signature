import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SectionHeader } from "@/components/sections/SectionHeader";
import { ServicesGrid } from "@/components/sections/ServicesGrid";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("services");
  return { title: t("title"), description: t("subtitle") };
}

export default async function ServicesPage() {
  const t = await getTranslations("services");

  return (
    <section className="mx-auto max-w-6xl px-6 pt-10 pb-20">
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        className="mb-14"
      />
      <ServicesGrid />
    </section>
  );
}
