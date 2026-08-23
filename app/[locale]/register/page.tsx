import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RegisterForm } from "@/components/sections/RegisterForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.register");
  return { title: t("title"), description: t("subtitle") };
}

export default async function RegisterPage() {
  const t = await getTranslations("auth.register");

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
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("haveAccount")}{" "}
            <Link href="/login" className="font-medium text-gold-600 hover:text-gold-700">
              {t("signIn")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
