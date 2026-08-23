import { backendFetch } from "@/lib/backend";
import { OrdersClient, type Order } from "./orders-client";

async function getOrders(): Promise<Order[]> {
  const res = await backendFetch("/api/orders");
  if (!res.ok) return [];
  return res.json();
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div>
      <h1 className="text-xl font-semibold">Orders</h1>
      <p className="mt-1 mb-6 text-sm text-neutral-500">
        Move an order through its lifecycle with the status dropdown.
      </p>
      <OrdersClient orders={orders} />
    </div>
  );
}
