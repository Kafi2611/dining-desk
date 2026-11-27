import { describe, it, expect } from "vitest";
import { setupWalletService } from "./helpers/wallet-world";

const MANAGER_ID = 9;

// Student 1 has Tk 1000. They already sent an offline request of Tk 500 (request id 1).
async function setupWithRequest() {
  const ctx = setupWalletService();
  await ctx.service.requestOffline(1, 50000, "slip-1");
  return ctx;
}

describe("WalletService.approveOffline", () => {
  it("adds the money, marks the request approved, records it and tells the student", async () => {
    const { world, service } = await setupWithRequest();

    await service.approveOffline(MANAGER_ID, 1);

    expect(world.balanceOf(1)).toBe(150000);
    expect(world.store.decideRechargeRequest).toHaveBeenCalledWith(
      1,
      "APPROVED",
      MANAGER_ID,
      expect.any(Date),
    );
    expect(world.store.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "RECHARGE",
        method: "OFFLINE",
        amount: 50000,
        status: "COMPLETED",
        balanceAfter: 150000,
      }),
    );
    expect(world.events.publish).toHaveBeenCalledTimes(1);
    expect(world.events.publish).toHaveBeenCalledWith({
      type: "RechargeApproved",
      userId: 1,
      amount: 50000,
    });
  });

  it("refuses to decide the same request twice", async () => {
    const { world, service } = await setupWithRequest();
    await service.approveOffline(MANAGER_ID, 1);

    await expect(service.approveOffline(MANAGER_ID, 1)).rejects.toMatchObject({
      code: "REQUEST_NOT_PENDING",
    });

    expect(world.balanceOf(1)).toBe(150000);
  });

  it("still succeeds when publishing the event fails (the money already moved)", async () => {
    const { world, service } = await setupWithRequest();
    world.events.publish.mockRejectedValue(new Error("bell is broken"));

    await expect(service.approveOffline(MANAGER_ID, 1)).resolves.toBeUndefined();

    expect(world.balanceOf(1)).toBe(150000);
  });

  it("refuses a request that does not exist", async () => {
    const { service } = await setupWithRequest();

    await expect(service.approveOffline(MANAGER_ID, 99)).rejects.toMatchObject({
      code: "REQUEST_NOT_FOUND",
    });
  });
});

describe("WalletService.rejectOffline", () => {
  it("keeps the balance, marks the request rejected and tells the student", async () => {
    const { world, service } = await setupWithRequest();

    await service.rejectOffline(MANAGER_ID, 1);

    expect(world.balanceOf(1)).toBe(100000);
    expect(world.store.decideRechargeRequest).toHaveBeenCalledWith(
      1,
      "REJECTED",
      MANAGER_ID,
      expect.any(Date),
    );
    expect(world.store.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ type: "RECHARGE", method: "OFFLINE", status: "REJECTED" }),
    );
    expect(world.events.publish).toHaveBeenCalledTimes(1);
    expect(world.events.publish).toHaveBeenCalledWith({
      type: "RechargeRejected",
      userId: 1,
      amount: 50000,
    });
  });
});
