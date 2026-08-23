"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";

import { DataTable } from "@/components/data-table";
import { Modal } from "@/components/modal";
import { FormField, inputClass } from "@/components/form-field";
import { LOCALES, pageFormSchema, type PageFormValues } from "@/lib/schemas";

type Translation = {
  locale: string;
  content: { title: string; body: string };
  seoTitle?: string | null;
  seoDescription?: string | null;
};
export type Page = {
  id: string;
  slug: string;
  translations: Translation[];
};

function toFormValues(page?: Page): PageFormValues {
  return {
    slug: page?.slug ?? "",
    translations: LOCALES.map((locale) => {
      const existing = page?.translations.find((t) => t.locale === locale);
      return {
        locale,
        content: {
          title: existing?.content?.title ?? "",
          body: existing?.content?.body ?? "",
        },
        seoTitle: existing?.seoTitle ?? "",
        seoDescription: existing?.seoDescription ?? "",
      };
    }),
  };
}

export function ContentClient({ pages }: { pages: Page[] }) {
  const router = useRouter();
  const [modalPage, setModalPage] = useState<Page | "new" | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: toFormValues(),
  });

  function openCreate() {
    reset(toFormValues());
    setServerError(null);
    setModalPage("new");
  }

  function openEdit(page: Page) {
    reset(toFormValues(page));
    setServerError(null);
    setModalPage(page);
  }

  async function onSubmit(values: PageFormValues) {
    setServerError(null);
    const isEdit = modalPage !== "new" && modalPage !== null;

    const res = isEdit
      ? await fetch(`/api/backend/pages/${modalPage.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ translations: values.translations }),
        })
      : await fetch("/api/backend/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

    if (!res.ok) {
      setServerError("Couldn't save the page. Check the fields and try again.");
      return;
    }

    setModalPage(null);
    router.refresh();
  }

  async function onDelete(page: Page) {
    if (!confirm(`Delete page "${page.slug}"?`)) return;
    const res = await fetch(`/api/backend/pages/${page.slug}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  const columns: LegacyColumnDef<Page>[] = [
    { accessorKey: "slug", header: "Slug" },
    {
      id: "title",
      header: "Title (en)",
      accessorFn: (row) => row.translations.find((t) => t.locale === "en")?.content?.title ?? "—",
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
        <p className="text-sm text-neutral-500">{pages.length} pages</p>
        <button
          onClick={openCreate}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          Add page
        </button>
      </div>

      <DataTable columns={columns} data={pages} emptyMessage="No pages yet." />

      <Modal
        open={modalPage !== null}
        onClose={() => setModalPage(null)}
        title={modalPage === "new" ? "Add page" : "Edit page"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Slug" error={errors.slug?.message}>
            <input className={inputClass} disabled={modalPage !== "new"} {...register("slug")} />
          </FormField>

          <div className="space-y-4 border-t border-neutral-200 pt-3">
            {LOCALES.map((locale, index) => (
              <div key={locale} className="space-y-2 rounded-md border border-neutral-200 p-3">
                <p className="text-xs font-medium uppercase text-neutral-400">{locale}</p>
                <input
                  className={inputClass}
                  placeholder="Title"
                  {...register(`translations.${index}.content.title`)}
                />
                {errors.translations?.[index]?.content?.title && (
                  <p className="text-xs text-red-600">
                    {errors.translations[index]?.content?.title?.message}
                  </p>
                )}
                <textarea
                  className={inputClass}
                  rows={4}
                  placeholder="Body"
                  {...register(`translations.${index}.content.body`)}
                />
                <input
                  className={inputClass}
                  placeholder="SEO title (optional)"
                  {...register(`translations.${index}.seoTitle`)}
                />
                <input
                  className={inputClass}
                  placeholder="SEO description (optional)"
                  {...register(`translations.${index}.seoDescription`)}
                />
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
