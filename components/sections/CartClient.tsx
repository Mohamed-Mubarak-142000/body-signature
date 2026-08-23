"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { productName } from "@/lib/shop-types";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    translations: { locale: string; name: string }[];
    price: string | number;
    images: { url: string }[];
  };
};

export function CartClient({ items }: { items: CartItem[] }) {
  const t = useTranslations("shop.cart");
  const locale = useLocale();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return;
    setBusyId(itemId);
    await fetch(`/api/backend/cart/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function removeItem(itemId: string) {
    setBusyId(itemId);
    await fetch(`/api/backend/cart/items/${itemId}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card p-8 text-center">
        <p className="text-muted-foreground">{t("empty")}</p>
        <Link
          href="/shop"
          className="mt-4 inline-block text-sm font-medium text-gold-600 hover:text-gold-700"
        >
          {t("browseCta")}
        </Link>
      </div>
    );
  }

  const total = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 border border-border/70 bg-card p-4"
        >
          <div className="h-20 w-20 shrink-0 overflow-hidden bg-gradient-to-br from-gold-200 to-gold-400">
            {item.product.images[0]?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.product.images[0].url}
                alt={productName(item.product, locale)}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">{productName(item.product, locale)}</p>
            <p className="text-sm text-muted-foreground">{Number(item.product.price).toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor={`qty-${item.id}`} className="text-sm text-muted-foreground">
              {t("quantity")}
            </label>
            <input
              id={`qty-${item.id}`}
              type="number"
              min={1}
              value={item.quantity}
              disabled={busyId === item.id}
              onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
              className="w-16 border border-border/70 bg-background px-2 py-1 text-sm"
            />
          </div>
          <button
            onClick={() => removeItem(item.id)}
            disabled={busyId === item.id}
            className="text-sm text-destructive hover:underline"
          >
            {t("remove")}
          </button>
        </div>
      ))}

      <div className="flex items-center justify-between border-t border-border/70 pt-4">
        <span className="text-lg font-medium text-foreground">
          {t("total")}: {total.toFixed(2)}
        </span>
        <Button size="lg" onClick={() => router.push("/checkout")}>
          {t("checkout")}
        </Button>
      </div>
    </div>
  );
}
