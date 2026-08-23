import { getTranslations } from "next-intl/server";

import { CTASection } from "@/components/sections/CTASection";
import { Hero } from "@/components/sections/Hero";
import { HighlightsBar } from "@/components/sections/HighlightsBar";
import { HomeIntro } from "@/components/sections/HomeIntro";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { aestheticMenServices, aestheticWomenServices } from "@/content/services";

export default async function HomePage() {
  const t = await getTranslations("home");
  const tServices = await getTranslations("services");

  return (
    <>
      <Hero />
      <HighlightsBar />
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

      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader
          eyebrow={tServices("aestheticWomenEyebrow")}
          title={tServices("aestheticWomenTitle")}
          subtitle={tServices("aestheticWomenSubtitle")}
          align="center"
          className="mb-14"
        />
        <ServicesGrid services={aestheticWomenServices} />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader
          eyebrow={tServices("aestheticMenEyebrow")}
          title={tServices("aestheticMenTitle")}
          subtitle={tServices("aestheticMenSubtitle")}
          align="center"
          className="mb-14"
        />
        <ServicesGrid services={aestheticMenServices} />
      </section>

      <CTASection
        title={t("ctaTitle")}
        body={t("ctaBody")}
        buttonLabel={t("ctaButton")}
      />
    </>
  );
}
