"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("nav");
  const brand = useTranslations("brand");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    { href: "/services", label: t("services") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header
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
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
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
              className="w-full border-none bg-[#1c1712] p-0 sm:max-w-sm"
            >
              <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
              <div className="flex h-full flex-col px-8 py-8">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xl text-gold-300">
                    {brand("name")}
                  </span>
                  <SheetClose
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#f3ecdf] hover:bg-white/10 hover:text-[#f3ecdf]"
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
                          className="text-lg font-medium text-[#f3ecdf]/90 transition-colors hover:text-gold-300"
                        />
                      }
                    >
                      {link.label}
                    </SheetClose>
                  ))}
                </nav>

                <LanguageSwitcher className="mt-auto border-white/15 text-[#f3ecdf] hover:bg-white/10" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
