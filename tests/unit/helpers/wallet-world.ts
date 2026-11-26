import { vi } from "vitest";
import { WalletError } from "@/lib/services/wallet-errors";
import type {
  NewTransaction,
  RechargeRequestRecord,
  WalletRecord,
  WalletRepository,
  WalletStore,
} from "@/lib/repositories/wallet-repository";
import type { UserLookup, UserRecord } from "@/lib/repositories/user-repository";

// A fake database for wallet tests. Every method is a vi.fn() so tests can use toHaveBeenCalledWith.
// transaction() really undoes all changes if the callback throws (like prisma.$transaction).

const user = (id: number, roll: string, name: string, hallId: number, role: "STUDENT" | "MANAGER") =>
  ({ id, roll, name, email: `${roll}@x.test`, passwordHash: "hash:secret", role, hallId }) satisfies UserRecord;

export const USERS: UserRecord[] = [
  user(1, "2203001", "Student One", 1, "STUDENT"),
  user(2, "2203002", "Student Two", 1, "STUDENT"),
  user(4, "2203004", "Student Four", 2, "STUDENT"),
  user(9, "9000001", "Meal Manager", 1, "MANAGER"),
];

interface State {
  wallets: WalletRecord[];
  requests: (RechargeRequestRecord & { createdAt: Date; decidedById?: number })[];
  transactions: NewTransaction[];
}

export function makeWalletWorld(balances: Record<number, number> = { 1: 100000, 2: 0, 4: 0 }) {
  const state: State = {
    wallets: Object.entries(balances).map(([userId, balance]) => ({
      id: Number(userId) * 10,
      userId: Number(userId),
      balance,
    })),
    requests: [],
    transactions: [],
  };
  let nextRequestId = 1;
  const walletById = (id: number) => state.wallets.find((w) => w.id === id)!;

  const store: WalletStore = {
    getWalletByUserId: vi.fn(async (userId: number) => {
      const w = state.wallets.find((x) => x.userId === userId);
      return w ? { ...w } : null;
    }),
    debit: vi.fn(async (walletId: number, amount: number) => {
      const w = walletById(walletId);
      if (w.balance < amount) throw new WalletError("INSUFFICIENT_BALANCE", "Not enough balance");
      w.balance -= amount;
      return w.balance;
    }),
    credit: vi.fn(async (walletId: number, amount: number) => {
      const w = walletById(walletId);
      w.balance += amount;
      return w.balance;
    }),
    addTransaction: vi.fn(async (data: NewTransaction) => {
      state.transactions.push(data);
    }),
    findRechargeRequest: vi.fn(async (id: number) => {
      const r = state.requests.find((x) => x.id === id);
      return r ? { ...r } : null;
    }),
    createRechargeRequest: vi.fn(async (data) => {
      const r = { id: nextRequestId++, status: "PENDING" as const, createdAt: new Date(), ...data };
      state.requests.push(r);
      return { ...r };
    }),
    decideRechargeRequest: vi.fn(async (id, status, decidedById) => {
      const r = state.requests.find((x) => x.id === id)!;
      r.status = status;
      r.decidedById = decidedById;
    }),
    countRechargeRequests: vi.fn(async (userId, method, from, to) =>
      state.requests.filter(
        (r) => r.userId === userId && r.method === method && r.createdAt >= from && r.createdAt < to,
      ).length,
    ),
  };

  const wallets: WalletRepository = {
    ...store,
    transaction: vi.fn(async (fn) => {
      const snapshot = structuredClone(state);
      try {
        return await fn(store);
      } catch (e) {
        state.wallets = snapshot.wallets;
        state.requests = snapshot.requests;
        state.transactions = snapshot.transactions;
        throw e;
      }
    }),
  };

  const users: UserLookup = {
    findByRoll: vi.fn(async (roll: string) => USERS.find((u) => u.roll === roll) ?? null),
    findById: vi.fn(async (id: number) => USERS.find((u) => u.id === id) ?? null),
  };

  return {
    state,
    store,
    wallets,
    users,
    balanceOf: (userId: number) => state.wallets.find((w) => w.userId === userId)!.balance,
    settings: {
      get: vi.fn().mockResolvedValue({
        mealRate: 4000,
        guestRate: 5000,
        cutoffTime: "23:00",
        guestDailyLimit: 10,
        minRecharge: 50000,
        lowBalanceAt: 8000,
      }),
    },
    // The demo password is "secret": the fake hash is "hash:secret".
    hasher: { compare: vi.fn(async (plain: string, hash: string) => hash === `hash:${plain}`) },
    onlineGateway: { charge: vi.fn().mockResolvedValue({ status: "SUCCESS", reference: "TRX1" }) },
    offlineGateway: { charge: vi.fn().mockResolvedValue({ status: "PENDING", reference: "slip-1" }) },
    events: { publish: vi.fn().mockResolvedValue(undefined) },
  };
}
