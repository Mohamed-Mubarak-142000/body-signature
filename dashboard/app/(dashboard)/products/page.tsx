import { backendFetch } from "@/lib/backend";
import { ProductsClient, type CategoryOption, type Product } from "./products-client";

async function getProducts(): Promise<Product[]> {
  const res = await backendFetch("/api/products");
  if (!res.ok) return [];
  return res.json();
}

async function getCategories(): Promise<CategoryOption[]> {
  const res = await backendFetch("/api/categories");
  if (!res.ok) return [];
  return res.json();
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div>
      <h1 className="text-xl font-semibold">Products</h1>
      <p className="mt-1 mb-6 text-sm text-neutral-500">
        {categories.length === 0
          ? "Create a category first — products need one."
          : "Manage the product catalog."}
      </p>
      <ProductsClient products={products} categories={categories} />
    </div>
  );
}
