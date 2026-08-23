import { backendFetch } from "@/lib/backend";
import { ContentClient, type Page } from "./content-client";

async function getPages(): Promise<Page[]> {
  const res = await backendFetch("/api/pages");
  if (!res.ok) return [];
  return res.json();
}

export default async function ContentPage() {
  const pages = await getPages();

  return (
    <div>
      <h1 className="text-xl font-semibold">Content</h1>
      <p className="mt-1 mb-6 text-sm text-neutral-500">
        Site copy per page, in all three languages.
      </p>
      <ContentClient pages={pages} />
    </div>
  );
}
