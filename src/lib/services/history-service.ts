import type {
  HistoryRepository,
  TransactionRecord,
} from "@/lib/repositories/history-repository";
import type { TransactionStatus, TransactionType } from "@/lib/repositories/wallet-repository";

export interface HistoryFilters {
  type?: TransactionType;
  status?: TransactionStatus;
}

export class HistoryService {
  constructor(private readonly history: HistoryRepository) {}

  list(userId: number, filters: HistoryFilters = {}): Promise<TransactionRecord[]> {
    return this.history.findTransactions(userId, {
      type: filters.type,
      status: filters.status,
      sort: "NEWEST",
    });
  }
}
