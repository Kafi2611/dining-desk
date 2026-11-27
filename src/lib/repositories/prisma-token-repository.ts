import { prisma } from "@/lib/prisma";
import { PrismaWalletStore } from "@/lib/repositories/prisma-wallet-repository";
import type {
  MealTokenRecord,
  NewMealToken,
  TokenKind,
  TokenRepository,
  TokenStore,
} from "@/lib/repositories/token-repository";

// The wallet methods (debit, addTransaction...) come from PrismaWalletStore, so a sale
// and its wallet change share one database transaction.
class PrismaTokenStore extends PrismaWalletStore implements TokenStore {
  findToken(userId: number, date: string, kind: TokenKind): Promise<MealTokenRecord | null> {
    return this.db.mealToken.findUnique({ where: { userId_date_kind: { userId, date, kind } } });
  }

  countGuestCoupons(hallId: number, date: string): Promise<number> {
    return this.db.mealToken.count({ where: { kind: "GUEST", date, user: { hallId } } });
  }

  async addToken(data: NewMealToken): Promise<void> {
    await this.db.mealToken.create({ data });
  }
}

export class PrismaTokenRepository extends PrismaTokenStore implements TokenRepository {
  constructor() {
    super(prisma);
  }

  transaction<T>(fn: (tx: TokenStore) => Promise<T>): Promise<T> {
    return prisma.$transaction((client) => fn(new PrismaTokenStore(client)));
  }
}
