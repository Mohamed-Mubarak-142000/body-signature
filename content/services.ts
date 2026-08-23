export type ServiceSlug =
  | "medical-healthcare"
  | "herbal-medicine"
  | "alternative-medicine"
  | "beauty"
  | "training-courses"
  | "facial-treatments-women"
  | "laser-hair-removal-women"
  | "peeling-skin-renewal-women"
  | "skin-brightening-women"
  | "beauty-grooming-women"
  | "laser-hair-removal-men"
  | "facial-cleansing-men"
  | "skin-care-men"
  | "grooming-men";

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

export const aestheticWomenServices: ServiceCategoryMeta[] = [
  {
    slug: "facial-treatments-women",
    image: "/images/service-facial-treatments-women-v2.png",
    imageAltKey: "facialTreatmentsWomen",
  },
  {
    slug: "laser-hair-removal-women",
    image: "/images/service-laser-hair-removal-women-v2.png",
    imageAltKey: "laserHairRemovalWomen",
  },
  {
    slug: "peeling-skin-renewal-women",
    image: "/images/service-peeling-skin-renewal-women-v2.png",
    imageAltKey: "peelingSkinRenewalWomen",
  },
  {
    slug: "skin-brightening-women",
    image: "/images/service-skin-brightening-women-v2.png",
    imageAltKey: "skinBrighteningWomen",
  },
  {
    slug: "beauty-grooming-women",
    image: "/images/service-beauty-grooming-women-v2.png",
    imageAltKey: "beautyGroomingWomen",
  },
];

export const aestheticMenServices: ServiceCategoryMeta[] = [
  {
    slug: "laser-hair-removal-men",
    image: "/images/service-laser-hair-removal-men-v2.png",
    imageAltKey: "laserHairRemovalMen",
  },
  {
    slug: "facial-cleansing-men",
    image: "/images/service-facial-cleansing-men-v2.png",
    imageAltKey: "facialCleansingMen",
  },
  {
    slug: "skin-care-men",
    image: "/images/service-skin-care-men-v2.png",
    imageAltKey: "skinCareMen",
  },
  {
    slug: "grooming-men",
    image: "/images/service-grooming-men-v2.png",
    imageAltKey: "groomingMen",
  },
];

export const allServices: ServiceCategoryMeta[] = [
  ...serviceCategories,
  ...aestheticWomenServices,
  ...aestheticMenServices,
];

export function getServiceMeta(slug: string) {
  return allServices.find((service) => service.slug === slug);
}
