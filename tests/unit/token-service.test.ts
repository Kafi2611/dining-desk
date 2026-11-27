import { describe, it, expect, vi } from "vitest";
import type { TokenSeller } from "@/lib/patterns/token-seller/token-seller";
import { TokenService } from "@/lib/services/token-service";
import { setupSellers, TOMORROW, installFakeClock } from "./helpers/seller-setup";

installFakeClock();

function setupService(balances?: Record<number, number>) {
  const { world, regular, guest } = setupSellers(balances);
  const service = new TokenService({
    regularSeller: regular,
    guestSeller: guest,
    settings: world.settings,
    events: world.events,
  });
  return { world, service };
}

describe("TokenService picks the right seller", () => {
  it("buyToken uses the regular seller and buyGuestCoupon uses the guest seller", async () => {
    const fakeSale = { token: {}, price: 1, balanceAfter: 100000 };
    const regularSeller = { sell: vi.fn().mockResolvedValue(fakeSale) } as unknown as TokenSeller;
    const guestSeller = { sell: vi.fn().mockResolvedValue(fakeSale) } as unknown as TokenSeller;
    const { world } = setupSellers();
    const service = new TokenService({ regularSeller, guestSeller, settings: world.settings, events: world.events });

    await service.buyToken(1, "LUNCH", TOMORROW);
    await service.buyGuestCoupon(1, "DINNER", TOMORROW);

    expect(regularSeller.sell).toHaveBeenCalledTimes(1);
    expect(regularSeller.sell).toHaveBeenCalledWith({ userId: 1, mealType: "LUNCH", date: TOMORROW });
    expect(guestSeller.sell).toHaveBeenCalledTimes(1);
    expect(guestSeller.sell).toHaveBeenCalledWith({ userId: 1, mealType: "DINNER", date: TOMORROW });
  });
});

describe("FR12: LowBalance event after a purchase", () => {
  it("balance drops below Tk 80: LowBalance is published once", async () => {
    const { service, world } = setupService({ 1: 11999 });

    await service.buyToken(1, "LUNCH", TOMORROW); // 11999 - 4000 = 7999

    expect(world.events.publish).toHaveBeenCalledTimes(1);
    expect(world.events.publish).toHaveBeenCalledWith({ type: "LowBalance", userId: 1, balance: 7999 });
  });

  it("balance is exactly Tk 80: no event", async () => {
    const { service, world } = setupService({ 1: 12000 });

    await service.buyToken(1, "LUNCH", TOMORROW); // 12000 - 4000 = 8000

    expect(world.events.publish).not.toHaveBeenCalled();
  });

  it("a guest coupon can also trigger LowBalance", async () => {
    const { service, world } = setupService({ 1: 12000 });

    await service.buyGuestCoupon(1, "LUNCH", TOMORROW); // 12000 - 5000 = 7000

    expect(world.events.publish).toHaveBeenCalledWith({ type: "LowBalance", userId: 1, balance: 7000 });
  });

  it("uses the limit from Settings, not a fixed Tk 80", async () => {
    const { service, world } = setupService({ 1: 20000 });
    world.settings.get.mockResolvedValue({
      mealRate: 4000,
      guestRate: 5000,
      cutoffTime: "23:00",
      guestDailyLimit: 10,
      minRecharge: 50000,
      lowBalanceAt: 20000,
    });

    await service.buyToken(1, "LUNCH", TOMORROW); // 16000, below 20000

    expect(world.events.publish).toHaveBeenCalledWith({ type: "LowBalance", userId: 1, balance: 16000 });
  });

  it("a refused sale publishes nothing", async () => {
    const { service, world } = setupService({ 1: 3000 });

    await expect(service.buyToken(1, "LUNCH", TOMORROW)).rejects.toMatchObject({
      code: "INSUFFICIENT_BALANCE",
    });

    expect(world.events.publish).not.toHaveBeenCalled();
  });

  it("a failing listener does not break the purchase", async () => {
    const { service, world } = setupService({ 1: 11999 });
    world.events.publish.mockRejectedValueOnce(new Error("SMS gateway down"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    const sale = await service.buyToken(1, "LUNCH", TOMORROW);

    expect(sale.balanceAfter).toBe(7999);
    expect(world.balanceOf(1)).toBe(7999);
    expect(log).toHaveBeenCalledTimes(1);
    log.mockRestore();
  });
});
