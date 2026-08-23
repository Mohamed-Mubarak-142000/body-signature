import { useTranslations } from "next-intl";
import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { serviceCategories } from "@/content/services";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-border/70 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-mark.svg" alt="" width={44} height={44} />
            <span className="font-heading text-lg text-foreground">
              {t("brand.name")}
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            {t("footer.tagline")}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            {t("footer.quickLinks")}
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/about" className="hover:text-foreground">
                {t("nav.about")}
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-foreground">
                {t("nav.services")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-foreground">
                {t("nav.contact")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            {t("footer.servicesLinks")}
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {serviceCategories.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="hover:text-foreground"
                >
                  {t(`services.categories.${service.slug}.title`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70 px-6 py-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} {t("brand.name")} — {t("footer.rights")}
      </div>
    </footer>
  );
}
