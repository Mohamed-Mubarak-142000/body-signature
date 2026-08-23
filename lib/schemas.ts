import { z } from "zod";

// Mirrors the backend's zod schemas (zefaaf-body-signature-backend/app/api/**)
// — keep these in sync manually since the two apps don't share a package.
export const LOCALES = ["ar", "en", "nl"] as const;
export const localeEnum = z.enum(LOCALES);

export const categoryFormSchema = z.object({
  slug: z.string().min(1, "Required"),
  imageUrl: z.union([z.string().url("Must be a valid URL"), z.literal("")]).optional(),
  isActive: z.boolean(),
  translations: z
    .array(
      z.object({
        locale: localeEnum,
        name: z.string().min(1, "Required"),
        description: z.string().optional(),
      }),
    )
    .length(3),
});
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const productFormSchema = z.object({
  categoryId: z.string().min(1, "Required"),
  sku: z.string().min(1, "Required"),
  slug: z.string().min(1, "Required"),
  price: z.coerce.number().nonnegative(),
  stockQuantity: z.coerce.number().int().nonnegative(),
  isActive: z.boolean(),
  translations: z
    .array(
      z.object({
        locale: localeEnum,
        name: z.string().min(1, "Required"),
        description: z.string().optional(),
      }),
    )
    .length(3),
  images: z.array(z.object({ url: z.string().url("Must be a valid URL") })),
});
// `price`/`stockQuantity` use z.coerce, so the input shape (what the form
// holds while typing) and output shape (what's sent on submit) differ —
// see the useForm<Input, any, Output> generics in products-client.tsx.
export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormOutput = z.output<typeof productFormSchema>;

export const serviceFormSchema = z.object({
  slug: z.string().min(1, "Required"),
  isBookable: z.boolean(),
  durationMinutes: z.coerce.number().int().positive(),
  translations: z
    .array(
      z.object({
        locale: localeEnum,
        title: z.string().min(1, "Required"),
        description: z.string().optional(),
      }),
    )
    .length(3),
});
// Same input/output split as ProductForm — durationMinutes uses z.coerce.
export type ServiceFormInput = z.input<typeof serviceFormSchema>;
export type ServiceFormOutput = z.output<typeof serviceFormSchema>;

export const pageFormSchema = z.object({
  slug: z.string().min(1, "Required"),
  translations: z
    .array(
      z.object({
        locale: localeEnum,
        content: z.object({
          title: z.string().min(1, "Required"),
          body: z.string(),
        }),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
      }),
    )
    .length(3),
});
export type PageFormValues = z.infer<typeof pageFormSchema>;

export const staffFormSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, "Required"),
  password: z.string().min(8, "At least 8 characters"),
  role: z.enum(["admin", "assistant"]),
});
export type StaffFormValues = z.infer<typeof staffFormSchema>;

export function emptyTranslations<T extends Record<string, unknown>>(
  shape: (locale: (typeof LOCALES)[number]) => T,
) {
  return LOCALES.map((locale) => shape(locale));
}
