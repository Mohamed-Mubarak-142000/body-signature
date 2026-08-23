"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";

import { DataTable } from "@/components/data-table";
import { Modal } from "@/components/modal";
import { FormField, inputClass } from "@/components/form-field";
import { staffFormSchema, type StaffFormValues } from "@/lib/schemas";

export type StaffMember = {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "assistant";
  createdAt: string;
};

const emptyValues: StaffFormValues = { email: "", name: "", password: "", role: "assistant" };

export function TeamClient({ staff, currentUserId }: { staff: StaffMember[]; currentUserId: string }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: emptyValues,
  });

  function openCreate() {
    reset(emptyValues);
    setServerError(null);
    setModalOpen(true);
  }

  async function onSubmit(values: StaffFormValues) {
    setServerError(null);
    const res = await fetch("/api/backend/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      setServerError("Couldn't add this team member. Check the fields and try again.");
      return;
    }

    setModalOpen(false);
    router.refresh();
  }

  async function onDelete(member: StaffMember) {
    if (!confirm(`Remove ${member.email} from the team?`)) return;
    const res = await fetch(`/api/backend/staff/${member.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  const columns: LegacyColumnDef<StaffMember>[] = [
    { accessorKey: "email", header: "Email" },
    {
      id: "name",
      header: "Name",
      accessorFn: (row) => row.name ?? "—",
    },
    { accessorKey: "role", header: "Role" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.id === currentUserId ? (
          <span className="text-xs text-neutral-400">You</span>
        ) : (
          <button onClick={() => onDelete(row.original)} className="text-sm text-red-600 hover:text-red-800">
            Remove
          </button>
        ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-neutral-500">{staff.length} team members</p>
        <button
          onClick={openCreate}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          Add team member
        </button>
      </div>

      <DataTable columns={columns} data={staff} emptyMessage="No team members yet." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add team member">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email" error={errors.email?.message}>
            <input type="email" className={inputClass} {...register("email")} />
          </FormField>
          <FormField label="Name" error={errors.name?.message}>
            <input className={inputClass} {...register("name")} />
          </FormField>
          <FormField label="Password" error={errors.password?.message}>
            <input type="password" className={inputClass} {...register("password")} />
          </FormField>
          <FormField label="Role" error={errors.role?.message}>
            <select className={inputClass} {...register("role")}>
              <option value="assistant">Assistant</option>
              <option value="admin">Admin</option>
            </select>
          </FormField>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSubmitting ? "Adding…" : "Add"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
