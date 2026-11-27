import { prisma } from "@/lib/prisma";
import type { HistoryQuery, HistoryRepository } from "@/lib/repositories/history-repository";

export class PrismaHistoryRepository implements HistoryRepository {
  findTransactions(userId: number, query: HistoryQuery) {
    return prisma.transaction.findMany({
      where: {
        wallet: { userId },
        type: query.type,
        status: query.status,
        createdAt: { gte: query.from, lt: query.to },
      },
      orderBy: [{ createdAt: query.sort === "NEWEST" ? "desc" : "asc" }, { id: "desc" }],
      select: {
        id: true,
        type: true,
        method: true,
        amount: true,
        status: true,
        balanceAfter: true,
        note: true,
        createdAt: true,
      },
    });
  }
}
