import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { ProductCard } from "@/components/sections/ProductCard";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { backendFetch } from "@/lib/backend";
import { categoryName, type Category, type Product } from "@/lib/shop-types";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shop");
  return { title: t("title"), description: t("subtitle") };
}

async function getProducts(): Promise<Product[]> {
  const res = await backendFetch("/api/products");
  if (!res.ok) return [];
  return res.json();
}

async function getCategories(): Promise<Category[]> {
  const res = await backendFetch("/api/categories");
  if (!res.ok) return [];
  return res.json();
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const t = await getTranslations("shop");
  const locale = await getLocale();
  const { category: activeCategory } = await searchParams;

  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const filtered = activeCategory
    ? products.filter((product) => product.category?.slug === activeCategory)
    : products;

  return (
    <section className="mx-auto max-w-6xl px-6 pt-10 pb-20">
      <SectionHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} className="mb-10" />

      {categories.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          <Link
            href="/shop"
            className={cn(
              "border px-4 py-1.5 text-sm font-medium transition-colors",
              !activeCategory
                ? "border-gold-500 bg-gold-100 text-gold-700"
                : "border-border/70 text-muted-foreground hover:text-foreground",
            )}
          >
            {t("allCategories")}
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className={cn(
                "border px-4 py-1.5 text-sm font-medium transition-colors",
                activeCategory === category.slug
                  ? "border-gold-500 bg-gold-100 text-gold-700"
                  : "border-border/70 text-muted-foreground hover:text-foreground",
              )}
            >
              {categoryName(category, locale)}
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
