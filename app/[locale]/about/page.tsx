import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RevealImage } from "@/components/effects/RevealImage";
import { AboutPillars } from "@/components/sections/AboutPillars";
import { CTASection } from "@/components/sections/CTASection";
import { SectionHeader } from "@/components/sections/SectionHeader";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return { title: t("title"), description: t("intro") };
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const home = await getTranslations("home");
  const alt = await getTranslations("imageAlt");

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:items-center">
          <p className="text-lg text-muted-foreground">{t("intro")}</p>
          <div className="grid grid-cols-2 gap-4">
            <RevealImage
              src="/images/about-1-v2.png"
              alt={alt("about1")}
              className="aspect-[3/4] rounded-2xl"
            />
            <RevealImage
              src="/images/about-2-v2.png"
              alt={alt("about2")}
              className="mt-8 aspect-[3/4] rounded-2xl"
            />
          </div>
        </div>
      </section>

      <AboutPillars />

      <CTASection
        title={home("ctaTitle")}
        body={home("ctaBody")}
        buttonLabel={home("ctaButton")}
      />
    </>
  );
}
