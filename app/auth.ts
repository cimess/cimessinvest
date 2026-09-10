import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma/prisma";
import bcrypt from "bcrypt";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const email = (credentials.email as string).trim();
        const password = credentials.password as string;

        // 1. Fetch user by email
        const user = await prisma.user.findFirst({
          where: {
            email: { equals: email, mode: "insensitive" },
          },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // 2. Verify password with bcrypt
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        // 3. Check role and superadmin credentials
        const assignedRole = user.role || "ADMIN";
        if (assignedRole === "SUPERADMIN") {
          const { isSuperAdminEmail } = await import("@/app/lib/auth/superadmin");
          if (!isSuperAdminEmail(user.email)) {
            throw new Error("Unauthorized superadmin access");
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.companyName,
          companyName: user.companyName,
          phone: user.phone,
          authorizationKey: user.authorizationKey,
          role: assignedRole,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 Hours
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.companyName = (user).companyName;
        token.phone = (user).phone;
        token.authorizationKey = (user).authorizationKey;
        token.role = (user).role || "ADMIN";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user).companyName = token.companyName as string;
        (session.user).authorizationKey = token.authorizationKey as string;
        (session.user).role = (token.role as string) || "ADMIN";
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
});
