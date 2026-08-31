import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    companyName?: string;
    phone?: string;
    authorizationKey?: string;
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      companyName?: string;
      authorizationKey?: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    companyName?: string;
    authorizationKey?: string;
    role?: string;
  }
}
