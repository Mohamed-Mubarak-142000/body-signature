"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";

import { DataTable } from "@/components/data-table";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;

export type Order = {
  id: string;
  orderNumber: string;
  status: (typeof STATUSES)[number];
  totalAmount: string | number;
  paymentMethod: string;
  createdAt: string;
  user: { name: string | null; email: string };
  items: { id: string }[];
};

function StatusSelect({ order }: { order: Order }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  async function onChange(status: string) {
    setUpdating(true);
    const res = await fetch(`/api/backend/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(false);
    if (res.ok) router.refresh();
  }

  return (
    <select
      defaultValue={order.status}
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

export function OrdersClient({ orders }: { orders: Order[] }) {
  const columns: LegacyColumnDef<Order>[] = [
    { accessorKey: "orderNumber", header: "Order #" },
    {
      id: "customer",
      header: "Customer",
      accessorFn: (row) => row.user.name ?? row.user.email,
    },
    { accessorKey: "totalAmount", header: "Total" },
    {
      id: "items",
      header: "Items",
      accessorFn: (row) => row.items.length,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusSelect order={row.original} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      emptyMessage="No orders yet — this fills in once customer checkout is built (BACKEND_PRD.md §4.8)."
    />
  );
}
