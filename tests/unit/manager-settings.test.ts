import { describe, expect, it, vi } from "vitest";
import type { MealCountRepository } from "@/lib/repositories/meal-count-repository";
import type { SettingsAdmin, SettingsUpdate } from "@/lib/repositories/settings-repository";
import { ManagerService } from "@/lib/services/manager-service";
import { SettingsError } from "@/lib/services/settings-errors";

const VALID: SettingsUpdate = {
  mealRate: 4500,
  guestRate: 6000,
  cutoffTime: "22:30",
  guestDailyLimit: 12,
};

function setup() {
  const settings: SettingsAdmin = {
    get: vi.fn(),
    update: vi.fn().mockImplementation(async (data: SettingsUpdate) => ({
      ...data,
      minRecharge: 50000,
      lowBalanceAt: 8000,
    })),
  };
  const counts: MealCountRepository = { countByKindAndMealType: vi.fn() };
  return { settings, service: new ManagerService({ counts, settings }) };
}

describe("ManagerService.updateSettings (FR10)", () => {
  it("saves valid settings", async () => {
    const { settings, service } = setup();

    await service.updateSettings(VALID);

    expect(settings.update).toHaveBeenCalledTimes(1);
    expect(settings.update).toHaveBeenCalledWith(VALID);
  });

  it.each([
    ["meal rate is 0", { mealRate: 0 }],
    ["meal rate is negative", { mealRate: -4000 }],
    ["meal rate is not a whole number of poisha", { mealRate: 40.5 }],
    ["guest rate is 0", { guestRate: 0 }],
    ["guest rate is negative", { guestRate: -5000 }],
    ["guest rate is not a whole number of poisha", { guestRate: 50.5 }],
  ])("refuses when the %s", async (_name, change) => {
    const { settings, service } = setup();

    await expect(service.updateSettings({ ...VALID, ...change })).rejects.toBeInstanceOf(
      SettingsError,
    );
    expect(settings.update).not.toHaveBeenCalled();
  });
});
