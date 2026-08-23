"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import type { RefObject } from "react";

import { Link } from "@/i18n/navigation";
import {
  aestheticMenServices,
  aestheticWomenServices,
  serviceCategories,
  type ServiceCategoryMeta,
} from "@/content/services";

function ServiceLinksColumn({
  eyebrow,
  services,
  onTitle,
}: {
  eyebrow: string;
  services: ServiceCategoryMeta[];
  onTitle: (slug: string) => string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-600">
        {eyebrow}
      </p>
      <ul className="mt-4 space-y-3">
        {services.map((service) => (
          <li key={service.slug}>
            <MenuPrimitive.LinkItem
              closeOnClick
              render={<Link href={`/services/${service.slug}`} />}
              className="block rounded-md text-sm font-medium text-foreground outline-hidden transition-colors hover:text-gold-600 data-highlighted:text-gold-600"
            >
              {onTitle(service.slug)}
            </MenuPrimitive.LinkItem>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ServicesMegaMenu({
  anchorRef,
}: {
  anchorRef: RefObject<HTMLElement | null>;
}) {
  const t = useTranslations("nav");
  const tServices = useTranslations("services");

  return (
    <MenuPrimitive.Root>
      <MenuPrimitive.Trigger
        openOnHover
        delay={80}
        closeDelay={100}
        className="group flex items-center gap-1 text-base font-medium text-muted-foreground outline-hidden transition-colors hover:text-foreground data-popup-open:text-foreground"
      >
        {t("services")}
        <ChevronDown className="size-4 transition-transform duration-200 group-data-popup-open:rotate-180" />
      </MenuPrimitive.Trigger>
      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner
          className="isolate z-50 outline-none"
          anchor={anchorRef}
          align="start"
          side="bottom"
          sideOffset={0}
        >
          <MenuPrimitive.Popup className="w-(--anchor-width) origin-(--transform-origin) bg-background text-foreground shadow-[0_12px_16px_-12px_rgba(0,0,0,0.18)] outline-none duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <div className="mx-auto max-w-6xl px-6 py-10">
              <div className="grid grid-cols-3 gap-8">
                <ServiceLinksColumn
                  eyebrow={tServices("eyebrow")}
                  services={serviceCategories}
                  onTitle={(slug) => tServices(`categories.${slug}.title`)}
                />
                <ServiceLinksColumn
                  eyebrow={tServices("aestheticWomenEyebrow")}
                  services={aestheticWomenServices}
                  onTitle={(slug) => tServices(`categories.${slug}.title`)}
                />
                <ServiceLinksColumn
                  eyebrow={tServices("aestheticMenEyebrow")}
                  services={aestheticMenServices}
                  onTitle={(slug) => tServices(`categories.${slug}.title`)}
                />
              </div>

              <div className="mt-8 border-t border-border/70 pt-6">
                <MenuPrimitive.LinkItem
                  closeOnClick
                  render={<Link href="/services" />}
                  className="inline-flex items-center gap-1 text-sm font-medium text-gold-600 outline-hidden transition-colors hover:text-gold-700 data-highlighted:text-gold-700"
                >
                  {t("allServices")}
                </MenuPrimitive.LinkItem>
              </div>
            </div>
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  );
}
