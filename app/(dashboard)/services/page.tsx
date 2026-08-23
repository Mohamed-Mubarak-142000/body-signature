import { backendFetch } from "@/lib/backend";

type Service = {
  id: string;
  slug: string;
  isBookable: boolean;
  durationMinutes: number;
  translations: { locale: string; title: string }[];
};

async function getServices(): Promise<Service[]> {
  const res = await backendFetch("/api/services");
  if (!res.ok) return [];
  return res.json();
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div>
      <h1 className="text-xl font-semibold">Services</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Live from the backend (GET /api/services). Create/edit UI isn&apos;t built yet.
      </p>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500">
            <th className="py-2 font-medium">Slug</th>
            <th className="py-2 font-medium">Title (en)</th>
            <th className="py-2 font-medium">Bookable</th>
            <th className="py-2 font-medium">Duration</th>
          </tr>
        </thead>
        <tbody>
          {services.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-neutral-400">
                No services yet.
              </td>
            </tr>
          )}
          {services.map((service) => (
            <tr key={service.id} className="border-b border-neutral-100">
              <td className="py-2">{service.slug}</td>
              <td className="py-2">
                {service.translations.find((t) => t.locale === "en")?.title ?? "—"}
              </td>
              <td className="py-2">{service.isBookable ? "Yes" : "No"}</td>
              <td className="py-2">{service.durationMinutes} min</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
