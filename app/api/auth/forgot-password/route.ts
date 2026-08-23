import { proxyToBackend } from "@/lib/backend-proxy";

export const POST = proxyToBackend("/api/auth/forgot-password");
