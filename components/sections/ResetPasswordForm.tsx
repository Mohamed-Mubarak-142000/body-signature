"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";

type FormErrors = Partial<Record<"code" | "newPassword", string>>;

export function ResetPasswordForm({ email }: { email: string }) {
  const t = useTranslations("auth.resetPassword");
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const schema = z.object({
    code: z.string().trim().length(6, t("errors.codeInvalid")),
    newPassword: z.string().min(8, t("errors.passwordTooShort")),
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = schema.safeParse({
      code: formData.get("code"),
      newPassword: formData.get("newPassword"),
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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...result.data }),
      });
      if (!res.ok) throw new Error("reset failed");
      router.push("/login");
    } catch {
      setSubmitError(true);
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
          aria-invalid={Boolean(errors.code)}
        />
        {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">{t("newPassword")}</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder={t("newPasswordPlaceholder")}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.newPassword)}
        />
        {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword}</p>}
      </div>

      {submitError && <p className="text-sm text-destructive">{t("errors.submitFailed")}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
