import { getTranslations } from "next-intl/server";

import { Reveal } from "@/components/effects/Reveal";

export async function AboutPillars() {
  const t = await getTranslations("about");
  const pillars = t.raw("pillars") as { title: string; body: string }[];

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-heading text-2xl text-foreground md:text-3xl">
        {t("pillarsTitle")}
      </h2>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {pillars.map((pillar, index) => (
          <Reveal
            key={pillar.title}
            delay={index * 0.1}
            className="rounded-2xl border border-border/70 bg-card p-8"
          >
            <span className="font-heading text-3xl text-gold-500">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {pillar.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {pillar.body}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
