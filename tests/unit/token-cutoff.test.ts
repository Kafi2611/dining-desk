import { describe, it, expect, vi, afterEach } from "vitest";
import { TokenError } from "@/lib/services/token-errors";
import { setupSellers, TOMORROW } from "./helpers/seller-setup";

afterEach(() => vi.useRealTimers());

// Asia/Dhaka is UTC+6, so 22:59 in Dhaka is 16:59 UTC.
function clockAt(utc: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(utc));
}

describe("FR6: tokens are sold only until the cutoff", () => {
  it("22:59 in Dhaka: the sale is OK", async () => {
    clockAt("2026-11-27T16:59:00Z");
    const { regular } = setupSellers();

    const sale = await regular.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW });

    expect(sale.price).toBe(4000);
  });

  it("23:00 in Dhaka: the sale is refused and no money moves", async () => {
    clockAt("2026-11-27T17:00:00Z");
    const { regular, world } = setupSellers();

    await expect(regular.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW })).rejects.toMatchObject({
      name: "TokenError",
      code: "AFTER_CUTOFF",
    });

    expect(world.store.debit).not.toHaveBeenCalled();
    expect(world.balanceOf(1)).toBe(100000);
  });

  it("uses the cutoff time from Settings, not a fixed 23:00", async () => {
    clockAt("2026-11-27T16:00:00Z"); // 22:00 in Dhaka
    const { regular, world } = setupSellers();
    world.settings.get.mockResolvedValue({
      mealRate: 4000,
      guestRate: 5000,
      cutoffTime: "22:00",
      guestDailyLimit: 10,
      minRecharge: 50000,
      lowBalanceAt: 8000,
    });

    const sale = regular.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW });

    await expect(sale).rejects.toBeInstanceOf(TokenError);
  });
});
