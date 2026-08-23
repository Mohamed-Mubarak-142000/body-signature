import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { RevealImage } from "@/components/effects/RevealImage";
import { Link } from "@/i18n/navigation";
import type { ServiceCategoryMeta } from "@/content/services";

export function ServiceCard({ service }: { service: ServiceCategoryMeta }) {
  const t = useTranslations("services");
  const alt = useTranslations("imageAlt");

  return (
    <div className="h-full">
      <Link
        href={`/services/${service.slug}`}
        className="group flex h-full flex-col overflow-hidden border border-border/70 bg-card"
      >
        <div className="relative overflow-hidden">
          <RevealImage
            src={service.image}
            alt={alt(service.imageAltKey)}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="aspect-[4/5] shrink-0"
          />
          <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-background/70 py-4 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              {t("learnMore")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-heading text-xl text-foreground">
            {t(`categories.${service.slug}.title`)}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(`categories.${service.slug}.summary`)}
          </p>
          <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-gold-600">
            {t("learnMore")}
          </span>
        </div>
      </Link>
    </div>
  );
}
