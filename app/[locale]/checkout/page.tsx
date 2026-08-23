import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CheckoutForm } from "@/components/sections/CheckoutForm";
import { auth } from "@/lib/auth";
import { backendFetch } from "@/lib/backend";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shop.checkout");
  return { title: t("title") };
}

type CartItem = { quantity: number; product: { price: string | number } };

export default async function CheckoutPage() {
  const t = await getTranslations("shop.checkout");
  const tCart = await getTranslations("shop.cart");
  const tAccount = await getTranslations("auth.account");
  const session = await auth();

  if (!session?.user) {
    return (
      <section className="mx-auto flex max-w-md flex-col px-6 py-16 text-center">
        <p className="text-muted-foreground">{tAccount("notSignedIn")}</p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-none bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          {tAccount("signInCta")}
        </Link>
      </section>
    );
  }

  const res = await backendFetch("/api/cart");
  const cart = res.ok ? await res.json() : { items: [] };
  const items: CartItem[] = cart.items ?? [];
  const total = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  if (items.length === 0) {
    return (
      <section className="mx-auto flex max-w-md flex-col px-6 py-16 text-center">
        <p className="text-muted-foreground">{tCart("empty")}</p>
        <Link href="/shop" className="mt-4 text-sm font-medium text-gold-600 hover:text-gold-700">
          {tCart("browseCta")}
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-6 pt-10 pb-20">
      <h1 className="mb-2 font-heading text-3xl text-foreground">{t("title")}</h1>
      <p className="mb-8 text-muted-foreground">{t("subtitle")}</p>
      <CheckoutForm total={total} />
    </section>
  );
}
