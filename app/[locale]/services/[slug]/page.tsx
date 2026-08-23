import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/effects/Reveal";
import { RevealImage } from "@/components/effects/RevealImage";
import { CTASection } from "@/components/sections/CTASection";
import { allServices, getServiceMeta } from "@/content/services";

export function generateStaticParams() {
  return allServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceMeta(slug);
  if (!service) return {};

  const t = await getTranslations("services");
  return {
    title: t(`categories.${service.slug}.title`),
    description: t(`categories.${service.slug}.summary`),
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceMeta(slug);
  if (!service) notFound();

  const t = await getTranslations("services");
  const alt = await getTranslations("imageAlt");
  const features = t.raw(`categories.${service.slug}.features`) as string[];

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <Reveal>
            <h1 className="font-heading text-4xl text-foreground md:text-5xl">
              {t(`categories.${service.slug}.title`)}
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              {t(`categories.${service.slug}.description`)}
            </p>

            <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-foreground">
              {t("featuresTitle")}
            </h2>
            <ul className="mt-4 space-y-3">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-base text-muted-foreground"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </Reveal>

          <RevealImage
            src={service.image}
            alt={alt(service.imageAltKey)}
            className="aspect-4/3 rounded-2xl"
            objectPosition="object-top"
            priority
          />
        </div>
      </section>

      <CTASection
        title={t("detailCtaTitle")}
        body={t("detailCtaBody")}
        buttonLabel={t("detailCtaButton")}
      />
    </>
  );
}
