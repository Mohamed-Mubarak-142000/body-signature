"use client";

import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { RevealImage } from "@/components/effects/RevealImage";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";

export function Hero() {
  const t = useTranslations("hero");
  const alt = useTranslations("imageAlt");

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-10 pb-6 md:grid-cols-2 md:pt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-transparent bg-primary/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary"
          >
            <BadgeCheck
              className="size-4.5"
              fill="currentColor"
              stroke="#f8e9d4"
            />
            {t("eyebrow")}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mt-4 font-heading text-4xl leading-tight text-foreground md:text-5xl"
          >
            {t("title")}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-md text-base text-muted-foreground md:text-lg"
          >
            {t("subtitle")}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
            <Button
              size="lg"
              className="h-12 px-6 text-base"
              nativeButton={false}
              render={<Link href="/services" />}
            >
              {t("ctaPrimary")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-6 text-base"
              nativeButton={false}
              render={<Link href="/contact" />}
            >
              {t("ctaSecondary")}
            </Button>
          </motion.div>
        </motion.div>

        <RevealImage
          src="/images/hero-v2.png"
          alt={alt("hero")}
          priority
          className="aspect-[4/3] w-full rounded-2xl"
        />
      </div>
    </section>
  );
}
