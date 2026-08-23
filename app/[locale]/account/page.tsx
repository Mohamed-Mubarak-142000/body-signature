import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { auth } from "@/lib/auth";
import { backendFetch } from "@/lib/backend";
import { SignOutButton } from "@/components/sections/SignOutButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.account");
  return { title: t("title") };
}

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string | number;
};
type Booking = {
  id: string;
  status: string;
  requestedAt: string;
  service: { translations: { locale: string; title: string }[] };
};

async function getOrders(): Promise<Order[]> {
  const res = await backendFetch("/api/me/orders");
  if (!res.ok) return [];
  return res.json();
}

async function getBookings(): Promise<Booking[]> {
  const res = await backendFetch("/api/me/bookings");
  if (!res.ok) return [];
  return res.json();
}

export default async function AccountPage() {
  const t = await getTranslations("auth.account");
  const session = await auth();

  if (!session?.user) {
    return (
      <section className="mx-auto flex max-w-md flex-col px-6 py-16 text-center">
        <p className="text-muted-foreground">{t("notSignedIn")}</p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-none bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          {t("signInCta")}
        </Link>
      </section>
    );
  }

  const [orders, bookings] = await Promise.all([getOrders(), getBookings()]);

  return (
    <section className="mx-auto max-w-3xl space-y-8 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("signedInAs")} {session.user.name ?? session.user.email}
          </p>
        </div>
        <SignOutButton label={t("signOut")} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("ordersTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noOrders")}</p>
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-border/70 p-4 text-sm"
                >
                  <span>
                    {t("orderNumber")} {order.orderNumber}
                  </span>
                  <span className="text-muted-foreground">{order.status}</span>
                  <span>{order.totalAmount}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("bookingsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noBookings")}</p>
          ) : (
            <ul className="space-y-3">
              {bookings.map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border border-border/70 p-4 text-sm"
                >
                  <span>
                    {booking.service.translations.find((tr) => tr.locale === "en")?.title ?? "—"}
                  </span>
                  <span className="text-muted-foreground">{booking.status}</span>
                  <span>{new Date(booking.requestedAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
