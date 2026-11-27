// Pattern: Factory Method (creational).
// GoF role: RegularToken is a ConcreteProduct (made by RegularTokenSeller).
import { MealToken } from "@/lib/patterns/token-seller/meal-token";
import type { SettingsRecord } from "@/lib/repositories/settings-repository";

export class RegularToken extends MealToken {
  readonly kind = "REGULAR";
  readonly transactionType = "MEAL_PURCHASE";

  price(settings: SettingsRecord): number {
    return settings.mealRate * this.mealCount;
  }
}
