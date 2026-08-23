import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "customer" | "assistant" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    role: "customer" | "assistant" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "customer" | "assistant" | "admin";
  }
}
