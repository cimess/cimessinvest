import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    companyName?: string;
    phone?: string;
    authorizationKey?: string;
    role?: string;
    adminId?: string | null;
    activeCompanyId?: string;
    companyId?: string;
    companySlug?: string;
    industry?: string;
    memberRole?: string;
    platformRole?: string | null;
  }

  interface Session {
    user: {
      id: string;
      companyName?: string;
      authorizationKey?: string;
      role?: string;
      adminId?: string | null;
      activeCompanyId?: string;
      companyId?: string;
      companySlug?: string;
      industry?: string;
      memberRole?: string;
      platformRole?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    companyName?: string;
    authorizationKey?: string;
    role?: string;
    adminId?: string | null;
    activeCompanyId?: string;
    companyId?: string;
    companySlug?: string;
    industry?: string;
    memberRole?: string;
    platformRole?: string | null;
  }
}
