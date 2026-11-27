import { describe, it, expect, vi } from "vitest";
import { setupWalletService } from "./helpers/wallet-world";

// Student One (id 1, Tk 1000, Hall-01) sends money to Student Two (id 2, roll 2203002, Hall-01).
describe("WalletService.transfer", () => {
  it("moves the money to a student of the same hall inside ONE database transaction", async () => {
    const { world, service } = setupWalletService();

    await service.transfer(1, "2203002", 10000, "secret");

    expect(world.hasher.compare).toHaveBeenCalledWith("secret", "hash:secret");
    expect(world.wallets.transaction).toHaveBeenCalledTimes(1);
    expect(world.balanceOf(1)).toBe(90000);
    expect(world.balanceOf(2)).toBe(10000);
    expect(world.store.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        walletId: 10,
        type: "TRANSFER_OUT",
        method: "WALLET",
        amount: 10000,
        status: "COMPLETED",
        balanceAfter: 90000,
      }),
    );
    expect(world.store.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        walletId: 20,
        type: "TRANSFER_IN",
        amount: 10000,
        balanceAfter: 10000,
      }),
    );
    expect(world.events.publish).toHaveBeenCalledTimes(1);
    expect(world.events.publish).toHaveBeenCalledWith({
      type: "MoneyReceived",
      userId: 2,
      amount: 10000,
      fromName: "Student One",
    });
  });

  it("refuses a wrong sender password and changes nothing", async () => {
    const { world, service } = setupWalletService();

    await expect(service.transfer(1, "2203002", 10000, "wrong")).rejects.toMatchObject({
      code: "WRONG_PASSWORD",
    });

    expect(world.wallets.transaction).not.toHaveBeenCalled();
    expect(world.balanceOf(1)).toBe(100000);
    expect(world.events.publish).not.toHaveBeenCalled();
  });

  it("refuses a student of another hall", async () => {
    const { world, service } = setupWalletService();

    // 2203004 is in Hall-02, the sender is in Hall-01.
    await expect(service.transfer(1, "2203004", 10000, "secret")).rejects.toMatchObject({
      code: "DIFFERENT_HALL",
    });

    expect(world.wallets.transaction).not.toHaveBeenCalled();
    expect(world.balanceOf(1)).toBe(100000);
  });

  it("refuses more than the balance, but allows exactly the balance", async () => {
    const { world, service } = setupWalletService();

    await expect(service.transfer(1, "2203002", 100001, "secret")).rejects.toMatchObject({
      code: "INSUFFICIENT_BALANCE",
    });
    expect(world.balanceOf(1)).toBe(100000);
    expect(world.events.publish).not.toHaveBeenCalled();

    await service.transfer(1, "2203002", 100000, "secret");
    expect(world.balanceOf(1)).toBe(0);
    expect(world.balanceOf(2)).toBe(100000);
  });

  it.each([0, -500, 10.5])("refuses the invalid amount %s", async (amount) => {
    const { world, service } = setupWalletService();

    await expect(service.transfer(1, "2203002", amount, "secret")).rejects.toMatchObject({
      code: "INVALID_AMOUNT",
    });

    expect(world.wallets.transaction).not.toHaveBeenCalled();
  });

  it("refuses an unknown roll and refuses sending money to yourself", async () => {
    const { world, service } = setupWalletService();

    await expect(service.transfer(1, "0000000", 10000, "secret")).rejects.toMatchObject({
      code: "RECIPIENT_NOT_FOUND",
    });
    await expect(service.transfer(1, "2203001", 10000, "secret")).rejects.toMatchObject({
      code: "SELF_TRANSFER",
    });

    expect(world.wallets.transaction).not.toHaveBeenCalled();
  });

  it("rolls the debit back when the credit fails (all or nothing)", async () => {
    const { world, service } = setupWalletService();
    vi.mocked(world.store.credit).mockRejectedValueOnce(new Error("database went away"));

    await expect(service.transfer(1, "2203002", 10000, "secret")).rejects.toThrow(
      "database went away",
    );

    expect(world.store.debit).toHaveBeenCalledTimes(1); // the debit really happened...
    expect(world.balanceOf(1)).toBe(100000); // ...and was undone
    expect(world.balanceOf(2)).toBe(0);
    expect(world.state.transactions).toHaveLength(0);
    expect(world.events.publish).not.toHaveBeenCalled();
  });
});
