import type { EventBus } from "@/lib/patterns/events/event-bus";
import type { SaleResult, TokenSeller } from "@/lib/patterns/token-seller/token-seller";
import type { SettingsRepository } from "@/lib/repositories/settings-repository";
import type { MealType } from "@/lib/repositories/token-repository";

export interface TokenServiceDeps {
  regularSeller: TokenSeller; // RegularTokenSeller in the app
  guestSeller: TokenSeller; // GuestCouponSeller in the app
  settings: SettingsRepository;
  events: Pick<EventBus, "publish">;
}

// FR6-FR8. The selling rules live in the sellers; this service picks one and tells others about low balance.
export class TokenService {
  constructor(private readonly deps: TokenServiceDeps) {}

  buyToken(userId: number, mealType: MealType, date: string): Promise<SaleResult> {
    return this.sell(this.deps.regularSeller, userId, mealType, date);
  }

  buyGuestCoupon(userId: number, mealType: MealType, date: string): Promise<SaleResult> {
    return this.sell(this.deps.guestSeller, userId, mealType, date);
  }

  private async sell(
    seller: TokenSeller,
    userId: number,
    mealType: MealType,
    date: string,
  ): Promise<SaleResult> {
    const sale = await seller.sell({ userId, mealType, date });
    await this.notifyIfLow(userId, sale.balanceAfter);
    return sale;
  }

  // Sent after the money has moved. A broken listener must never undo or hide the purchase.
  private async notifyIfLow(userId: number, balance: number): Promise<void> {
    try {
      const { lowBalanceAt } = await this.deps.settings.get();
      if (balance < lowBalanceAt) {
        await this.deps.events.publish({ type: "LowBalance", userId, balance });
      }
    } catch (e) {
      console.error("Could not publish event:", e);
    }
  }
}
