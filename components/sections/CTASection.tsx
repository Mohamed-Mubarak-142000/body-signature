import { Reveal } from "@/components/effects/Reveal";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

interface CTASectionProps {
  title: string;
  body: string;
  buttonLabel: string;
}

export function CTASection({ title, body, buttonLabel }: CTASectionProps) {
  return (
    <section className="bg-secondary/40">
      <Reveal className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="font-heading text-3xl text-foreground md:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{body}</p>
        <div className="mt-8">
          <Button size="lg" nativeButton={false} render={<Link href="/contact" />}>
            {buttonLabel}
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
