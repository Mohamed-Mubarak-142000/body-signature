"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";

import { DataTable } from "@/components/data-table";
import { Modal } from "@/components/modal";
import { FormField, inputClass } from "@/components/form-field";
import { LOCALES, categoryFormSchema, type CategoryFormValues } from "@/lib/schemas";

type Translation = { locale: string; name: string; description?: string | null };
export type Category = {
  id: string;
  slug: string;
  imageUrl: string | null;
  isActive: boolean;
  parentId: string | null;
  translations: Translation[];
};

function toFormValues(category?: Category): CategoryFormValues {
  return {
    slug: category?.slug ?? "",
    imageUrl: category?.imageUrl ?? "",
    isActive: category?.isActive ?? true,
    translations: LOCALES.map((locale) => {
      const existing = category?.translations.find((t) => t.locale === locale);
      return { locale, name: existing?.name ?? "", description: existing?.description ?? "" };
    }),
  };
}

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [modalCategory, setModalCategory] = useState<Category | "new" | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: toFormValues(),
  });

  function openCreate() {
    reset(toFormValues());
    setServerError(null);
    setModalCategory("new");
  }

  function openEdit(category: Category) {
    reset(toFormValues(category));
    setServerError(null);
    setModalCategory(category);
  }

  async function onSubmit(values: CategoryFormValues) {
    setServerError(null);
    const isEdit = modalCategory !== "new" && modalCategory !== null;
    const url = isEdit ? `/api/backend/categories/${modalCategory.id}` : "/api/backend/categories";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      setServerError("Couldn't save the category. Check the fields and try again.");
      return;
    }

    setModalCategory(null);
    router.refresh();
  }

  async function onDelete(category: Category) {
    if (!confirm(`Delete category "${category.slug}"?`)) return;
    const res = await fetch(`/api/backend/categories/${category.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  const columns: LegacyColumnDef<Category>[] = [
    { accessorKey: "slug", header: "Slug" },
    {
      id: "name",
      header: "Name (en)",
      accessorFn: (row) => row.translations.find((t) => t.locale === "en")?.name ?? "—",
    },
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
        <p className="text-sm text-neutral-500">{categories.length} categories</p>
        <button
          onClick={openCreate}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          Add category
        </button>
      </div>

      <DataTable columns={columns} data={categories} emptyMessage="No categories yet." />

      <Modal
        open={modalCategory !== null}
        onClose={() => setModalCategory(null)}
        title={modalCategory === "new" ? "Add category" : "Edit category"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Slug" error={errors.slug?.message}>
            <input className={inputClass} {...register("slug")} />
          </FormField>

          <FormField label="Image URL" error={errors.imageUrl?.message}>
            <input className={inputClass} {...register("imageUrl")} />
          </FormField>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isActive")} />
            Active
          </label>

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
