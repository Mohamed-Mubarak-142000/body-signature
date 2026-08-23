import { backendFetch } from "@/lib/backend";
import { ServicesClient, type Service } from "./services-client";

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
      <p className="mt-1 mb-6 text-sm text-neutral-500">Bookable service categories.</p>
      <ServicesClient services={services} />
    </div>
  );
}
