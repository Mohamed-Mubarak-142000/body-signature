import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// The dashboard has no database of its own — every credential check goes
// through the backend's POST /api/staff-login, which returns a bearer token
// this app carries on the session and attaches to every backend request.
// See zefaaf-body-signature-backend/README.md ("Staff auth is a bearer
// token...") for why this isn't a shared cookie session.

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
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

        const res = await fetch(`${process.env.BACKEND_URL}/api/staff-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) return null;

        const { token, user } = await res.json();
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          backendToken: token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.backendToken = user.backendToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as "assistant" | "admin";
      session.backendToken = token.backendToken as string;
      return session;
    },
  },
});
