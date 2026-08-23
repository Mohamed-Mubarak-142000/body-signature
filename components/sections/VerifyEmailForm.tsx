"use client";

import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";

export function VerifyEmailForm({ email }: { email: string }) {
  const t = useTranslations("auth.verifyEmail");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const schema = z.object({ code: z.string().trim().length(6, t("errors.codeInvalid")) });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = schema.safeParse({ code: formData.get("code") });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? null);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: result.data.code }),
      });
      if (!res.ok) throw new Error("verify failed");

      const { token } = await res.json();
      const signInResult = await signIn("token", { token, redirect: false });
      if (signInResult?.error) throw new Error("session failed");

      router.push("/account");
    } catch {
      setError(t("errors.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="code">{t("code")}</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          placeholder={t("codePlaceholder")}
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
