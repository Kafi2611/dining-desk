import type {
  TransactionMethod,
  TransactionStatus,
  TransactionType,
} from "@/lib/repositories/wallet-repository";

export type HistorySort = "NEWEST" | "OLDEST";

export interface TransactionRecord {
  id: number;
  type: TransactionType;
  method: TransactionMethod;
  amount: number;
  status: TransactionStatus;
  balanceAfter: number;
  note: string | null;
  createdAt: Date;
}

// `from` is included, `to` is NOT included (it is the start of the next day).
export interface HistoryQuery {
  type?: TransactionType;
  status?: TransactionStatus;
  from?: Date;
  to?: Date;
  sort: HistorySort;
}

export interface HistoryRepository {
  findTransactions(userId: number, query: HistoryQuery): Promise<TransactionRecord[]>;
}
