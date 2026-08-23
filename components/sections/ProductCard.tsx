import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { productName, type Product } from "@/lib/shop-types";

export function ProductCard({ product }: { product: Product }) {
  const locale = useLocale();
  const t = useTranslations("shop");
  const image = product.images[0]?.url;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden border border-border/70 bg-card"
    >
      <div className="relative aspect-[4/5] shrink-0 overflow-hidden bg-gradient-to-br from-gold-200 to-gold-400">
        {image && (
          // Product photo URLs come from wherever staff pasted them (no
          // upload pipeline yet) — using a plain <img> avoids needing every
          // possible host allow-listed in next.config's image remotePatterns.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={productName(product, locale)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {product.stockQuantity <= 0 && (
          <span className="absolute top-3 rtl:right-3 ltr:left-3 bg-background/90 px-2 py-1 text-xs font-medium text-foreground">
            {t("outOfStock")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-lg text-foreground">{productName(product, locale)}</h3>
        <span className="mt-auto pt-4 text-sm font-medium text-gold-600">
          {Number(product.price).toFixed(2)}
        </span>
      </div>
    </Link>
  );
}
