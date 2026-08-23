import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

// Customer-facing authentication for the Body Signature platform.
// Staff (admin/assistant) sign in separately via /api/staff-login, called
// by the dashboard app's own Credentials provider — see BACKEND_PRD.md §4.2.
//
// No PrismaAdapter here on purpose: our User/OAuthAccount/OtpCode tables
// (BACKEND_PRD.md §5 ERD) don't match NextAuth's default adapter schema,
// so account linking is done by hand in the `signIn` callback below.

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        // Email must be verified via OTP before password login works —
        // see BACKEND_PRD.md §4.1.
        if (!user.emailVerified) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      // TODO(auth feature): upsert User + OAuthAccount for Google sign-in.
      // A Google sign-in always counts as email-verified (Google already
      // confirmed it) — see BACKEND_PRD.md §4.1.
      void user;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as "customer" | "assistant" | "admin";
      return session;
    },
  },
});
