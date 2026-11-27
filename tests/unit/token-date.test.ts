import { describe, it, expect, vi, afterEach } from "vitest";
import { setupSellers, TOMORROW, installFakeClock } from "./helpers/seller-setup";

describe("FR6: the meal date must be tomorrow", () => {
  installFakeClock(); // 16:00 on Nov 27 in Dhaka

  it("today is refused", async () => {
    const { regular, world } = setupSellers();

    await expect(
      regular.sell({ userId: 1, mealType: "LUNCH", date: "2026-11-27" }),
    ).rejects.toMatchObject({ name: "TokenError", code: "NOT_TOMORROW" });

    expect(world.store.debit).not.toHaveBeenCalled();
  });

  it("the day after tomorrow is refused", async () => {
    const { regular } = setupSellers();

    await expect(
      regular.sell({ userId: 1, mealType: "LUNCH", date: "2026-11-29" }),
    ).rejects.toMatchObject({ code: "NOT_TOMORROW" });
  });

  it("tomorrow is OK", async () => {
    const { regular } = setupSellers();

    const sale = await regular.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW });

    expect(sale.token.input.date).toBe("2026-11-28");
  });
});

describe("FR6: 'tomorrow' follows the Dhaka calendar, not UTC", () => {
  afterEach(() => vi.useRealTimers());

  it("at 00:30 in Dhaka (still the previous day in UTC), tomorrow is the next Dhaka day", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-27T18:30:00Z")); // 00:30 on Nov 28 in Dhaka
    const { regular } = setupSellers();

    await expect(
      regular.sell({ userId: 1, mealType: "LUNCH", date: "2026-11-28" }),
    ).rejects.toMatchObject({ code: "NOT_TOMORROW" });

    const sale = await regular.sell({ userId: 1, mealType: "LUNCH", date: "2026-11-29" });
    expect(sale.token.input.date).toBe("2026-11-29");
  });
});
