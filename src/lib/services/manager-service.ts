import type { MealCountRepository } from "@/lib/repositories/meal-count-repository";
import type {
  SettingsAdmin,
  SettingsRecord,
  SettingsUpdate,
} from "@/lib/repositories/settings-repository";
import { dhakaTomorrow } from "@/lib/services/dhaka-time";
import { SettingsError } from "@/lib/services/settings-errors";

export interface ManagerServiceDeps {
  counts: MealCountRepository;
  settings: SettingsAdmin;
}

export interface TomorrowCounts {
  date: string;
  lunch: number;
  dinner: number;
  guests: number;
}

// Manager rules: tomorrow's meal count (FR11) and the settings (FR10).
export class ManagerService {
  constructor(private readonly deps: ManagerServiceDeps) {}

  // "Both" counts for lunch and for dinner. Guest coupons are counted on their own.
  async tomorrowCounts(): Promise<TomorrowCounts> {
    const date = dhakaTomorrow(new Date());
    const rows = await this.deps.counts.countByKindAndMealType(date);
    const result: TomorrowCounts = { date, lunch: 0, dinner: 0, guests: 0 };
    for (const row of rows) {
      if (row.kind === "GUEST") {
        result.guests += row.count;
      } else {
        if (row.mealType !== "DINNER") result.lunch += row.count;
        if (row.mealType !== "LUNCH") result.dinner += row.count;
      }
    }
    return result;
  }

  // FR10: the 4 values the manager can change. Every rule is checked before anything is saved.
  async updateSettings(data: SettingsUpdate): Promise<SettingsRecord> {
    assertValidRate(data.mealRate, "Meal rate");
    assertValidRate(data.guestRate, "Guest rate");
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(data.cutoffTime)) {
      throw new SettingsError("INVALID_CUTOFF", "Cutoff time must look like 23:00 (HH:MM, 24-hour)");
    }
    return this.deps.settings.update(data);
  }
}

// Rates are whole poisha and must be more than 0.
function assertValidRate(rate: number, label: string): void {
  if (!Number.isInteger(rate) || rate <= 0) {
    throw new SettingsError("INVALID_RATE", `${label} must be more than 0`);
  }
}
