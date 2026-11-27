import { prisma } from "@/lib/prisma";
import type { UserLookup } from "@/lib/repositories/user-repository";

export class PrismaUserRepository implements UserLookup {
  findByRoll(roll: string) {
    return prisma.user.findUnique({ where: { roll } });
  }

  findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }
}
