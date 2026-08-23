import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { RevealImage } from "@/components/effects/RevealImage";
import { Reveal } from "@/components/effects/Reveal";
import { Button } from "@/components/ui/button";
import { getServiceMeta, serviceCategories } from "@/content/services";
import { Link } from "@/i18n/navigation";

export function generateStaticParams() {
  return serviceCategories.map((service) => ({ slug: service.slug }));
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
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <Link
            href="/services"
            className="text-sm font-medium text-gold-600 hover:underline"
          >
            &larr; {t("backToServices")}
          </Link>
        </Reveal>

        <div className="mt-8 grid gap-10 md:grid-cols-2 md:items-center">
          <Reveal>
            <h1 className="font-heading text-3xl text-foreground md:text-4xl">
              {t(`categories.${service.slug}.title`)}
            </h1>
            <p className="mt-5 text-muted-foreground">
              {t(`categories.${service.slug}.description`)}
            </p>

            <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-foreground">
              {t("featuresTitle")}
            </h2>
            <ul className="mt-4 space-y-3">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
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
            className="aspect-[4/5] rounded-2xl"
            priority
          />
        </div>
      </section>

      <section className="bg-secondary/40">
        <Reveal className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h2 className="font-heading text-2xl text-foreground md:text-3xl">
            {t("detailCtaTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            {t("detailCtaBody")}
          </p>
          <div className="mt-6">
            <Button size="lg" nativeButton={false} render={<Link href="/contact" />}>
              {t("detailCtaButton")}
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
