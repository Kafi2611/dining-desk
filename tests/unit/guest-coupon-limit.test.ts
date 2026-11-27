import { describe, it, expect, vi } from "vitest";
import { setupSellers, TOMORROW, installFakeClock } from "./helpers/seller-setup";

installFakeClock();

describe("FR8: guest coupons are limited per day for the whole hall", () => {
  it("the 10th coupon of the day is OK", async () => {
    const { guest, world } = setupSellers();
    vi.mocked(world.store.countGuestCoupons).mockResolvedValue(9);

    const sale = await guest.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW });

    expect(sale.price).toBe(5000);
    expect(world.store.countGuestCoupons).toHaveBeenCalledWith(1, TOMORROW);
  });

  it("the 11th coupon of the day is refused and no money moves", async () => {
    const { guest, world } = setupSellers();
    vi.mocked(world.store.countGuestCoupons).mockResolvedValue(10);

    await expect(guest.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW })).rejects.toMatchObject({
      name: "TokenError",
      code: "GUEST_LIMIT_REACHED",
    });

    expect(world.store.debit).not.toHaveBeenCalled();
    expect(world.balanceOf(1)).toBe(100000);
    expect(world.tokens).toHaveLength(0);
  });

  it("uses the limit from Settings, not a fixed 10", async () => {
    const { guest, world } = setupSellers();
    world.settings.get.mockResolvedValue({
      mealRate: 4000,
      guestRate: 5000,
      cutoffTime: "23:00",
      guestDailyLimit: 3,
      minRecharge: 50000,
      lowBalanceAt: 8000,
    });
    vi.mocked(world.store.countGuestCoupons).mockResolvedValue(3);

    await expect(guest.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW })).rejects.toMatchObject({
      code: "GUEST_LIMIT_REACHED",
    });
  });

  it("counts coupons of the student's own hall only", async () => {
    const { guest, world } = setupSellers({ 1: 100000, 4: 100000 });

    await guest.sell({ userId: 4, mealType: "LUNCH", date: TOMORROW }); // student 4 is in hall 2

    expect(world.store.countGuestCoupons).toHaveBeenCalledWith(2, TOMORROW);
  });

  it("the daily limit does not apply to regular tokens", async () => {
    const { regular, world } = setupSellers();
    vi.mocked(world.store.countGuestCoupons).mockResolvedValue(10);

    const sale = await regular.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW });

    expect(sale.price).toBe(4000);
    expect(world.store.countGuestCoupons).not.toHaveBeenCalled();
  });
});
