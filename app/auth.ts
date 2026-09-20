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

        // 1. Fetch user by email with active memberships & company details
        const user = await prisma.user.findFirst({
          where: {
            email: { equals: email, mode: "insensitive" },
          },
          include: {
            memberships: {
              where: { status: "ACTIVE" },
              include: {
                company: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    industry: true,
                    status: true,
                    siteSetting: {
                      select: {
                        tailorBioImage: true,
                      },
                    },
                  },
                },
              },
            },
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

        const activeMembership = user.memberships?.[0] || null;
        const activeCompany = activeMembership?.company || null;

        // 3. Return user object with multi-tenant company context
        return {
          id: user.id,
          email: user.email,
          name: (activeCompany?.name || user.companyName) ?? undefined,
          companyName: (activeCompany?.name || user.companyName) ?? undefined,
          phone: user.phone,
          authorizationKey: user.authorizationKey,
          role: user.role,
          adminId: user.adminId ?? undefined,
          activeCompanyId: activeCompany?.id || undefined,
          companyId: activeCompany?.id || undefined,
          companySlug: activeCompany?.slug || undefined,
          industry: activeCompany?.industry || undefined,
          memberRole: activeMembership?.role || undefined,
          platformRole: user.platformRole || null,
          image: activeCompany?.siteSetting?.tailorBioImage ?? undefined,
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.companyName = (user as any).companyName;
        token.phone = (user as any).phone;
        token.authorizationKey = (user as any).authorizationKey;
        token.role = (user as any).role || "USER";
        token.adminId = (user as any).adminId || null;
        token.activeCompanyId = (user as any).activeCompanyId;
        token.companyId = (user as any).companyId;
        token.companySlug = (user as any).companySlug;
        token.industry = (user as any).industry;
        token.memberRole = (user as any).memberRole;
        token.platformRole = (user as any).platformRole;
        token.image = (user as any).image || null;
      }

      // Dynamic company context switch via useSession().update()
      if (trigger === "update" && session) {
        if (session.activeCompanyId) {
          token.activeCompanyId = session.activeCompanyId;
          token.companyId = session.activeCompanyId;
        }
        if (session.companySlug) token.companySlug = session.companySlug;
        if (session.companyName) token.companyName = session.companyName;
        if (session.industry) token.industry = session.industry;
        if (session.memberRole) token.memberRole = session.memberRole;
        if (session.image !== undefined) token.image = session.image;
      }

      // Check database to ensure user was not deleted
      if (token?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true },
        }).catch(() => null);

        if (!dbUser) {
          return null as any;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session?.user && token?.id) {
        // Fast DB check: does this user still exist in the database?
        const existingUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true },
        }).catch(() => null);

        if (!existingUser) {
          return null as any;
        }

        session.user.id = token.id as string;
        session.user.companyName = token.companyName as string;
        session.user.authorizationKey = token.authorizationKey as string;
        session.user.role = (token.role as string) || "USER";
        session.user.adminId = (token.adminId as string) || null;
        session.user.activeCompanyId = token.activeCompanyId as string;
        session.user.companyId = (token.companyId || token.activeCompanyId) as string;
        session.user.companySlug = token.companySlug as string;
        session.user.industry = token.industry as string;
        session.user.memberRole = token.memberRole as string;
        session.user.platformRole = (token.platformRole as any) || null;
        session.user.image = (token.image as string) || null;
      }
      return session;
    },
  },

  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET
});
