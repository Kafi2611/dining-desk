import { describe, it, expect, vi } from "vitest";
import { HistoryService } from "@/lib/services/history-service";
import type { HistoryRepository, TransactionRecord } from "@/lib/repositories/history-repository";

function row(id: number, overrides: Partial<TransactionRecord> = {}): TransactionRecord {
  return {
    id,
    type: "RECHARGE",
    method: "BKASH",
    amount: 50000,
    status: "COMPLETED",
    balanceAfter: 150000,
    note: null,
    createdAt: new Date("2026-11-20T10:00:00Z"),
    ...overrides,
  };
}

function setup(rows: TransactionRecord[] = []) {
  const repo: HistoryRepository = { findTransactions: vi.fn().mockResolvedValue(rows) };
  return { repo, service: new HistoryService(repo) };
}

describe("HistoryService.list (FR9)", () => {
  it("asks the repository for one type only and returns the rows it gives", async () => {
    const rows = [row(1, { type: "TRANSFER_OUT", method: "WALLET" })];
    const { repo, service } = setup(rows);

    const result = await service.list(7, { type: "TRANSFER_OUT" });

    expect(repo.findTransactions).toHaveBeenCalledTimes(1);
    expect(repo.findTransactions).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ type: "TRANSFER_OUT", status: undefined }),
    );
    expect(result).toEqual(rows);
  });
});
