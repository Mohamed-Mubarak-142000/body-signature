import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ResetPasswordForm } from "@/components/sections/ResetPasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.resetPassword");
  return { title: t("title") };
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const t = await getTranslations("auth.resetPassword");
  const { email = "" } = await searchParams;

  return (
    <section className="mx-auto flex max-w-md flex-col px-6 py-16">
      <Card>
        <CardHeader>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-600">
            {t("eyebrow")}
          </p>
          <CardTitle className="mt-2 text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle", { email })}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm email={email} />
        </CardContent>
      </Card>
    </section>
  );
}
