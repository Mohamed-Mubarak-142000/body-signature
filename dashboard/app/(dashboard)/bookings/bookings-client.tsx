"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";

import { DataTable } from "@/components/data-table";

const STATUSES = ["pending", "confirmed", "rejected", "rescheduled", "cancelled"] as const;

export type Booking = {
  id: string;
  status: (typeof STATUSES)[number];
  requestedAt: string;
  user: { name: string | null; email: string };
  service: { translations: { locale: string; title: string }[] };
};

function StatusSelect({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  async function onChange(status: string) {
    setUpdating(true);
    const res = await fetch(`/api/backend/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(false);
    if (res.ok) router.refresh();
  }

  return (
    <select
      defaultValue={booking.status}
      disabled={updating}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-neutral-300 px-2 py-1 text-sm disabled:opacity-50"
    >
      {STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}

export function BookingsClient({ bookings }: { bookings: Booking[] }) {
  const columns: LegacyColumnDef<Booking>[] = [
    {
      id: "service",
      header: "Service",
      accessorFn: (row) => row.service.translations.find((t) => t.locale === "en")?.title ?? "—",
    },
    {
      id: "customer",
      header: "Customer",
      accessorFn: (row) => row.user.name ?? row.user.email,
    },
    {
      id: "requestedAt",
      header: "Requested",
      accessorFn: (row) => new Date(row.requestedAt).toLocaleString(),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusSelect booking={row.original} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={bookings}
      emptyMessage="No bookings yet — this fills in once customer login is built (BACKEND_PRD.md §4.1)."
    />
  );
}
