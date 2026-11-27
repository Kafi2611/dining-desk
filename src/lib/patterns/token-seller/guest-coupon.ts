// Pattern: Factory Method (creational).
// GoF role: GuestCoupon is a ConcreteProduct (made by GuestCouponSeller).
import { MealToken } from "@/lib/patterns/token-seller/meal-token";
import type { SettingsRecord } from "@/lib/repositories/settings-repository";

export class GuestCoupon extends MealToken {
  readonly kind = "GUEST";
  readonly transactionType = "GUEST_PURCHASE";

  price(settings: SettingsRecord): number {
    return settings.guestRate * this.mealCount;
  }
}
