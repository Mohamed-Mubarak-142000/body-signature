import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { ProductActions } from "@/components/sections/ProductActions";
import { backendFetch } from "@/lib/backend";
import { productDescription, productName, type Product } from "@/lib/shop-types";
import { Link } from "@/i18n/navigation";

async function getProduct(slug: string): Promise<Product | null> {
  const res = await backendFetch(`/api/products/slug/${slug}`);
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const product = await getProduct(slug);
  if (!product) return {};
  return { title: productName(product, locale) };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const t = await getTranslations("shop");
  const locale = await getLocale();
  const image = product.images[0]?.url;
  const inStock = product.stockQuantity > 0;

  return (
    <section className="mx-auto max-w-6xl px-6 pt-10 pb-20">
      <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground">
        ← {t("product.backToShop")}
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2 md:items-start">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gold-200 to-gold-400">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={productName(product, locale)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>

        <div>
          <h1 className="font-heading text-3xl text-foreground md:text-4xl">
            {productName(product, locale)}
          </h1>
          <p className="mt-3 text-xl font-medium text-gold-600">
            {Number(product.price).toFixed(2)}
          </p>
          {!inStock && <p className="mt-2 text-sm text-destructive">{t("outOfStock")}</p>}

          {productDescription(product, locale) && (
            <p className="mt-6 text-base text-muted-foreground">
              {productDescription(product, locale)}
            </p>
          )}

          <div className="mt-8">
            <ProductActions productId={product.id} inStock={inStock} />
          </div>
        </div>
      </div>
    </section>
  );
}
