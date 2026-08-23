import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CartClient } from "@/components/sections/CartClient";
import { auth } from "@/lib/auth";
import { backendFetch } from "@/lib/backend";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shop.cart");
  return { title: t("title") };
}

export default async function CartPage() {
  const t = await getTranslations("shop.cart");
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

  return (
    <section className="mx-auto max-w-3xl px-6 pt-10 pb-20">
      <h1 className="mb-8 font-heading text-3xl text-foreground">{t("title")}</h1>
      <CartClient items={cart.items} />
    </section>
  );
}
