import { describe, it, expect } from "vitest";
import { setupSellers, TOMORROW, useFakeClock } from "./helpers/seller-setup";

useFakeClock();

describe("FR6: a token is sold only if the balance is enough", () => {
  it("balance = price: OK, and the balance becomes 0", async () => {
    const { regular, world } = setupSellers({ 1: 4000 });

    const sale = await regular.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW });

    expect(sale.balanceAfter).toBe(0);
    expect(world.balanceOf(1)).toBe(0);
  });

  it("balance = price - 1 poisha: refused, nothing is saved", async () => {
    const { regular, world } = setupSellers({ 1: 3999 });

    await expect(regular.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW })).rejects.toMatchObject({
      name: "TokenError",
      code: "INSUFFICIENT_BALANCE",
    });

    expect(world.balanceOf(1)).toBe(3999);
    expect(world.store.addTransaction).not.toHaveBeenCalled();
    expect(world.store.addToken).not.toHaveBeenCalled();
  });

  it("the price of Both is two meals, so Tk 40 is not enough for Both", async () => {
    const { regular } = setupSellers({ 1: 4000 });

    await expect(regular.sell({ userId: 1, mealType: "BOTH", date: TOMORROW })).rejects.toMatchObject({
      code: "INSUFFICIENT_BALANCE",
    });
  });

  it("a guest coupon is checked against the guest price", async () => {
    const { guest } = setupSellers({ 1: 4999 });

    await expect(guest.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW })).rejects.toMatchObject({
      code: "INSUFFICIENT_BALANCE",
    });
  });
});
