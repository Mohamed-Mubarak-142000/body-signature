import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const ARABIC_COUNTRIES = new Set([
  "EG", "SA", "AE", "MA", "DZ", "TN", "LY", "JO", "LB", "SY",
  "IQ", "KW", "QA", "BH", "OM", "YE", "SD", "PS", "SO", "MR", "DJ", "KM",
]);

const DUTCH_COUNTRIES = new Set(["NL", "BE", "SR"]);

function localeForCountry(country: string | null): "ar" | "nl" | "en" | null {
  if (!country) return null;
  if (ARABIC_COUNTRIES.has(country)) return "ar";
  if (DUTCH_COUNTRIES.has(country)) return "nl";
  return "en";
}

// Hosting platforms attach the visitor's country to every request for free
// (Vercel, Cloudflare). Only fall back to an external lookup when neither is
// present, e.g. in local development or on a plain Node host.
function countryFromPlatformHeaders(request: NextRequest): string | null {
  return (
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    null
  );
}

async function countryFromIpLookup(request: NextRequest): Promise<string | null> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!ip || ip === "::1" || ip === "127.0.0.1") return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const response = await fetch(`https://ipapi.co/${ip}/country/`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const code = (await response.text()).trim().toUpperCase();
    return /^[A-Z]{2}$/.test(code) ? code : null;
  } catch {
    return null;
  }
}

function hasLocalePrefix(pathname: string) {
  return routing.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

export default async function proxy(request: NextRequest) {
  const alreadyChoseLocale = request.cookies.has("NEXT_LOCALE");
  const pathname = request.nextUrl.pathname;

  if (!alreadyChoseLocale && !hasLocalePrefix(pathname)) {
    const country =
      countryFromPlatformHeaders(request) ?? (await countryFromIpLookup(request));
    const locale = localeForCountry(country);

    if (locale) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}${pathname}`;
      const response = NextResponse.redirect(url);
      response.cookies.set("NEXT_LOCALE", locale, {
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
      return response;
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
