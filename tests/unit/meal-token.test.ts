import { describe, it, expect } from "vitest";
import { GuestCoupon } from "@/lib/patterns/token-seller/guest-coupon";
import { RegularToken } from "@/lib/patterns/token-seller/regular-token";
import type { SettingsRecord } from "@/lib/repositories/settings-repository";

const settings: SettingsRecord = {
  mealRate: 4000,
  guestRate: 5000,
  cutoffTime: "23:00",
  guestDailyLimit: 10,
  minRecharge: 50000,
  lowBalanceAt: 8000,
};

const input = { userId: 1, date: "2026-11-28" };

describe("RegularToken", () => {
  it("is a REGULAR token paid as a meal purchase", () => {
    const token = new RegularToken({ ...input, mealType: "LUNCH" });

    expect(token.kind).toBe("REGULAR");
    expect(token.transactionType).toBe("MEAL_PURCHASE");
  });

  it("costs the meal rate for one meal (Lunch or Dinner)", () => {
    expect(new RegularToken({ ...input, mealType: "LUNCH" }).price(settings)).toBe(4000);
    expect(new RegularToken({ ...input, mealType: "DINNER" }).price(settings)).toBe(4000);
  });

  it("costs the meal rate twice for Both", () => {
    expect(new RegularToken({ ...input, mealType: "BOTH" }).price(settings)).toBe(8000);
  });

  it("reads the rate from settings, not from a fixed number", () => {
    const token = new RegularToken({ ...input, mealType: "LUNCH" });

    expect(token.price({ ...settings, mealRate: 4500 })).toBe(4500);
  });
});

describe("GuestCoupon", () => {
  it("is a GUEST token paid as a guest purchase", () => {
    const token = new GuestCoupon({ ...input, mealType: "LUNCH" });

    expect(token.kind).toBe("GUEST");
    expect(token.transactionType).toBe("GUEST_PURCHASE");
  });

  it("costs the guest rate per meal", () => {
    expect(new GuestCoupon({ ...input, mealType: "DINNER" }).price(settings)).toBe(5000);
    expect(new GuestCoupon({ ...input, mealType: "BOTH" }).price(settings)).toBe(10000);
  });
});
