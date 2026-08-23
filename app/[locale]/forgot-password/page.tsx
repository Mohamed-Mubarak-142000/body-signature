import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ForgotPasswordForm } from "@/components/sections/ForgotPasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.forgotPassword");
  return { title: t("title") };
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth.forgotPassword");

  return (
    <section className="mx-auto flex max-w-md flex-col px-6 py-16">
      <Card>
        <CardHeader>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-600">
            {t("eyebrow")}
          </p>
          <CardTitle className="mt-2 text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </section>
  );
}
