import type {
  HistoryRepository,
  TransactionRecord,
} from "@/lib/repositories/history-repository";
import type { TransactionStatus, TransactionType } from "@/lib/repositories/wallet-repository";
import { dhakaDayRange } from "@/lib/services/dhaka-time";
import { HistoryError } from "@/lib/services/history-errors";

export interface HistoryFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  // Dhaka dates written "YYYY-MM-DD". Both days are included.
  fromDate?: string;
  toDate?: string;
}

// Start of the Dhaka day for a "YYYY-MM-DD" text.
function dhakaDay(date: string) {
  return dhakaDayRange(new Date(`${date}T00:00:00+06:00`));
}

export class HistoryService {
  constructor(private readonly history: HistoryRepository) {}

  async list(userId: number, filters: HistoryFilters = {}): Promise<TransactionRecord[]> {
    const from = filters.fromDate ? dhakaDay(filters.fromDate).start : undefined;
    const to = filters.toDate ? dhakaDay(filters.toDate).end : undefined;
    if (from && to && from >= to) {
      throw new HistoryError("INVALID_RANGE", "The 'from' date must not be after the 'to' date");
    }
    return this.history.findTransactions(userId, {
      type: filters.type,
      status: filters.status,
      from,
      to,
      sort: "NEWEST",
    });
  }
}
