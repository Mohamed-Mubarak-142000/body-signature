import { getTranslations } from "next-intl/server";

import { Reveal } from "@/components/effects/Reveal";
import { RevealImage } from "@/components/effects/RevealImage";

export async function HomeIntro() {
  const t = await getTranslations("home");
  const alt = await getTranslations("imageAlt");

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2">
      <RevealImage
        src="/images/about-1-v2.png"
        alt={alt("about1")}
        className="aspect-4/3 rounded-2xl"
      />
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-600">
          {t("introEyebrow")}
        </p>
        <h2 className="mt-3 font-heading text-4xl text-foreground md:text-5xl">
          {t("introTitle")}
        </h2>
        <p className="mt-5 text-base text-muted-foreground">
          {t("introBody")}
        </p>
      </Reveal>
    </section>
  );
}
