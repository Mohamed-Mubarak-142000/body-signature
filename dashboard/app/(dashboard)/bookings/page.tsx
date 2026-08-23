import { backendFetch } from "@/lib/backend";
import { BookingsClient, type Booking } from "./bookings-client";

async function getBookings(): Promise<Booking[]> {
  const res = await backendFetch("/api/bookings");
  if (!res.ok) return [];
  return res.json();
}

export default async function BookingsPage() {
  const bookings = await getBookings();

  return (
    <div>
      <h1 className="text-xl font-semibold">Bookings</h1>
      <p className="mt-1 mb-6 text-sm text-neutral-500">
        Approve, reject, or reschedule appointment requests.
      </p>
      <BookingsClient bookings={bookings} />
    </div>
  );
}
