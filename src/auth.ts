import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { AuthService } from "@/lib/services/auth-service";
import { PrismaUserRepository } from "@/lib/repositories/prisma-user-repository";
import { loginSchema } from "@/lib/validators/login";
import type { Role } from "@/lib/repositories/user-repository";

const authService = new AuthService(new PrismaUserRepository(), {
  compare: (plain, hash) => bcrypt.compare(plain, hash),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { roll: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const user = await authService.login(parsed.data.roll, parsed.data.password);
        if (!user) return null;
        return {
          id: String(user.id),
          name: user.name,
          roll: user.roll,
          role: user.role,
          hallId: user.hallId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = Number(user.id);
        token.roll = user.roll;
        token.role = user.role;
        token.hallId = user.hallId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = String(token.userId);
      session.user.roll = token.roll as string;
      session.user.role = token.role as Role;
      session.user.hallId = token.hallId as number;
      return session;
    },
  },
});
