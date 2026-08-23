import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LoginForm } from "@/components/sections/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return { title: t("title"), description: t("subtitle") };
}

export default async function LoginPage() {
  const t = await getTranslations("auth.login");

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
          <LoginForm />
          <div className="mt-6 flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <Link href="/forgot-password" className="hover:text-foreground">
              {t("forgotPassword")}
            </Link>
            <p>
              {t("noAccount")}{" "}
              <Link href="/register" className="font-medium text-gold-600 hover:text-gold-700">
                {t("signUp")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
