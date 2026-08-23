"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";

import { DataTable } from "@/components/data-table";
import { Modal } from "@/components/modal";
import { FormField, inputClass } from "@/components/form-field";
import {
  LOCALES,
  serviceFormSchema,
  type ServiceFormInput,
  type ServiceFormOutput,
} from "@/lib/schemas";

type Translation = { locale: string; title: string; description?: string | null };
export type Service = {
  id: string;
  slug: string;
  isBookable: boolean;
  durationMinutes: number;
  translations: Translation[];
};

function toFormValues(service?: Service): ServiceFormInput {
  return {
    slug: service?.slug ?? "",
    isBookable: service?.isBookable ?? true,
    durationMinutes: service?.durationMinutes ?? 30,
    translations: LOCALES.map((locale) => {
      const existing = service?.translations.find((t) => t.locale === locale);
      return { locale, title: existing?.title ?? "", description: existing?.description ?? "" };
    }),
  };
}

export function ServicesClient({ services }: { services: Service[] }) {
  const router = useRouter();
  const [modalService, setModalService] = useState<Service | "new" | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormInput, unknown, ServiceFormOutput>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: toFormValues(),
  });

  function openCreate() {
    reset(toFormValues());
    setServerError(null);
    setModalService("new");
  }

  function openEdit(service: Service) {
    reset(toFormValues(service));
    setServerError(null);
    setModalService(service);
  }

  async function onSubmit(values: ServiceFormOutput) {
    setServerError(null);
    const isEdit = modalService !== "new" && modalService !== null;
    const url = isEdit ? `/api/backend/services/${modalService.id}` : "/api/backend/services";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      setServerError("Couldn't save the service. Check the fields and try again.");
      return;
    }

    setModalService(null);
    router.refresh();
  }

  async function onDelete(service: Service) {
    if (!confirm(`Delete service "${service.slug}"?`)) return;
    const res = await fetch(`/api/backend/services/${service.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  const columns: LegacyColumnDef<Service>[] = [
    { accessorKey: "slug", header: "Slug" },
    {
      id: "title",
      header: "Title (en)",
      accessorFn: (row) => row.translations.find((t) => t.locale === "en")?.title ?? "—",
    },
    {
      id: "bookable",
      header: "Bookable",
      accessorFn: (row) => (row.isBookable ? "Yes" : "No"),
    },
    {
      id: "duration",
      header: "Duration",
      accessorFn: (row) => `${row.durationMinutes} min`,
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
        <p className="text-sm text-neutral-500">{services.length} services</p>
        <button
          onClick={openCreate}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          Add service
        </button>
      </div>

      <DataTable columns={columns} data={services} emptyMessage="No services yet." />

      <Modal
        open={modalService !== null}
        onClose={() => setModalService(null)}
        title={modalService === "new" ? "Add service" : "Edit service"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Slug" error={errors.slug?.message}>
            <input className={inputClass} {...register("slug")} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Duration (minutes)" error={errors.durationMinutes?.message}>
              <input type="number" className={inputClass} {...register("durationMinutes")} />
            </FormField>
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input type="checkbox" {...register("isBookable")} />
              Bookable
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
                    placeholder="Title"
                    {...register(`translations.${index}.title`)}
                  />
                  {errors.translations?.[index]?.title && (
                    <p className="text-xs text-red-600">{errors.translations[index]?.title?.message}</p>
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
