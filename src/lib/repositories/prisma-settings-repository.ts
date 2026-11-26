import { prisma } from "@/lib/prisma";
import type { SettingsRepository } from "@/lib/repositories/settings-repository";

export class PrismaSettingsRepository implements SettingsRepository {
  get() {
    return prisma.settings.findUniqueOrThrow({ where: { id: 1 } });
  }
}
