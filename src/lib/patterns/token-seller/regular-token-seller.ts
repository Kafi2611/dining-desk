// Pattern: Factory Method (creational).
// GoF role: RegularTokenSeller is a ConcreteCreator. It creates RegularToken products.
import { RegularToken } from "@/lib/patterns/token-seller/regular-token";
import { TokenSeller } from "@/lib/patterns/token-seller/token-seller";
import type { TokenInput } from "@/lib/patterns/token-seller/meal-token";

export class RegularTokenSeller extends TokenSeller {
  protected createToken(input: TokenInput): RegularToken {
    return new RegularToken(input);
  }
}
