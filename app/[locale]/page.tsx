import { getTranslations } from "next-intl/server";

import { CTASection } from "@/components/sections/CTASection";
import { Hero } from "@/components/sections/Hero";
import { HomeIntro } from "@/components/sections/HomeIntro";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { ServicesGrid } from "@/components/sections/ServicesGrid";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <>
      <Hero />
      <HomeIntro />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader
          eyebrow={t("servicesEyebrow")}
          title={t("servicesTitle")}
          subtitle={t("servicesSubtitle")}
          align="center"
          className="mb-14"
        />
        <ServicesGrid />
      </section>

      <CTASection
        title={t("ctaTitle")}
        body={t("ctaBody")}
        buttonLabel={t("ctaButton")}
      />
    </>
  );
}
