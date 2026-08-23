import { Reveal } from "@/components/effects/Reveal";
import { WaveDivider } from "@/components/layout/WaveDivider";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

interface CTASectionProps {
  title: string;
  body: string;
  buttonLabel: string;
}

export function CTASection({ title, body, buttonLabel }: CTASectionProps) {
  return (
    <>
      <WaveDivider color="secondary" flip />
      <section className="bg-secondary/40">
        <Reveal className="mx-auto max-w-3xl px-6 pt-0 pb-8 text-center">
          <h2 className="font-heading text-3xl text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-2 max-w-none text-muted-foreground md:whitespace-nowrap">
            {body}
          </p>
          <div className="mt-4">
            <Button
              size="lg"
              className="h-12 px-6 text-base"
              nativeButton={false}
              render={<Link href="/contact" />}
            >
              {buttonLabel}
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
