import { describe, it, expect, vi } from "vitest";
import { GuestCoupon } from "@/lib/patterns/token-seller/guest-coupon";
import { MealToken } from "@/lib/patterns/token-seller/meal-token";
import { RegularToken } from "@/lib/patterns/token-seller/regular-token";
import { TokenSeller } from "@/lib/patterns/token-seller/token-seller";
import type { SettingsRecord } from "@/lib/repositories/settings-repository";
import { setupSellers, TOMORROW, useFakeClock } from "./helpers/seller-setup";

useFakeClock();

describe("Factory Method: each seller creates the right product", () => {
  it("RegularTokenSeller sells a RegularToken", async () => {
    const { regular } = setupSellers();

    const sale = await regular.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW });

    expect(sale.token).toBeInstanceOf(RegularToken);
    expect(sale.token.input).toEqual({ userId: 1, mealType: "LUNCH", date: TOMORROW });
  });

  it("GuestCouponSeller sells a GuestCoupon", async () => {
    const { guest } = setupSellers();

    const sale = await guest.sell({ userId: 1, mealType: "DINNER", date: TOMORROW });

    expect(sale.token).toBeInstanceOf(GuestCoupon);
  });

  it("a new token type needs only a new seller and a new product (no edits to old code)", async () => {
    class FestToken extends MealToken {
      readonly kind = "GUEST" as const;
      readonly transactionType = "GUEST_PURCHASE" as const;
      price(_settings: SettingsRecord) {
        return 1234;
      }
    }
    const { world } = setupSellers();
    class FestSeller extends TokenSeller {
      protected createToken(input: ConstructorParameters<typeof FestToken>[0]) {
        return new FestToken(input);
      }
    }
    const fest = new FestSeller({ tokens: world.repository, users: world.users, settings: world.settings });

    const sale = await fest.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW });

    expect(sale.price).toBe(1234);
    expect(world.balanceOf(1)).toBe(100000 - 1234);
  });
});

describe("selling a token", () => {
  it("takes the price from the wallet, writes a transaction and saves the token", async () => {
    const { regular, world } = setupSellers();

    const sale = await regular.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW });

    expect(sale.price).toBe(4000);
    expect(sale.balanceAfter).toBe(96000);
    expect(world.balanceOf(1)).toBe(96000);
    expect(world.store.debit).toHaveBeenCalledTimes(1);
    expect(world.store.debit).toHaveBeenCalledWith(10, 4000);
    expect(world.store.addTransaction).toHaveBeenCalledWith({
      walletId: 10,
      type: "MEAL_PURCHASE",
      method: "WALLET",
      amount: 4000,
      status: "COMPLETED",
      balanceAfter: 96000,
      note: `LUNCH for ${TOMORROW}`,
    });
    expect(world.store.addToken).toHaveBeenCalledWith({
      userId: 1,
      date: TOMORROW,
      mealType: "LUNCH",
      kind: "REGULAR",
      price: 4000,
    });
  });

  it("charges the guest rate and records a guest purchase", async () => {
    const { guest, world } = setupSellers();

    await guest.sell({ userId: 1, mealType: "BOTH", date: TOMORROW });

    expect(world.store.debit).toHaveBeenCalledWith(10, 10000);
    expect(world.store.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ type: "GUEST_PURCHASE", amount: 10000 }),
    );
  });

  it("undoes the debit if saving the token fails (all-or-nothing)", async () => {
    const { regular, world } = setupSellers();
    vi.mocked(world.store.addToken).mockRejectedValueOnce(new Error("database down"));

    await expect(regular.sell({ userId: 1, mealType: "LUNCH", date: TOMORROW })).rejects.toThrow(
      "database down",
    );

    expect(world.balanceOf(1)).toBe(100000);
    expect(world.tokens).toHaveLength(0);
  });
});
