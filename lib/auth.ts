import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

// Customer session for the marketing site. Neither provider talks to a
// local database — both end in a bearer token issued by the backend
// (zefaaf-body-signature-backend), stored in this app's own session and
// attached to backend requests via lib/backend.ts's backendFetch().
// See that repo's lib/auth-token.ts for why this isn't a shared cookie.

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const res = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
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
          backendToken: token,
        };
      },
    }),
    // Used right after email verification or a Google sign-in: both already
    // hand back a bearer token from the backend, so this turns it into a
    // session directly instead of asking the customer to log in again.
    Credentials({
      id: "token",
      name: "Token",
      credentials: { token: { label: "Token", type: "text" } },
      async authorize(credentials) {
        const token = credentials?.token as string | undefined;
        if (!token) return null;

        const res = await fetch(`${process.env.BACKEND_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return null;

        const user = await res.json();
        if (user.role !== "customer") return null;

        return { id: user.id, email: user.email, name: user.name, backendToken: token };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      const res = await fetch(`${process.env.BACKEND_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": process.env.INTERNAL_API_SECRET ?? "",
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name ?? profile?.name,
          googleId: account.providerAccountId,
        }),
      });
      if (!res.ok) return false;

      const data = await res.json();
      user.id = data.user.id;
      user.backendToken = data.token;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.backendToken = user.backendToken as string;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.backendToken = token.backendToken as string;
      return session;
    },
  },
});
