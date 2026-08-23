"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ServicesMegaMenu } from "@/components/layout/ServicesMegaMenu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  aestheticMenServices,
  aestheticWomenServices,
  serviceCategories,
} from "@/content/services";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("nav");
  const tServices = useTranslations("services");
  const brand = useTranslations("brand");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    // Sync immediately after mount (e.g. a reload that restores scroll
    // position) — the server always renders `false`, so this must happen
    // client-side only, after hydration, rather than via a lazy initializer.
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
  ];

  const mobileServiceGroups = [
    { eyebrow: tServices("eyebrow"), services: serviceCategories },
    {
      eyebrow: tServices("aestheticWomenEyebrow"),
      services: aestheticWomenServices,
    },
    {
      eyebrow: tServices("aestheticMenEyebrow"),
      services: aestheticMenServices,
    },
  ];

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-30 bg-background transition-shadow",
        scrolled && "shadow-sm",
      )}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-mark.svg"
            alt={brand("name")}
            width={68}
            height={68}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("home")}
          </Link>
          <Link
            href="/about"
            className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("about")}
          </Link>
          <ServicesMegaMenu anchorRef={headerRef} />
          <Link
            href="/shop"
            className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("shop")}
          </Link>
          <Link
            href="/contact"
            className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("contact")}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="hidden text-base font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            {t("cart")}
          </Link>
          <Link
            href="/account"
            className="hidden text-base font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            {t("account")}
          </Link>
          <LanguageSwitcher className="hidden md:flex" />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label={t("menu")}
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              showCloseButton={false}
              className="w-full border-none bg-background p-0 sm:max-w-sm"
            >
              <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
              <div className="flex h-full flex-col px-8 py-8">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xl text-primary">
                    {brand("name")}
                  </span>
                  <SheetClose
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-foreground hover:bg-muted"
                        aria-label={t("menu")}
                      />
                    }
                  >
                    <X className="h-5 w-5" />
                  </SheetClose>
                </div>

                <nav className="mt-12 flex flex-col gap-8">
                  {links.map((link) => (
                    <SheetClose
                      key={link.href}
                      nativeButton={false}
                      render={
                        <Link
                          href={link.href}
                          className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                        />
                      }
                    >
                      {link.label}
                    </SheetClose>
                  ))}

                  <div>
                    <button
                      type="button"
                      onClick={() => setMobileServicesOpen((prev) => !prev)}
                      aria-expanded={mobileServicesOpen}
                      className="flex w-full items-center justify-between text-lg font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {t("services")}
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform duration-200",
                          mobileServicesOpen && "rotate-180",
                        )}
                      />
                    </button>

                    {mobileServicesOpen && (
                      <div className="mt-5 flex flex-col gap-5 ps-4">
                        {mobileServiceGroups.map((group) => (
                          <div key={group.eyebrow}>
                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-600">
                              {group.eyebrow}
                            </p>
                            <div className="mt-3 flex flex-col gap-3">
                              {group.services.map((service) => (
                                <SheetClose
                                  key={service.slug}
                                  nativeButton={false}
                                  render={
                                    <Link
                                      href={`/services/${service.slug}`}
                                      className="text-base font-medium text-muted-foreground transition-colors hover:text-primary"
                                    />
                                  }
                                >
                                  {tServices(`categories.${service.slug}.title`)}
                                </SheetClose>
                              ))}
                            </div>
                          </div>
                        ))}

                        <SheetClose
                          nativeButton={false}
                          render={
                            <Link
                              href="/services"
                              className="text-sm font-medium text-gold-600 transition-colors hover:text-gold-700"
                            />
                          }
                        >
                          {t("allServices")}
                        </SheetClose>
                      </div>
                    )}
                  </div>

                  <SheetClose
                    nativeButton={false}
                    render={
                      <Link
                        href="/shop"
                        className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                      />
                    }
                  >
                    {t("shop")}
                  </SheetClose>

                  <SheetClose
                    nativeButton={false}
                    render={
                      <Link
                        href="/contact"
                        className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                      />
                    }
                  >
                    {t("contact")}
                  </SheetClose>

                  <SheetClose
                    nativeButton={false}
                    render={
                      <Link
                        href="/cart"
                        className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                      />
                    }
                  >
                    {t("cart")}
                  </SheetClose>

                  <SheetClose
                    nativeButton={false}
                    render={
                      <Link
                        href="/account"
                        className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                      />
                    }
                  >
                    {t("account")}
                  </SheetClose>
                </nav>

                <LanguageSwitcher className="mt-auto" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
