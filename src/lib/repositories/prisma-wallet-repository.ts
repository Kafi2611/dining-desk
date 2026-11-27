import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  NewTransaction,
  RechargeRequestRecord,
  TransactionMethod,
  WalletRepository,
  WalletStore,
} from "@/lib/repositories/wallet-repository";
import { WalletError } from "@/lib/services/wallet-errors";

// Works on either the normal client or the client of an open prisma.$transaction.
class PrismaWalletStore implements WalletStore {
  constructor(protected readonly db: Prisma.TransactionClient) {}

  getWalletByUserId(userId: number) {
    return this.db.wallet.findUnique({ where: { userId } });
  }

  async debit(walletId: number, amount: number) {
    // The "gte" condition makes the balance impossible to push below 0, even with two requests at once.
    const result = await this.db.wallet.updateMany({
      where: { id: walletId, balance: { gte: amount } },
      data: { balance: { decrement: amount } },
    });
    if (result.count === 0) throw new WalletError("INSUFFICIENT_BALANCE", "Not enough balance");
    const wallet = await this.db.wallet.findUniqueOrThrow({ where: { id: walletId } });
    return wallet.balance;
  }

  async credit(walletId: number, amount: number) {
    const wallet = await this.db.wallet.update({
      where: { id: walletId },
      data: { balance: { increment: amount } },
    });
    return wallet.balance;
  }

  async addTransaction(data: NewTransaction) {
    await this.db.transaction.create({ data });
  }

  findRechargeRequest(id: number): Promise<RechargeRequestRecord | null> {
    return this.db.rechargeRequest.findUnique({ where: { id } });
  }

  createRechargeRequest(data: {
    userId: number;
    amount: number;
    method: TransactionMethod;
    reference: string;
  }): Promise<RechargeRequestRecord> {
    return this.db.rechargeRequest.create({ data });
  }

  async decideRechargeRequest(
    id: number,
    status: "APPROVED" | "REJECTED",
    decidedById: number,
    decidedAt: Date,
  ) {
    await this.db.rechargeRequest.update({ where: { id }, data: { status, decidedById, decidedAt } });
  }

  countRechargeRequests(userId: number, method: TransactionMethod, from: Date, to: Date) {
    return this.db.rechargeRequest.count({
      where: { userId, method, createdAt: { gte: from, lt: to } },
    });
  }
}

export class PrismaWalletRepository extends PrismaWalletStore implements WalletRepository {
  constructor() {
    super(prisma);
  }

  transaction<T>(fn: (tx: WalletStore) => Promise<T>): Promise<T> {
    return prisma.$transaction((client) => fn(new PrismaWalletStore(client)));
  }
}
