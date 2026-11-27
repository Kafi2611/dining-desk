// Pattern: Factory Method (creational).
// GoF role: GuestCouponSeller is a ConcreteCreator. It creates GuestCoupon products and adds the hall limit.
import { GuestCoupon } from "@/lib/patterns/token-seller/guest-coupon";
import { TokenSeller, type SaleContext } from "@/lib/patterns/token-seller/token-seller";
import type { TokenInput } from "@/lib/patterns/token-seller/meal-token";
import { TokenError } from "@/lib/services/token-errors";

export class GuestCouponSeller extends TokenSeller {
  // FR8: the whole hall can sell only `guestDailyLimit` coupons for one date.
  protected override async checkExtraRules({ request, hallId, settings, tx }: SaleContext): Promise<void> {
    const sold = await tx.countGuestCoupons(hallId, request.date);
    if (sold >= settings.guestDailyLimit) {
      throw new TokenError(
        "GUEST_LIMIT_REACHED",
        `The hall already sold ${settings.guestDailyLimit} guest coupons for that date`,
      );
    }
  }

  protected createToken(input: TokenInput): GuestCoupon {
    return new GuestCoupon(input);
  }
}
