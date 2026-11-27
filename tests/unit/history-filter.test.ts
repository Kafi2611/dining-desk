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

  it("asks the repository for one status only", async () => {
    const rows = [row(2, { status: "PENDING", method: "OFFLINE" })];
    const { repo, service } = setup(rows);

    const result = await service.list(7, { status: "PENDING" });

    expect(repo.findTransactions).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ status: "PENDING", type: undefined }),
    );
    expect(result).toEqual(rows);
  });

  it("uses the Dhaka day: 'from' is the start of its day and 'to' is the start of the NEXT day", async () => {
    const { repo, service } = setup();

    await service.list(7, { fromDate: "2026-11-10", toDate: "2026-11-12" });

    // Dhaka midnight is 18:00 UTC of the day before.
    expect(repo.findTransactions).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        from: new Date("2026-11-09T18:00:00.000Z"),
        to: new Date("2026-11-12T18:00:00.000Z"),
      }),
    );
  });

  it("works with only a 'from' date or only a 'to' date", async () => {
    const { repo, service } = setup();

    await service.list(7, { fromDate: "2026-11-10" });
    await service.list(7, { toDate: "2026-11-10" });

    expect(repo.findTransactions).toHaveBeenNthCalledWith(
      1,
      7,
      expect.objectContaining({ from: new Date("2026-11-09T18:00:00.000Z"), to: undefined }),
    );
    expect(repo.findTransactions).toHaveBeenNthCalledWith(
      2,
      7,
      expect.objectContaining({ from: undefined, to: new Date("2026-11-10T18:00:00.000Z") }),
    );
  });

  it("refuses a range where 'from' is after 'to' and does not query the database", async () => {
    const { repo, service } = setup();

    await expect(
      service.list(7, { fromDate: "2026-11-12", toDate: "2026-11-10" }),
    ).rejects.toMatchObject({ code: "INVALID_RANGE" });
    expect(repo.findTransactions).not.toHaveBeenCalled();
  });

  it("shows the newest transaction first", async () => {
    const { repo, service } = setup();

    await service.list(7);

    expect(repo.findTransactions).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ sort: "NEWEST" }),
    );
  });
});
