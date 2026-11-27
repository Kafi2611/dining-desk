import { vi } from "vitest";
import type {
  MealTokenRecord,
  NewMealToken,
  TokenRepository,
  TokenStore,
} from "@/lib/repositories/token-repository";
import { USERS, makeWalletWorld } from "./wallet-world";

// A fake database for token tests. It reuses the fake wallet from the wallet tests,
// so debit / credit / addTransaction are the same vi.fn() mocks.
// transaction() undoes the wallet AND the tokens if the callback throws.

export function makeTokenWorld(balances?: Record<number, number>) {
  const wallet = makeWalletWorld(balances);
  const tokens: MealTokenRecord[] = [];
  let nextId = 1;

  const store: TokenStore = {
    getWalletByUserId: wallet.store.getWalletByUserId,
    debit: wallet.store.debit,
    addTransaction: wallet.store.addTransaction,
    findToken: vi.fn(
      async (userId, date, kind) =>
        tokens.find((t) => t.userId === userId && t.date === date && t.kind === kind) ?? null,
    ),
    countGuestCoupons: vi.fn(
      async (hallId, date) =>
        tokens.filter(
          (t) =>
            t.kind === "GUEST" &&
            t.date === date &&
            USERS.find((u) => u.id === t.userId)?.hallId === hallId,
        ).length,
    ),
    addToken: vi.fn(async (data: NewMealToken) => {
      tokens.push({ id: nextId++, ...data });
    }),
  };

  const repository: TokenRepository = {
    ...store,
    transaction: vi.fn(async <T>(fn: (tx: TokenStore) => Promise<T>): Promise<T> => {
      const saved = [...tokens];
      try {
        // The wallet fake undoes balances and transaction rows by itself.
        return await wallet.wallets.transaction<T>(() => fn(store));
      } catch (e) {
        tokens.splice(0, tokens.length, ...saved);
        throw e;
      }
    }),
  };

  return {
    wallet,
    tokens,
    store,
    repository,
    balanceOf: wallet.balanceOf,
    users: wallet.users,
    settings: wallet.settings,
    events: wallet.events,
  };
}
