"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";

import { DataTable } from "@/components/data-table";
import { Modal } from "@/components/modal";
import { FormField, inputClass } from "@/components/form-field";
import {
  LOCALES,
  productFormSchema,
  type ProductFormInput,
  type ProductFormOutput,
} from "@/lib/schemas";

type Translation = { locale: string; name: string; description?: string | null };
export type Product = {
  id: string;
  sku: string;
  price: string | number;
  stockQuantity: number;
  isActive: boolean;
  categoryId: string;
  category?: { slug: string };
  translations: Translation[];
  images: { url: string }[];
};
export type CategoryOption = { id: string; slug: string };

function toFormValues(product?: Product, defaultCategoryId?: string): ProductFormInput {
  return {
    categoryId: product?.categoryId ?? defaultCategoryId ?? "",
    sku: product?.sku ?? "",
    price: Number(product?.price ?? 0),
    stockQuantity: product?.stockQuantity ?? 0,
    isActive: product?.isActive ?? true,
    translations: LOCALES.map((locale) => {
      const existing = product?.translations.find((t) => t.locale === locale);
      return { locale, name: existing?.name ?? "", description: existing?.description ?? "" };
    }),
    images: product?.images.map((img) => ({ url: img.url })) ?? [],
  };
}

export function ProductsClient({
  products,
  categories,
}: {
  products: Product[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [modalProduct, setModalProduct] = useState<Product | "new" | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: toFormValues(undefined, categories[0]?.id),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "images" });

  function openCreate() {
    reset(toFormValues(undefined, categories[0]?.id));
    setServerError(null);
    setModalProduct("new");
  }

  function openEdit(product: Product) {
    reset(toFormValues(product));
    setServerError(null);
    setModalProduct(product);
  }

  async function onSubmit(values: ProductFormOutput) {
    setServerError(null);
    const isEdit = modalProduct !== "new" && modalProduct !== null;
    const url = isEdit ? `/api/backend/products/${modalProduct.id}` : "/api/backend/products";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      setServerError("Couldn't save the product. Check the fields and try again.");
      return;
    }

    setModalProduct(null);
    router.refresh();
  }

  async function onDelete(product: Product) {
    if (!confirm(`Delete product "${product.sku}"?`)) return;
    const res = await fetch(`/api/backend/products/${product.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  const columns: LegacyColumnDef<Product>[] = [
    { accessorKey: "sku", header: "SKU" },
    {
      id: "name",
      header: "Name (en)",
      accessorFn: (row) => row.translations.find((t) => t.locale === "en")?.name ?? "—",
    },
    { accessorKey: "price", header: "Price" },
    { accessorKey: "stockQuantity", header: "Stock" },
    {
      id: "active",
      header: "Active",
      accessorFn: (row) => (row.isActive ? "Yes" : "No"),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-3 text-sm">
          <button onClick={() => openEdit(row.original)} className="text-neutral-600 hover:text-neutral-900">
            Edit
          </button>
          <button onClick={() => onDelete(row.original)} className="text-red-600 hover:text-red-800">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-neutral-500">{products.length} products</p>
        <button
          onClick={openCreate}
          disabled={categories.length === 0}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          title={categories.length === 0 ? "Create a category first" : undefined}
        >
          Add product
        </button>
      </div>

      <DataTable columns={columns} data={products} emptyMessage="No products yet." />

      <Modal
        open={modalProduct !== null}
        onClose={() => setModalProduct(null)}
        title={modalProduct === "new" ? "Add product" : "Edit product"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Category" error={errors.categoryId?.message}>
            <select className={inputClass} {...register("categoryId")}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.slug}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="SKU" error={errors.sku?.message}>
              <input className={inputClass} {...register("sku")} />
            </FormField>
            <FormField label="Price" error={errors.price?.message}>
              <input type="number" step="0.01" className={inputClass} {...register("price")} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Stock quantity" error={errors.stockQuantity?.message}>
              <input type="number" className={inputClass} {...register("stockQuantity")} />
            </FormField>
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input type="checkbox" {...register("isActive")} />
              Active
            </label>
          </div>

          <div className="space-y-3 border-t border-neutral-200 pt-3">
            <p className="text-sm font-medium">Translations</p>
            {LOCALES.map((locale, index) => (
              <div key={locale} className="grid grid-cols-[3rem_1fr] items-start gap-2">
                <span className="pt-2 text-xs uppercase text-neutral-400">{locale}</span>
                <div className="space-y-2">
                  <input
                    className={inputClass}
                    placeholder="Name"
                    {...register(`translations.${index}.name`)}
                  />
                  {errors.translations?.[index]?.name && (
                    <p className="text-xs text-red-600">{errors.translations[index]?.name?.message}</p>
                  )}
                  <textarea
                    className={inputClass}
                    rows={2}
                    placeholder="Description (optional)"
                    {...register(`translations.${index}.description`)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-neutral-200 pt-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Images</p>
              <button
                type="button"
                onClick={() => append({ url: "" })}
                className="text-xs text-neutral-600 hover:text-neutral-900"
              >
                + Add image
              </button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder="https://…"
                  {...register(`images.${index}.url`)}
                />
                <button type="button" onClick={() => remove(index)} className="text-xs text-red-600">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-400">
            Variants (size/color) aren&apos;t editable from here yet — the backend supports them, this
            form doesn&apos;t expose them.
          </p>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : "Save"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
