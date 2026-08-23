import { Clock, HeartHandshake, Languages, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

const icons = [Sparkles, Languages, HeartHandshake, Clock, Leaf, ShieldCheck];

export async function HighlightsBar() {
  const t = await getTranslations("home");
  const highlights = t.raw("highlights") as string[];
  const track = [...highlights, ...highlights];

  return (
    <section className="overflow-hidden bg-primary py-5">
      <div className="flex w-max animate-marquee">
        {track.map((highlight, index) => {
          const Icon = icons[index % icons.length];
          return (
            <div
              key={index}
              className="flex shrink-0 items-center gap-3 px-8 text-sm whitespace-nowrap text-primary-foreground"
            >
              <Icon className="size-5 shrink-0 text-primary-foreground" />
              <span>{highlight}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
