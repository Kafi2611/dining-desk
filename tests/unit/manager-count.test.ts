import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  MealCountRepository,
  MealCountRow,
} from "@/lib/repositories/meal-count-repository";
import type { SettingsAdmin } from "@/lib/repositories/settings-repository";
import { ManagerService } from "@/lib/services/manager-service";

function setup(rows: MealCountRow[]) {
  const counts: MealCountRepository = {
    countByKindAndMealType: vi.fn().mockResolvedValue(rows),
  };
  const settings = { get: vi.fn(), update: vi.fn() } as unknown as SettingsAdmin;
  return { counts, service: new ManagerService({ counts, settings }) };
}

describe("ManagerService.tomorrowCounts (FR11)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-27T10:00:00Z")); // 16:00 in Dhaka
  });
  afterEach(() => vi.useRealTimers());

  it("adds up Lunch, Dinner, Both and guests", async () => {
    const { service } = setup([
      { kind: "REGULAR", mealType: "LUNCH", count: 3 },
      { kind: "REGULAR", mealType: "DINNER", count: 2 },
      { kind: "REGULAR", mealType: "BOTH", count: 4 },
      { kind: "GUEST", mealType: "LUNCH", count: 1 },
      { kind: "GUEST", mealType: "BOTH", count: 1 },
    ]);

    const result = await service.tomorrowCounts();

    // Both counts for lunch AND dinner. Guest coupons are counted on their own.
    expect(result).toEqual({ date: "2026-11-28", lunch: 7, dinner: 6, guests: 2 });
  });

  it("returns zeros when nothing was sold", async () => {
    const { service } = setup([]);

    const result = await service.tomorrowCounts();

    expect(result).toEqual({ date: "2026-11-28", lunch: 0, dinner: 0, guests: 0 });
  });

  it("asks for Dhaka's tomorrow, not the UTC date", async () => {
    // 18:30 UTC is already 00:30 on the next day in Dhaka.
    vi.setSystemTime(new Date("2026-11-27T18:30:00Z"));
    const { counts, service } = setup([]);

    await service.tomorrowCounts();

    expect(counts.countByKindAndMealType).toHaveBeenCalledTimes(1);
    expect(counts.countByKindAndMealType).toHaveBeenCalledWith("2026-11-29");
  });
});
