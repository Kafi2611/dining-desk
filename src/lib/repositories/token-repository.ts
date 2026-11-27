import type { WalletStore } from "@/lib/repositories/wallet-repository";

export type MealType = "LUNCH" | "DINNER" | "BOTH";
export type TokenKind = "REGULAR" | "GUEST";

export interface NewMealToken {
  userId: number;
  date: string; // meal day in Asia/Dhaka, "YYYY-MM-DD"
  mealType: MealType;
  kind: TokenKind;
  price: number; // poisha
}

export interface MealTokenRecord extends NewMealToken {
  id: number;
}

// Everything a token sale must do inside ONE database transaction.
// The wallet methods are the same ones the wallet service uses.
export interface TokenStore extends Pick<WalletStore, "getWalletByUserId" | "debit" | "addTransaction"> {
  findToken(userId: number, date: string, kind: TokenKind): Promise<MealTokenRecord | null>;
  // Guest coupons already sold for this date to students of this hall.
  countGuestCoupons(hallId: number, date: string): Promise<number>;
  addToken(data: NewMealToken): Promise<void>;
}

export interface TokenRepository extends TokenStore {
  // All-or-nothing: if fn throws, every change made through `tx` is undone.
  transaction<T>(fn: (tx: TokenStore) => Promise<T>): Promise<T>;
}
