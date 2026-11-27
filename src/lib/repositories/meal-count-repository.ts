import type { MealType, TokenKind } from "@/lib/repositories/token-repository";

// How many tokens exist for one meal day, grouped by kind and meal type.
export interface MealCountRow {
  kind: TokenKind;
  mealType: MealType;
  count: number;
}

export interface MealCountRepository {
  // `date` is the meal day in Asia/Dhaka, written "YYYY-MM-DD".
  countByKindAndMealType(date: string): Promise<MealCountRow[]>;
}
