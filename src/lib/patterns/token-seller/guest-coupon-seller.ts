// Pattern: Factory Method (creational).
// GoF role: GuestCouponSeller is a ConcreteCreator. It creates GuestCoupon products.
import { GuestCoupon } from "@/lib/patterns/token-seller/guest-coupon";
import { TokenSeller } from "@/lib/patterns/token-seller/token-seller";
import type { TokenInput } from "@/lib/patterns/token-seller/meal-token";

export class GuestCouponSeller extends TokenSeller {
  protected createToken(input: TokenInput): GuestCoupon {
    return new GuestCoupon(input);
  }
}
