import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "assistant" | "admin";
    } & DefaultSession["user"];
    backendToken: string;
  }

  interface User {
    role: "assistant" | "admin";
    backendToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "assistant" | "admin";
    backendToken: string;
  }
}
