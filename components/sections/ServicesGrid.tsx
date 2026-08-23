import { serviceCategories } from "@/content/services";

import { ServiceCard } from "./ServiceCard";

export function ServicesGrid() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {serviceCategories.map((service) => (
        <ServiceCard key={service.slug} service={service} />
      ))}
    </div>
  );
}
