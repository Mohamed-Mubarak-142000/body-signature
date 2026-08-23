"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";

type FormErrors = Partial<Record<"shippingAddress" | "phone", string>>;

export function CheckoutForm({ total }: { total: number }) {
  const t = useTranslations("shop.checkout");
  const tOrder = useTranslations("shop.orderConfirmed");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const schema = z.object({
    shippingAddress: z.string().trim().min(1, t("errors.addressRequired")),
    phone: z.string().trim().min(1, t("errors.phoneRequired")),
    paymentMethod: z.enum(["cod", "manual_transfer"]),
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = schema.safeParse({
      shippingAddress: formData.get("shippingAddress"),
      phone: formData.get("phone"),
      paymentMethod: formData.get("paymentMethod"),
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitError(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/backend/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      if (!res.ok) throw new Error("checkout failed");
      const order = await res.json();
      setOrderNumber(order.orderNumber);
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (orderNumber) {
    return (
      <div role="status" className="rounded-2xl border border-gold-300/60 bg-gold-100/40 p-8 text-center">
        <h2 className="font-heading text-2xl text-foreground">{tOrder("title")}</h2>
        <p className="mt-2 text-muted-foreground">{tOrder("subtitle")}</p>
        <p className="mt-4 text-sm text-foreground">
          {tOrder("orderNumber")}: <strong>{orderNumber}</strong>
        </p>
        <Link href="/account" className="mt-6 inline-block text-sm font-medium text-gold-600 hover:text-gold-700">
          {tOrder("viewAccount")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="shippingAddress">{t("shippingAddress")}</Label>
        <Input
          id="shippingAddress"
          name="shippingAddress"
          placeholder={t("shippingAddressPlaceholder")}
          autoComplete="street-address"
          aria-invalid={Boolean(errors.shippingAddress)}
        />
        {errors.shippingAddress && (
          <p className="text-xs text-destructive">{errors.shippingAddress}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder={t("phonePlaceholder")}
          autoComplete="tel"
          aria-invalid={Boolean(errors.phone)}
        />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">{t("paymentMethod")}</Label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          defaultValue="cod"
          className="w-full border border-border/70 bg-background px-3 py-2 text-sm"
        >
          <option value="cod">{t("cod")}</option>
          <option value="manual_transfer">{t("manualTransfer")}</option>
        </select>
      </div>

      <div className="flex items-center justify-between border-t border-border/70 pt-4 text-sm">
        <span className="text-muted-foreground">{t("total")}</span>
        <span className="text-lg font-medium text-foreground">{total.toFixed(2)}</span>
      </div>

      {submitError && <p className="text-sm text-destructive">{t("errors.submitFailed")}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
