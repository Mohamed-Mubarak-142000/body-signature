export type ServiceSlug =
  | "medical-healthcare"
  | "herbal-medicine"
  | "alternative-medicine"
  | "beauty"
  | "training-courses";

export interface ServiceCategoryMeta {
  slug: ServiceSlug;
  image: string;
  imageAltKey: string;
}

export const serviceCategories: ServiceCategoryMeta[] = [
  {
    slug: "medical-healthcare",
    image: "/images/service-medical-healthcare-v2.png",
    imageAltKey: "medicalHealthcare",
  },
  {
    slug: "herbal-medicine",
    image: "/images/service-herbal-medicine-v2.png",
    imageAltKey: "herbalMedicine",
  },
  {
    slug: "alternative-medicine",
    image: "/images/service-alternative-medicine-v2.png",
    imageAltKey: "alternativeMedicine",
  },
  {
    slug: "beauty",
    image: "/images/service-beauty-v2.png",
    imageAltKey: "beauty",
  },
  {
    slug: "training-courses",
    image: "/images/service-training-courses-v2.png",
    imageAltKey: "trainingCourses",
  },
];

export function getServiceMeta(slug: string) {
  return serviceCategories.find((service) => service.slug === slug);
}
