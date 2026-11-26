import { describe, it, expect, vi, afterEach } from "vitest";
import { setupWalletService as setup } from "./helpers/wallet-world";

afterEach(() => vi.useRealTimers());

describe("WalletService.requestOffline", () => {
  it("creates a pending request through the offline gateway and does not touch the balance", async () => {
    const { world, service } = setup();

    await service.requestOffline(1, 50000, "slip-1");

    expect(world.offlineGateway.charge).toHaveBeenCalledWith(50000, "slip-1");
    expect(world.store.createRechargeRequest).toHaveBeenCalledWith({
      userId: 1,
      amount: 50000,
      method: "OFFLINE",
      reference: "slip-1",
    });
    expect(world.balanceOf(1)).toBe(100000);
  });

  it.each([0, -100, 500.5])("refuses the invalid amount %s", async (amount) => {
    const { world, service } = setup();

    await expect(service.requestOffline(1, amount, "slip-x")).rejects.toMatchObject({
      code: "INVALID_AMOUNT",
    });

    expect(world.store.createRechargeRequest).not.toHaveBeenCalled();
  });

  it("refuses a 2nd offline request on the same Dhaka day", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-26T04:00:00Z")); // 10:00 in Dhaka
    const { world, service } = setup();
    await service.requestOffline(1, 50000, "slip-1");

    await expect(service.requestOffline(1, 60000, "slip-2")).rejects.toMatchObject({
      code: "ALREADY_REQUESTED_TODAY",
    });

    expect(world.store.countRechargeRequests).toHaveBeenLastCalledWith(
      1,
      "OFFLINE",
      new Date("2026-11-25T18:00:00Z"),
      new Date("2026-11-26T18:00:00Z"),
    );
    expect(world.store.createRechargeRequest).toHaveBeenCalledTimes(1);
  });

  it("allows a new request the next day", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-26T04:00:00Z"));
    const { service } = setup();
    await service.requestOffline(1, 50000, "slip-1");

    vi.setSystemTime(new Date("2026-11-27T04:00:00Z"));

    await expect(service.requestOffline(1, 50000, "slip-2")).resolves.toBeUndefined();
  });
});
