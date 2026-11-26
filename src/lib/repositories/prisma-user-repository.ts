import { prisma } from "@/lib/prisma";
import type { UserRepository } from "@/lib/repositories/user-repository";

export class PrismaUserRepository implements UserRepository {
  findByRoll(roll: string) {
    return prisma.user.findUnique({ where: { roll } });
  }
}
