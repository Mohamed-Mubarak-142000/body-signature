import { backendFetch } from "@/lib/backend";
import { CategoriesClient, type Category } from "./categories-client";

async function getCategories(): Promise<Category[]> {
  const res = await backendFetch("/api/categories");
  if (!res.ok) return [];
  return res.json();
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="text-xl font-semibold">Categories</h1>
      <p className="mt-1 mb-6 text-sm text-neutral-500">
        Product categories, with optional subcategories.
      </p>
      <CategoriesClient categories={categories} />
    </div>
  );
}
