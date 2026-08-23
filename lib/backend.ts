import { auth } from "@/lib/auth";

/**
 * Fetches from the backend API with the customer's bearer token attached.
 * Server-side only (reads the session via auth()).
 */
export async function backendFetch(path: string, init?: RequestInit) {
  const session = await auth();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (session?.backendToken) {
    headers.set("Authorization", `Bearer ${session.backendToken}`);
  }

  return fetch(`${process.env.BACKEND_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}
