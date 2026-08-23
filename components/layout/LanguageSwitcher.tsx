"use client";

import { ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const localeMeta: Record<string, { flag: string; label: string; code: string }> = {
  en: { flag: "/flags/gb.svg", label: "English", code: "EN" },
  ar: { flag: "/flags/eg.svg", label: "العربية", code: "AR" },
  nl: { flag: "/flags/nl.svg", label: "Nederlands", code: "NL" },
};

function Flag({ src }: { src: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- tiny static flag icon, next/image is overkill
  return <img src={src} alt="" aria-hidden="true" className="h-3 w-4 rounded-[2px] object-cover" />;
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const current = localeMeta[locale] ?? { flag: "", label: locale, code: locale.toUpperCase() };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1.5 rounded-md border border-border/70 px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted",
          className,
        )}
      >
        <Flag src={current.flag} />
        <span>{current.code}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((code) => {
          const meta = localeMeta[code] ?? { flag: "", label: code, code: code.toUpperCase() };
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => router.replace(pathname, { locale: code })}
              className={cn(
                "gap-2",
                code === locale && "bg-gold-300/30 text-foreground",
              )}
            >
              <Flag src={meta.flag} />
              <span>{meta.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
