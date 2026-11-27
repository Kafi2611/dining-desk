import { prisma } from "@/lib/prisma";
import type { SettingsAdmin, SettingsUpdate } from "@/lib/repositories/settings-repository";

export class PrismaSettingsRepository implements SettingsAdmin {
  get() {
    return prisma.settings.findUniqueOrThrow({ where: { id: 1 } });
  }

  update(data: SettingsUpdate) {
    return prisma.settings.update({ where: { id: 1 }, data });
  }
}
