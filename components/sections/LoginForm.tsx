"use client";

import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";

type FormErrors = Partial<Record<"email" | "password", string>>;

export function LoginForm() {
  const t = useTranslations("auth.login");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const schema = z.object({
    email: z.string().trim().min(1, t("errors.emailInvalid")).email(t("errors.emailInvalid")),
    password: z.string().min(1),
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = schema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
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

    const signInResult = await signIn("credentials", { ...result.data, redirect: false });
    setSubmitting(false);

    if (signInResult?.error) {
      setSubmitError(true);
      return;
    }

    router.push("/account");
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
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder={t("passwordPlaceholder")}
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      {submitError && <p className="text-sm text-destructive">{t("errors.invalidCredentials")}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? t("sending") : t("submit")}
      </Button>

      <div className="relative py-2 text-center text-xs text-muted-foreground">
        <span className="bg-card px-2">{tAuth("orDivider")}</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => signIn("google")}
      >
        {tAuth("googleCta")}
      </Button>
    </form>
  );
}
