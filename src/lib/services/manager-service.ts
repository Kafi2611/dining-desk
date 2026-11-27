import type { MealCountRepository } from "@/lib/repositories/meal-count-repository";
import type { SettingsAdmin } from "@/lib/repositories/settings-repository";
import { dhakaTomorrow } from "@/lib/services/dhaka-time";

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
}
