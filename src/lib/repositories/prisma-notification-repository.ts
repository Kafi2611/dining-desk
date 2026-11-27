import { prisma } from "@/lib/prisma";
import type { NotificationRepository } from "@/lib/repositories/notification-repository";

export class PrismaNotificationRepository implements NotificationRepository {
  async create(userId: number, title: string) {
    await prisma.notification.create({ data: { userId, title } });
  }

  listForUser(userId: number, limit: number) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
