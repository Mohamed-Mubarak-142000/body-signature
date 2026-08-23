export type ProductTranslation = { locale: string; name: string; description?: string | null };
export type ProductImage = { url: string; sortOrder: number };
export type ProductVariant = { id: string; attribute: string; value: string; priceModifier: string | number };
export type Product = {
  id: string;
  slug: string;
  sku: string;
  price: string | number;
  stockQuantity: number;
  isActive: boolean;
  categoryId: string;
  category?: { id: string; slug: string; translations: { locale: string; name: string }[] };
  translations: ProductTranslation[];
  images: ProductImage[];
  variants: ProductVariant[];
};

export type CategoryTranslation = { locale: string; name: string };
export type Category = {
  id: string;
  slug: string;
  translations: CategoryTranslation[];
};

export function productName(product: Pick<Product, "translations">, locale: string): string {
  return (
    product.translations.find((t) => t.locale === locale)?.name ??
    product.translations.find((t) => t.locale === "en")?.name ??
    ""
  );
}

export function productDescription(
  product: Pick<Product, "translations">,
  locale: string,
): string {
  return (
    product.translations.find((t) => t.locale === locale)?.description ??
    product.translations.find((t) => t.locale === "en")?.description ??
    ""
  );
}

export function categoryName(category: Pick<Category, "translations">, locale: string): string {
  return (
    category.translations.find((t) => t.locale === locale)?.name ??
    category.translations.find((t) => t.locale === "en")?.name ??
    ""
  );
}
