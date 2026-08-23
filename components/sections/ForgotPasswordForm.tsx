"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const schema = z.object({ email: z.string().trim().email() });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = schema.safeParse({ email: formData.get("email") });
    if (!result.success) {
      setError(t("email"));
      return;
    }

    setError(null);
    setSubmitting(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data),
    });
    setSubmitting(false);
    setSubmitted(true);
    router.push(`/reset-password?email=${encodeURIComponent(result.data.email)}`);
  }

  if (submitted) {
    return (
      <div role="status" className="rounded-2xl border border-gold-300/60 bg-gold-100/40 p-6 text-center">
        {t("success")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          aria-invalid={Boolean(error)}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
