import type { Role } from "@/lib/repositories/user-repository";

declare module "next-auth" {
  interface User {
    roll: string;
    role: Role;
    hallId: number;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      roll: string;
      role: Role;
      hallId: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: number;
    roll?: string;
    role?: Role;
    hallId?: number;
  }
}
