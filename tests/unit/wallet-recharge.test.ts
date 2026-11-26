import { describe, it, expect } from "vitest";
import { setupWalletService as setup } from "./helpers/wallet-world";

describe("WalletService.rechargeOnline", () => {
  it("refuses Tk 499 (below the minimum of Tk 500) and never calls bKash", async () => {
    const { world, service } = setup();

    await expect(service.rechargeOnline(1, 49900)).rejects.toMatchObject({
      code: "BELOW_MINIMUM",
    });

    expect(world.onlineGateway.charge).not.toHaveBeenCalled();
    expect(world.balanceOf(1)).toBe(100000);
  });

  it("builds the minimum message from settings.minRecharge", async () => {
    const { world, service } = setup();
    world.settings.get.mockResolvedValue({ ...(await world.settings.get()), minRecharge: 70000 });

    await expect(service.rechargeOnline(1, 60000)).rejects.toThrow("The minimum recharge is Tk 700");
    await expect(service.requestOffline(1, 60000, "slip")).rejects.toThrow(
      "The minimum recharge is Tk 700",
    );
  });

  it("refuses an amount that is not a whole number of poisha", async () => {
    const { world, service } = setup();

    await expect(service.rechargeOnline(1, 50000.5)).rejects.toMatchObject({
      code: "INVALID_AMOUNT",
    });

    expect(world.onlineGateway.charge).not.toHaveBeenCalled();
  });

  it("accepts exactly Tk 500: charges the gateway, adds the money, records it", async () => {
    const { world, service } = setup();

    await service.rechargeOnline(1, 50000);

    expect(world.onlineGateway.charge).toHaveBeenCalledTimes(1);
    expect(world.onlineGateway.charge).toHaveBeenCalledWith(50000, expect.any(String));
    expect(world.store.credit).toHaveBeenCalledWith(10, 50000);
    expect(world.balanceOf(1)).toBe(150000);
    expect(world.store.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        walletId: 10,
        type: "RECHARGE",
        method: "BKASH",
        amount: 50000,
        status: "COMPLETED",
        balanceAfter: 150000,
      }),
    );
  });

  it.each(["FAILED", "TIMEOUT"] as const)(
    "does not change the balance when bKash returns %s",
    async (status) => {
      const { world, service } = setup();
      world.onlineGateway.charge.mockResolvedValue({ status, message: "no" });

      await expect(service.rechargeOnline(1, 50000)).rejects.toMatchObject({
        code: "PAYMENT_FAILED",
      });

      expect(world.store.credit).not.toHaveBeenCalled();
      expect(world.balanceOf(1)).toBe(100000);
      expect(world.store.addTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ type: "RECHARGE", method: "BKASH", status: "FAILED" }),
      );
    },
  );
});
