import { serviceCategories, type ServiceCategoryMeta } from "@/content/services";

import { ServiceCard } from "./ServiceCard";

export function ServicesGrid({
  services = serviceCategories,
}: {
  services?: ServiceCategoryMeta[];
}) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.slug} service={service} />
      ))}
    </div>
  );
}
