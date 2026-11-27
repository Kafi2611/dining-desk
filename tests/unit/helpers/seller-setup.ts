import { afterEach, beforeEach, vi } from "vitest";
import { GuestCouponSeller } from "@/lib/patterns/token-seller/guest-coupon-seller";
import { RegularTokenSeller } from "@/lib/patterns/token-seller/regular-token-seller";
import { makeTokenWorld } from "./token-world";

// Fake clock: 16:00 on Nov 27 in Dhaka. So "tomorrow" is 2026-11-28.
export const NOW_DHAKA_16_00 = new Date("2026-11-27T10:00:00Z");
export const TOMORROW = "2026-11-28";

export function installFakeClock(now: Date = NOW_DHAKA_16_00) {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });
  afterEach(() => vi.useRealTimers());
}

// Both sellers wired to the fake database. Student 1 has Tk 1000, student 2 has Tk 0.
export function setupSellers(balances?: Record<number, number>) {
  const world = makeTokenWorld(balances);
  const deps = { tokens: world.repository, users: world.users, settings: world.settings };
  return {
    world,
    regular: new RegularTokenSeller(deps),
    guest: new GuestCouponSeller(deps),
  };
}
