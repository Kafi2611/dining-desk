// Pattern: Factory Method (creational).
// GoF role: MealToken is the abstract Product. RegularToken and GuestCoupon are the ConcreteProducts.
import type { SettingsRecord } from "@/lib/repositories/settings-repository";
import type { MealType, NewMealToken, TokenKind } from "@/lib/repositories/token-repository";
import type { TransactionType } from "@/lib/repositories/wallet-repository";

export interface TokenInput {
  userId: number;
  date: string; // "YYYY-MM-DD"
  mealType: MealType;
}

export abstract class MealToken {
  abstract readonly kind: TokenKind;
  abstract readonly transactionType: TransactionType;

  constructor(readonly input: TokenInput) {}

  // Price in poisha. Each type says which rate it uses.
  abstract price(settings: SettingsRecord): number;

  protected get mealCount(): number {
    return this.input.mealType === "BOTH" ? 2 : 1;
  }

  toRecord(settings: SettingsRecord): NewMealToken {
    return { ...this.input, kind: this.kind, price: this.price(settings) };
  }
}
