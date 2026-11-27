import { describe, it, expect } from "vitest";
import { setupSellers, TOMORROW, installFakeClock } from "./helpers/seller-setup";

installFakeClock();

describe("FR7: 1 regular token per student per date", () => {
  it("a 2nd regular token for the same date is refused and costs nothing", async () => {
    const { regular, world } = setupSellers();
    await regular.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW });

    await expect(regular.sell({ userId: 1, mealType: "DINNER", date: TOMORROW })).rejects.toMatchObject({
      name: "TokenError",
      code: "ALREADY_BOUGHT",
    });

    expect(world.store.findToken).toHaveBeenCalledWith(1, TOMORROW, "REGULAR");
    expect(world.store.debit).toHaveBeenCalledTimes(1);
    expect(world.balanceOf(1)).toBe(96000);
    expect(world.tokens).toHaveLength(1);
  });

  it("another student can still buy a token for the same date", async () => {
    const { regular } = setupSellers({ 1: 100000, 2: 100000 });
    await regular.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW });

    const sale = await regular.sell({ userId: 2, mealType: "LUNCH", date: TOMORROW });

    expect(sale.price).toBe(4000);
  });
});

describe("FR8: 1 guest coupon per student per date", () => {
  it("a 2nd guest coupon for the same date is refused", async () => {
    const { guest, world } = setupSellers();
    await guest.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW });

    await expect(guest.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW })).rejects.toMatchObject({
      code: "ALREADY_BOUGHT",
    });

    expect(world.store.findToken).toHaveBeenCalledWith(1, TOMORROW, "GUEST");
    expect(world.balanceOf(1)).toBe(95000);
  });

  it("a student can have 1 regular token and 1 guest coupon for the same date", async () => {
    const { regular, guest, world } = setupSellers();

    await regular.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW });
    await guest.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW });

    expect(world.tokens.map((t) => t.kind)).toEqual(["REGULAR", "GUEST"]);
  });
});
