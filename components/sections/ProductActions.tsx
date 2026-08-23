"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

type Status = "idle" | "loading" | "done" | "error";

export function ProductActions({ productId, inStock }: { productId: string; inStock: boolean }) {
  const t = useTranslations("shop.product");
  const router = useRouter();
  const [cartStatus, setCartStatus] = useState<Status>("idle");
  const [wishlistStatus, setWishlistStatus] = useState<Status>("idle");

  async function post(path: string, status: (s: Status) => void) {
    status("loading");
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });

    if (res.status === 403 || res.status === 401) {
      router.push(`/login`);
      return;
    }
    status(res.ok ? "done" : "error");
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        size="lg"
        disabled={!inStock || cartStatus === "loading"}
        onClick={() => post("/api/backend/cart", setCartStatus)}
      >
        {cartStatus === "loading"
          ? t("addingToCart")
          : cartStatus === "done"
            ? t("addedToCart")
            : t("addToCart")}
      </Button>
      <Button
        variant="outline"
        size="lg"
        disabled={wishlistStatus === "loading"}
        onClick={() => post("/api/backend/wishlist", setWishlistStatus)}
      >
        {wishlistStatus === "done" ? t("addedToWishlist") : t("addToWishlist")}
      </Button>
    </div>
  );
}
