import { backendFetch } from "@/lib/backend";

type Category = {
  id: string;
  slug: string;
  isActive: boolean;
  translations: { locale: string; name: string }[];
};

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
      <p className="mt-1 text-sm text-neutral-500">
        Live from the backend (GET /api/categories). Create/edit UI isn&apos;t built yet.
      </p>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500">
            <th className="py-2 font-medium">Slug</th>
            <th className="py-2 font-medium">Name (en)</th>
            <th className="py-2 font-medium">Active</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center text-neutral-400">
                No categories yet.
              </td>
            </tr>
          )}
          {categories.map((category) => (
            <tr key={category.id} className="border-b border-neutral-100">
              <td className="py-2">{category.slug}</td>
              <td className="py-2">
                {category.translations.find((t) => t.locale === "en")?.name ?? "—"}
              </td>
              <td className="py-2">{category.isActive ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
